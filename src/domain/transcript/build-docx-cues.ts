import { countSpeechChars } from "./normalize";
import type { Cue, DocxSegment } from "./types";

export const DEFAULT_SECONDS_PER_CHAR = 0.06;
export const MIN_ESTIMATED_SECONDS = 0.6;

export function buildDocxCuesFromSegments(segments: DocxSegment[]): Cue[] {
  return segments
    .filter((segment) => Number.isFinite(segment.startS))
    .map((segment, index) => {
      const next = segments[index + 1];
      const nextStart = next && Number.isFinite(next.startS) ? next.startS : null;
      const gap =
        typeof nextStart === "number" && nextStart > segment.startS
          ? nextStart - segment.startS
          : null;
      const estimated = Math.max(
        MIN_ESTIMATED_SECONDS,
        countSpeechChars(segment.text) * DEFAULT_SECONDS_PER_CHAR,
      );
      const duration = typeof gap === "number" && gap > 0 ? Math.min(estimated, gap) : estimated;

      return {
        startS: segment.startS,
        endS: segment.startS + duration,
        speakers: [{ name: segment.speaker, text: segment.text }],
      };
    });
}
