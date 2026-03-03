import { isWordCloudToken, tokenizeNgram, tokenizeWords } from "../normalize";
import type { NgramGroup, NgramMetrics, NgramRow } from "../types";

export const NGRAM_TOP_LIMIT = 10;

export function computeNgramMetrics(
  cleanText: string,
  limit = NGRAM_TOP_LIMIT,
  ignoredTerms: Iterable<string> = [],
): NgramMetrics {
  const ignoredTokens = buildIgnoredTokenSet(ignoredTerms);
  return {
    bigrams: computeTopNgrams(cleanText, 2, limit, ignoredTokens),
    trigrams: computeTopNgrams(cleanText, 3, limit, ignoredTokens),
  };
}

function computeTopNgrams(
  cleanText: string,
  n: 2 | 3,
  limit: number,
  ignoredTokens: Set<string>,
): NgramGroup {
  const tokens = tokenizeNgram(cleanText);
  const counts = new Map<string, number>();
  let totalCount = 0;

  for (let index = 0; index <= tokens.length - n; index += 1) {
    const gramTokens = tokens.slice(index, index + n);
    if (gramTokens.some((token) => ignoredTokens.has(token))) {
      continue;
    }
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

function buildIgnoredTokenSet(ignoredTerms: Iterable<string>): Set<string> {
  const ignoredTokens = new Set<string>();
  for (const term of ignoredTerms) {
    for (const token of tokenizeWords(term)) {
      if (!isWordCloudToken(token)) {
        continue;
      }
      ignoredTokens.add(token);
    }
  }
  return ignoredTokens;
}
