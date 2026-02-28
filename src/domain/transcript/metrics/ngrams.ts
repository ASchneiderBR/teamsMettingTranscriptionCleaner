import { tokenizeNgram } from "../normalize";
import type { NgramGroup, NgramMetrics, NgramRow } from "../types";

export const NGRAM_TOP_LIMIT = 10;

export function computeNgramMetrics(cleanText: string, limit = NGRAM_TOP_LIMIT): NgramMetrics {
  return {
    bigrams: computeTopNgrams(cleanText, 2, limit),
    trigrams: computeTopNgrams(cleanText, 3, limit),
  };
}

function computeTopNgrams(cleanText: string, n: 2 | 3, limit: number): NgramGroup {
  const tokens = tokenizeNgram(cleanText);
  const counts = new Map<string, number>();
  let totalCount = 0;

  for (let index = 0; index <= tokens.length - n; index += 1) {
    const gramTokens = tokens.slice(index, index + n);
    if (new Set(gramTokens).size === 1) {
      continue;
    }
    const gram = gramTokens.join(" ");
    counts.set(gram, (counts.get(gram) || 0) + 1);
    totalCount += 1;
  }

  const rows: NgramRow[] = Array.from(counts.entries())
    .map(([gram, count]) => ({ gram, count }))
    .sort((left, right) => {
      if (right.count !== left.count) {
        return right.count - left.count;
      }
      return left.gram.localeCompare(right.gram, "pt-BR");
    })
    .slice(0, limit);

  return {
    n,
    rows,
    uniqueCount: counts.size,
    totalCount,
    limit,
  };
}
