import { isWordCloudToken, tokenizeWords } from "../normalize";
import type { WordCloudItem } from "../types";

export const WORD_CLOUD_MAX = 30;

export function computeWordCloudData(
  cleanText: string,
  limit = WORD_CLOUD_MAX,
  ignoredTerms: Iterable<string> = [],
): WordCloudItem[] {
  const ignoredTokens = buildIgnoredTokenSet(ignoredTerms);
  const counts = new Map<string, number>();
  for (const token of tokenizeWords(cleanText)) {
    if (!isWordCloudToken(token) || ignoredTokens.has(token)) {
      continue;
    }
    counts.set(token, (counts.get(token) || 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([word, count]) => ({ word, count }))
    .sort((left, right) => {
      if (right.count !== left.count) {
        return right.count - left.count;
      }
      return left.word.localeCompare(right.word, "pt-BR");
    })
    .slice(0, limit);
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
