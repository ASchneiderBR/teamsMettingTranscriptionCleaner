import { describe, expect, it } from "vitest";
import { normalizeSpeakerName } from "./normalize";
import { parseVtt } from "./parse-vtt";

describe("parseVtt", () => {
  it("parses WEBVTT cues with closed speaker tags", () => {
    const parsed = parseVtt(`WEBVTT

00:00:00.000 --> 00:00:03.000
<v joAO da silva>Olá time</v>
`);

    expect(parsed.cleanText).toBe("Joao Da Silva>Olá time");
    expect(parsed.cues).toHaveLength(1);
    expect(parsed.cues[0]?.speakers[0]).toEqual({
      name: "Joao Da Silva",
      text: "Olá time",
    });
  });

  it("parses loose speaker tags without closing tag", () => {
    const parsed = parseVtt(`WEBVTT

00:00:00.000 --> 00:00:03.000
<v maria>Bom dia<v joao>Oi
`);

    expect(parsed.cleanText).toContain("Maria>Bom dia");
    expect(parsed.cleanText).toContain("Joao>Oi");
    expect(parsed.cues[0]?.speakers).toHaveLength(2);
  });

  it("parses fallback speaker syntax", () => {
    const parsed = parseVtt(`WEBVTT

00:00:00.000 --> 00:00:03.000
Ana: Vamos seguir
`);

    expect(parsed.cleanText).toBe("Ana>Vamos seguir");
    expect(parsed.cues[0]?.speakers[0]?.name).toBe("Ana");
  });

  it("ignores NOTE, STYLE and REGION blocks", () => {
    const parsed = parseVtt(`WEBVTT

NOTE this is ignored

STYLE
::cue { color: lime }

REGION
id:fred

00:00:00.000 --> 00:00:03.000
<v Ana>Texto válido</v>
`);

    expect(parsed.cleanText).toBe("Ana>Texto válido");
    expect(parsed.cues).toHaveLength(1);
  });
});

describe("normalizeSpeakerName", () => {
  it("normalizes mixed casing and spacing", () => {
    expect(normalizeSpeakerName("  joAO   da   silva  ")).toBe("Joao Da Silva");
  });
});
