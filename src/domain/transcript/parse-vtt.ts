import { AppError } from "./errors";
import {
  isTimestampLine,
  normalizeSpaces,
  normalizeSpeakerName,
  parseTimeToSeconds,
  stripAllTags,
} from "./normalize";
import type { ParsedTranscript, SpeakerSegment } from "./types";

export function parseVtt(raw: string): ParsedTranscript {
  const text = String(raw || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");
  if (!text.trim()) {
    throw new AppError("empty_input", "Nenhuma entrada para processar.");
  }

  const blocks = text.split(/\n\s*\n+/g);
  const cleanLines: string[] = [];
  const cues: ParsedTranscript["cues"] = [];

  for (const block of blocks) {
    const lines = block.split("\n").map((line) => line.trimEnd());
    if (!lines.length) {
      continue;
    }

    const firstLine = lines[0];
    if (!firstLine) {
      continue;
    }
    const first = firstLine.trim();
    if (first === "WEBVTT" || /^(NOTE|STYLE|REGION)\b/i.test(first)) {
      continue;
    }

    let lineIndex = 0;
    const currentLine = lines[lineIndex];
    if (
      currentLine &&
      !isTimestampLine(currentLine) &&
      !/^\d{2}:\d{2}:\d{2}/.test(currentLine) &&
      !/<v\s+/i.test(currentLine)
    ) {
      lineIndex += 1;
    }

    const timestampLine = lines[lineIndex];
    if (!timestampLine || !isTimestampLine(timestampLine)) {
      const payload = lines.slice(lineIndex).filter((line) => line.trim().length > 0);
      if (!payload.length) {
        continue;
      }
      const plain = normalizeSpaces(stripAllTags(payload.join(" ")));
      if (plain) {
        cleanLines.push(plain);
      }
      continue;
    }

    const tsLine = timestampLine.trim();
    const match = tsLine.match(
      /(\d{2}:\d{2}:\d{2}(?:\.\d+)?)\s*-->\s*(\d{2}:\d{2}:\d{2}(?:\.\d+)?)/,
    );
    lineIndex += 1;
    const startText = match?.[1];
    const endText = match?.[2];
    const startS = startText ? parseTimeToSeconds(startText) : null;
    const endS = endText ? parseTimeToSeconds(endText) : null;
    const payload = lines.slice(lineIndex).filter((line) => line.trim().length > 0);
    if (!payload.length) {
      continue;
    }

    const payloadText = payload.join(" ");
    const speakers = parseSpeakerSegments(payloadText, cleanLines);
    if (speakers.length) {
      if (typeof startS === "number" && typeof endS === "number" && endS >= startS) {
        cues.push({
          startS,
          endS,
          speakers,
        });
      }
      continue;
    }

    const line = normalizeSpaces(stripAllTags(payloadText));
    if (!line) {
      continue;
    }

    const fallbackSpeakerMatch = line.match(/^(.{2,80}?)[：:]\s*(.+)$/);
    if (fallbackSpeakerMatch) {
      const speaker = normalizeSpeakerName(fallbackSpeakerMatch[1] || "");
      const content = normalizeSpaces(fallbackSpeakerMatch[2] || "");
      if (speaker && content) {
        cleanLines.push(`${speaker}>${content}`);
        if (typeof startS === "number" && typeof endS === "number" && endS >= startS) {
          cues.push({
            startS,
            endS,
            speakers: [{ name: speaker, text: content }],
          });
        }
        continue;
      }
    }

    cleanLines.push(line);
  }

  return {
    cleanText: cleanLines.join("\n"),
    cues,
  };
}

function parseSpeakerSegments(payloadText: string, cleanLines: string[]): SpeakerSegment[] {
  const speakers: SpeakerSegment[] = [];
  const closedTagPattern = /<v\s+([^>]+)>([\s\S]*?)<\/v>/gi;

  let closedMatch = closedTagPattern.exec(payloadText);
  while (closedMatch !== null) {
    const speaker = normalizeSpeakerName(closedMatch[1] || "");
    const content = normalizeSpaces(stripAllTags(closedMatch[2] || ""));
    if (!speaker || !content) {
      closedMatch = closedTagPattern.exec(payloadText);
      continue;
    }
    speakers.push({ name: speaker, text: content });
    cleanLines.push(`${speaker}>${content}`);
    closedMatch = closedTagPattern.exec(payloadText);
  }

  if (speakers.length) {
    return speakers;
  }

  const looseSegments: SpeakerSegment[] = [];
  const looseTagPattern = /<v\s+([^>]+)>/gi;
  let lastIndex = 0;
  let lastName: string | null = null;
  let looseMatch = looseTagPattern.exec(payloadText);

  while (looseMatch !== null) {
    if (lastName !== null) {
      const content = normalizeSpaces(stripAllTags(payloadText.slice(lastIndex, looseMatch.index)));
      if (lastName && content) {
        looseSegments.push({ name: lastName, text: content });
        cleanLines.push(`${lastName}>${content}`);
      }
    }
    lastName = normalizeSpeakerName(looseMatch[1] || "");
    lastIndex = looseTagPattern.lastIndex;
    looseMatch = looseTagPattern.exec(payloadText);
  }

  if (lastName !== null) {
    const content = normalizeSpaces(stripAllTags(payloadText.slice(lastIndex)));
    if (lastName && content) {
      looseSegments.push({ name: lastName, text: content });
      cleanLines.push(`${lastName}>${content}`);
    }
  }

  return looseSegments;
}
