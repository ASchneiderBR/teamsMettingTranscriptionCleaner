import { normalizeSpeakerName } from "../normalize";
import type { Cue, TurnRow } from "../types";

export interface TurnMetricsResult {
  totalTurns: number;
  rows: TurnRow[];
}

export function computeTurnMetrics(cues: Cue[]): TurnMetricsResult {
  const personTurns = new Map<string, number>();

  for (const cue of cues) {
    const uniqueNames = Array.from(
      new Set(cue.speakers.map((speaker) => normalizeSpeakerName(speaker.name)).filter(Boolean)),
    );
    for (const name of uniqueNames) {
      personTurns.set(name, (personTurns.get(name) || 0) + 1);
    }
  }

  const totalTurns = Array.from(personTurns.values()).reduce((sum, value) => sum + value, 0);
  const rows: TurnRow[] = Array.from(personTurns.entries())
    .map(([name, turns]) => ({
      name,
      turns,
      turnPct: totalTurns > 0 ? (turns / totalTurns) * 100 : 0,
    }))
    .sort((left, right) => right.turns - left.turns);

  return { totalTurns, rows };
}
