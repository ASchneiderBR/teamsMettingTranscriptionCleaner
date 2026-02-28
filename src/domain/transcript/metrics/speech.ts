import { normalizeSpeakerName } from "../normalize";
import type { Cue, SpeechRow } from "../types";

export interface SpeechMetricsResult {
  totalMeeting: number;
  totalSpeech: number;
  presence: string[];
  rows: SpeechRow[];
}

export function computeSpeechMetrics(cues: Cue[]): SpeechMetricsResult {
  let minS = Number.POSITIVE_INFINITY;
  let maxE = Number.NEGATIVE_INFINITY;
  const personSeconds = new Map<string, number>();
  const presence = new Set<string>();

  for (const cue of cues) {
    if (!Number.isFinite(cue.startS) || !Number.isFinite(cue.endS)) {
      continue;
    }
    minS = Math.min(minS, cue.startS);
    maxE = Math.max(maxE, cue.endS);
    const duration = Math.max(0, cue.endS - cue.startS);
    const uniqueNames = Array.from(
      new Set(cue.speakers.map((speaker) => normalizeSpeakerName(speaker.name)).filter(Boolean)),
    );
    if (!uniqueNames.length) {
      continue;
    }
    for (const name of uniqueNames) {
      presence.add(name);
      personSeconds.set(name, (personSeconds.get(name) || 0) + duration / uniqueNames.length);
    }
  }

  const totalMeeting =
    minS !== Number.POSITIVE_INFINITY && maxE !== Number.NEGATIVE_INFINITY
      ? Math.max(0, maxE - minS)
      : 0;
  const totalSpeech = Array.from(personSeconds.values()).reduce((sum, value) => sum + value, 0);

  const rows: SpeechRow[] = Array.from(personSeconds.entries())
    .map(([name, seconds]) => ({
      name,
      seconds,
      pct: totalSpeech > 0 ? (seconds / totalSpeech) * 100 : 0,
    }))
    .sort((left, right) => right.seconds - left.seconds);

  return {
    totalMeeting,
    totalSpeech,
    presence: Array.from(presence).sort((left, right) => left.localeCompare(right, "pt-BR")),
    rows,
  };
}
