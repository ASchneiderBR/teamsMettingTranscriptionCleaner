import { AppError } from "./errors";
import { normalizeSpaces, normalizeSpeakerName, parseDocxTimeToSeconds } from "./normalize";
import type { DocxSegment, ParsedDocxTranscript } from "./types";

const WORD_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";

export function parseDocxXml(xml: string): ParsedDocxTranscript {
  const parser = new DOMParser();
  const documentXml = parser.parseFromString(xml, "application/xml");
  if (documentXml.getElementsByTagName("parsererror").length) {
    throw new AppError("invalid_docx", "Falha ao interpretar o XML do DOCX.");
  }

  const paragraphs = getParagraphs(documentXml);
  const segments: DocxSegment[] = [];

  for (const paragraph of paragraphs) {
    const lines = extractParagraphLines(paragraph);
    if (!lines.length) {
      continue;
    }
    const parsed = parseDocxLines(lines);
    if (parsed) {
      segments.push(parsed);
    }
  }

  if (!segments.length) {
    const fallbackLines = paragraphs.flatMap((paragraph) => extractParagraphLines(paragraph));
    segments.push(...parseDocxSegmentsFromLines(fallbackLines));
  }

  if (!segments.length) {
    throw new AppError("invalid_docx", "Não foi possível extrair falas válidas do DOCX.");
  }

  return {
    segments,
    cleanText: segments.map((segment) => `${segment.speaker}>${segment.text}`).join("\n"),
  };
}

function getParagraphs(documentXml: Document): Element[] {
  const namespaces = Array.from(documentXml.getElementsByTagNameNS(WORD_NS, "p"));
  if (namespaces.length) {
    return namespaces;
  }
  const prefixed = Array.from(documentXml.getElementsByTagName("w:p"));
  if (prefixed.length) {
    return prefixed;
  }
  return Array.from(documentXml.getElementsByTagName("p"));
}

function extractParagraphLines(paragraph: Element): string[] {
  const lines = [""];
  const appendText = (value: string) => {
    lines[lines.length - 1] += value;
  };

  const walk = (node: Node) => {
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return;
    }
    const element = node as Element;
    if (element.namespaceURI && element.namespaceURI !== WORD_NS) {
      return;
    }
    const name = element.localName;
    if (name === "drawing" || name === "pict" || name === "object") {
      return;
    }
    if (name === "br" || name === "cr") {
      lines.push("");
      return;
    }
    if (name === "tab") {
      appendText("\t");
      return;
    }
    if (name === "t") {
      appendText(element.textContent || "");
      return;
    }
    for (const child of Array.from(element.childNodes)) {
      walk(child);
    }
  };

  walk(paragraph);
  return lines.map((line) => normalizeSpaces(line)).filter(Boolean);
}

function parseDocxLines(lines: string[]): DocxSegment | null {
  const cleaned = lines.map((line) => normalizeSpaces(line)).filter(Boolean);
  if (!cleaned.length) {
    return null;
  }
  const joined = cleaned.join(" ");
  if (isSystemLine(joined)) {
    return null;
  }

  const timeOnlyPattern = /^\d{1,2}:\d{2}(?::\d{2})?$/;
  let speaker = "";
  let timeStr = "";
  let textParts: string[] = [];

  const firstLine = cleaned[0];
  if (!firstLine) {
    return null;
  }
  const inlineMatch = firstLine.match(/^(.*?)[\s]+(\d{1,2}:\d{2}(?::\d{2})?)(?:\s+(.*))?$/);
  if (inlineMatch) {
    speaker = inlineMatch[1] || "";
    timeStr = inlineMatch[2] || "";
    if (inlineMatch[3]) {
      textParts.push(inlineMatch[3]);
    }
    textParts = textParts.concat(cleaned.slice(1));
  } else if (cleaned.length >= 2 && timeOnlyPattern.test(cleaned[1] || "")) {
    speaker = cleaned[0] || "";
    timeStr = cleaned[1] || "";
    textParts = cleaned.slice(2);
  } else {
    return null;
  }

  const normalizedSpeaker = normalizeSpeakerName(speaker);
  const text = normalizeSpaces(textParts.join(" "));
  const startS = parseDocxTimeToSeconds(timeStr);
  if (!normalizedSpeaker || !text || typeof startS !== "number") {
    return null;
  }

  return {
    speaker: normalizedSpeaker,
    text,
    startS,
    timeStr,
  };
}

function parseDocxSegmentsFromLines(lines: string[]): DocxSegment[] {
  const segments: DocxSegment[] = [];
  const timeOnlyPattern = /^\d{1,2}:\d{2}(?::\d{2})?$/;
  let index = 0;

  while (index < lines.length) {
    const maybeSpeaker = lines[index];
    const maybeTime = lines[index + 1];
    let speaker = "";
    let timeStr = "";

    if (maybeSpeaker) {
      const inline = maybeSpeaker.match(/^(.*?)[\s]+(\d{1,2}:\d{2}(?::\d{2})?)$/);
      if (inline) {
        speaker = inline[1] || "";
        timeStr = inline[2] || "";
        index += 1;
      } else if (maybeTime && timeOnlyPattern.test(maybeTime)) {
        speaker = maybeSpeaker;
        timeStr = maybeTime;
        index += 2;
      }
    }

    if (!speaker || !timeStr) {
      index += 1;
      continue;
    }

    const normalizedSpeaker = normalizeSpeakerName(speaker);
    const startS = parseDocxTimeToSeconds(timeStr);
    const textParts: string[] = [];

    while (index < lines.length) {
      const lookAheadSpeaker = lines[index];
      const lookAheadTime = lines[index + 1];
      if (lookAheadSpeaker && lookAheadTime && timeOnlyPattern.test(lookAheadTime)) {
        break;
      }
      if (lookAheadSpeaker && !isSystemLine(lookAheadSpeaker)) {
        textParts.push(lookAheadSpeaker);
      }
      index += 1;
    }

    const text = normalizeSpaces(textParts.join(" "));
    if (normalizedSpeaker && text && typeof startS === "number") {
      segments.push({
        speaker: normalizedSpeaker,
        text,
        startS,
        timeStr,
      });
    }
  }

  return segments;
}

function isSystemLine(line: string): boolean {
  return /começou a transcri/i.test(line) || /parou a transcri/i.test(line);
}
