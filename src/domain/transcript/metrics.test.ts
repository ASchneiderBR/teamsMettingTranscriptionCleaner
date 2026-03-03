import { describe, expect, it } from "vitest";
import { computeLexicalMetrics } from "./metrics/lexical";
import { computeNgramMetrics } from "./metrics/ngrams";
import { computeSpeechMetrics } from "./metrics/speech";
import { pickBucketSeconds } from "./metrics/timeline";
import { computeTurnMetrics } from "./metrics/turns";
import { computeWordCloudData } from "./metrics/word-cloud";
import type { Cue } from "./types";

const cues: Cue[] = [
  {
    startS: 0,
    endS: 10,
    speakers: [
      { name: "Ana", text: "Bom dia time" },
      { name: "Bruno", text: "Bom dia time" },
    ],
  },
  {
    startS: 10,
    endS: 20,
    speakers: [{ name: "Ana", text: "Vamos revisar o plano com cuidado" }],
  },
];

describe("metrics", () => {
  it("divides speech time equally for multi-speaker cues", () => {
    const metrics = computeSpeechMetrics(cues);
    expect(metrics.rows.find((row) => row.name === "Ana")?.seconds).toBe(15);
    expect(metrics.rows.find((row) => row.name === "Bruno")?.seconds).toBe(5);
  });

  it("counts turns per participant", () => {
    const metrics = computeTurnMetrics(cues);
    expect(metrics.totalTurns).toBe(3);
    expect(metrics.rows.find((row) => row.name === "Ana")?.turns).toBe(2);
  });

  it("calculates lexical ttr and keeps mtld null below threshold", () => {
    const lexical = computeLexicalMetrics(cues, "texto curto");
    expect(lexical.meeting.ttr).toBeGreaterThan(0);
    expect(lexical.meeting.mtld).toBeNull();
  });

  it("ignores repeated identical ngrams", () => {
    const ngrams = computeNgramMetrics("sim sim sim não não não projeto bom projeto bom");
    expect(ngrams.bigrams.rows.some((row) => row.gram === "sim sim")).toBe(false);
    expect(ngrams.bigrams.rows.some((row) => row.gram === "projeto bom")).toBe(true);
  });

  it("removes stopwords and numeric tokens from word cloud", () => {
    const words = computeWordCloudData("o projeto 2026 projeto equipe equipe equipe");
    expect(words.some((row) => row.word === "o")).toBe(false);
    expect(words.some((row) => row.word === "2026")).toBe(false);
    expect(words[0]?.word).toBe("equipe");
  });

  it("ignores participant names in word cloud terms", () => {
    const words = computeWordCloudData(
      "ana falou do roadmap e bruno falou do roadmap com a equipe",
      undefined,
      ["Ana", "Bruno Silva"],
    );

    expect(words.some((row) => row.word === "ana")).toBe(false);
    expect(words.some((row) => row.word === "bruno")).toBe(false);
    expect(words.some((row) => row.word === "silva")).toBe(false);
    expect(words.find((row) => row.word === "roadmap")?.count).toBe(2);
  });

  it("ignores participant names in ngrams", () => {
    const ngrams = computeNgramMetrics(
      "ana falou do roadmap e bruno falou do roadmap com a equipe",
      10,
      ["Ana", "Bruno Silva"],
    );

    expect(ngrams.bigrams.rows.some((row) => row.gram.includes("ana"))).toBe(false);
    expect(ngrams.bigrams.rows.some((row) => row.gram.includes("bruno"))).toBe(false);
    expect(ngrams.bigrams.rows.some((row) => row.gram.includes("silva"))).toBe(false);
    expect(ngrams.bigrams.rows.some((row) => row.gram === "do roadmap")).toBe(true);
    expect(ngrams.trigrams.rows.some((row) => row.gram === "falou do roadmap")).toBe(true);
  });

  it("chooses timeline bucket between 2 and 5 minutes", () => {
    const bucket = pickBucketSeconds(3600, 320);
    expect(bucket).toBeGreaterThanOrEqual(120);
    expect(bucket).toBeLessThanOrEqual(300);
  });
});
