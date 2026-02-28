import { describe, expect, it } from "vitest";
import { MIN_ESTIMATED_SECONDS, buildDocxCuesFromSegments } from "./build-docx-cues";
import { parseDocxXml } from "./parse-docx";

function buildDocxXml(paragraphs: string[]): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
      <w:body>
        ${paragraphs
          .map((paragraph) => `<w:p><w:r><w:t xml:space="preserve">${paragraph}</w:t></w:r></w:p>`)
          .join("")}
      </w:body>
    </w:document>`;
}

describe("parseDocxXml", () => {
  it("parses speaker/time/text standard layout", () => {
    const xml = buildDocxXml(["Maria", "0:03", "Bom dia time"]);
    const parsed = parseDocxXml(xml);

    expect(parsed.segments).toHaveLength(1);
    expect(parsed.segments[0]).toMatchObject({
      speaker: "Maria",
      startS: 3,
      text: "Bom dia time",
    });
  });

  it("parses inline speaker format and ignores system lines", () => {
    const xml = buildDocxXml([
      "Começou a transcrição",
      "João 0:12 Vamos seguir",
      "Parou a transcrição",
    ]);
    const parsed = parseDocxXml(xml);

    expect(parsed.cleanText).toBe("João>Vamos seguir");
    expect(parsed.segments[0]?.startS).toBe(12);
  });
});

describe("buildDocxCuesFromSegments", () => {
  it("respects minimum duration and next cue truncation", () => {
    const cues = buildDocxCuesFromSegments([
      { speaker: "Ana", text: "Oi", startS: 0, timeStr: "0:00" },
      { speaker: "Bruno", text: "Tudo bem", startS: 1, timeStr: "0:01" },
    ]);

    expect(cues[0]?.endS).toBeGreaterThanOrEqual(MIN_ESTIMATED_SECONDS);
    expect(cues[0]?.endS).toBeLessThanOrEqual(1);
  });
});
