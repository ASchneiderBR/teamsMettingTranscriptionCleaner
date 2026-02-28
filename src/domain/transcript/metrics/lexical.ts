import { tokenizeLexical } from "../normalize";
import type { Cue, LexicalMetrics, LexicalMetricsRow } from "../types";

export const LEXICAL_MTLD_THRESHOLD = 0.72;
export const LEXICAL_MTLD_MIN_TOKENS = 20;

export function computeLexicalMetrics(cues: Cue[], cleanText: string): LexicalMetrics {
  const speakerTexts = new Map<string, string[]>();
  for (const cue of cues) {
    for (const speaker of cue.speakers) {
      const bucket = speakerTexts.get(speaker.name) || [];
      bucket.push(speaker.text);
      speakerTexts.set(speaker.name, bucket);
    }
  }

  const rows: LexicalMetricsRow[] = Array.from(speakerTexts.entries())
    .map(([name, segments]) => buildLexicalRow(name, segments.join(" ")))
    .sort((left, right) => right.tokens - left.tokens);

  const meetingTokens = tokenizeLexical(cleanText);
  return {
    meeting: buildLexicalMetrics(meetingTokens),
    rows,
  };
}

function buildLexicalRow(name: string, text: string): LexicalMetricsRow {
  const metrics = buildLexicalMetrics(tokenizeLexical(text));
  return {
    name,
    tokens: metrics.tokens,
    unique: metrics.unique,
    ttr: metrics.ttr,
    mtld: metrics.mtld,
  };
}

function buildLexicalMetrics(tokens: string[]) {
  const total = tokens.length;
  const unique = new Set(tokens).size;
  const ttr = total > 0 ? unique / total : 0;
  const mtld = total >= LEXICAL_MTLD_MIN_TOKENS ? computeMtld(tokens) : null;
  return { tokens: total, unique, ttr, mtld };
}

function computeMtld(tokens: string[], threshold = LEXICAL_MTLD_THRESHOLD): number {
  const forward = computeMtldPass(tokens, threshold);
  const backward = computeMtldPass([...tokens].reverse(), threshold);
  return (forward + backward) / 2;
}

function computeMtldPass(tokens: string[], threshold: number): number {
  let factors = 0;
  let tokenCount = 0;
  const types = new Set<string>();

  for (const token of tokens) {
    tokenCount += 1;
    types.add(token);
    const ttr = types.size / tokenCount;
    if (ttr <= threshold) {
      factors += 1;
      tokenCount = 0;
      types.clear();
    }
  }

  if (tokenCount > 0) {
    const ttr = types.size / tokenCount;
    const remainder = (1 - ttr) / (1 - threshold);
    factors += Number.isFinite(remainder) ? remainder : 0;
  }

  return factors > 0 ? tokens.length / factors : tokens.length;
}
