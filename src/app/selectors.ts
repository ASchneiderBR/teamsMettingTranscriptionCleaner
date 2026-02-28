import {
  formatCount,
  formatDuration,
  formatMtldValue,
  formatRatioPercent,
} from "../domain/transcript/format";
import { computeTimeline } from "../domain/transcript/metrics/timeline";
import type { AppViewModel, StatusViewModel } from "../ui/view-models";
import type { AppState, Tone } from "./state";

const EMPTY_METRICS_TEXT = "Sem dados";
const LEXICAL_META_HELP = "TTR mede variedade imediata; MTLD mede variedade com mais estabilidade.";
const NGRAM_META_HELP = "Bi-grama = 2 palavras em sequência; tri-grama = 3.";

export function selectAppViewModel(state: AppState): AppViewModel {
  const result = state.result;
  const hasResult = Boolean(result);
  const titleText = state.metadata.title || state.metadata.inferredTitle || "—";
  const notesSuffix = state.metadata.notes ? ` • ${state.metadata.notes}` : "";
  const outputChars = state.outputText ? state.outputText.length : 0;
  const outputTokens = state.outputText ? Math.ceil(outputChars / 4) : 0;
  const presenceCount = result?.stats.presence.length ?? 0;
  const speechRows = result?.stats.rows ?? [];
  const turnRows = result?.stats.turnRows ?? [];
  const maxSpeechPct = Math.max(0, ...speechRows.map((row) => row.pct));
  const maxTurnPct = Math.max(0, ...turnRows.map((row) => row.turnPct));
  const timeline = result
    ? computeTimeline(
        result.cues,
        speechRows.map((row) => row.name),
        state.timelineWidth,
      )
    : { bucketSeconds: 120, bucketCount: 0, maxBucketSeconds: 0, buckets: [] };
  const timelineLastBucket = timeline.buckets.at(-1);

  return {
    title: `Título: ${titleText}${notesSuffix}`,
    totalPill: `Duração total: ${result ? formatDuration(result.stats.totalMeeting) : EMPTY_METRICS_TEXT}`,
    peoplePill: `Participantes: ${hasResult ? String(presenceCount) : EMPTY_METRICS_TEXT}`,
    fileLabel: state.fileName ? `Selecionado: ${state.fileName}` : "Nenhum arquivo selecionado",
    processStatus: toStatusViewModel(state.processStatus.message, state.processStatus.tone),
    outputStatus: toStatusViewModel(state.outputStatus.message, state.outputStatus.tone),
    inputText: state.inputText,
    outputText: state.outputText,
    outputInfo: {
      chars: `Caracteres: ${hasResult ? formatCount(outputChars) : EMPTY_METRICS_TEXT}`,
      tokens: `Tokens (est.): ${hasResult ? formatCount(outputTokens) : EMPTY_METRICS_TEXT}`,
    },
    speechRows: speechRows.map((row) => ({
      name: row.name,
      value: formatDuration(row.seconds),
      percent: formatRatioPercent(row.pct),
      barWidth: maxSpeechPct > 0 ? (row.pct / maxSpeechPct) * 100 : 0,
    })),
    turnsMeta: result ? `${result.stats.totalTurns} turno(s)` : EMPTY_METRICS_TEXT,
    turnRows: turnRows.map((row) => ({
      name: row.name,
      value: formatCount(row.turns),
      percent: formatRatioPercent(row.turnPct),
      barWidth: maxTurnPct > 0 ? (row.turnPct / maxTurnPct) * 100 : 0,
    })),
    lexicalMeta: result
      ? `${LEXICAL_META_HELP} • Reunião: TTR ${formatRatioPercent(
          result.stats.lexical.meeting.ttr * 100,
        )} • MTLD ${formatMtldValue(result.stats.lexical.meeting.mtld)}`
      : LEXICAL_META_HELP,
    lexicalRows: result
      ? [
          {
            name: "Reunião",
            types: formatCount(result.stats.lexical.meeting.unique),
            ttr: formatRatioPercent(result.stats.lexical.meeting.ttr * 100),
            mtld: formatMtldValue(result.stats.lexical.meeting.mtld),
          },
          ...result.stats.lexical.rows.map((row) => ({
            name: row.name,
            types: formatCount(row.unique),
            ttr: formatRatioPercent(row.ttr * 100),
            mtld: formatMtldValue(row.mtld),
          })),
        ]
      : [],
    ngramMeta: result
      ? `${NGRAM_META_HELP} • Bi: ${formatCount(
          result.stats.ngrams.bigrams.uniqueCount,
        )} únicos • Tri: ${formatCount(result.stats.ngrams.trigrams.uniqueCount)} únicos`
      : NGRAM_META_HELP,
    bigrams: result?.stats.ngrams.bigrams.rows ?? [],
    trigrams: result?.stats.ngrams.trigrams.rows ?? [],
    wordCloud: result?.stats.wordCloud ?? [],
    wordCloudMeta: result
      ? `${formatCount(result.stats.wordCloud.length)} termos em destaque`
      : EMPTY_METRICS_TEXT,
    timeline,
    timelineMeta: result
      ? `Janela dinâmica: ${Math.round(timeline.bucketSeconds / 60)} min por barra`
      : EMPTY_METRICS_TEXT,
    timelineStart: timeline.buckets[0] ? formatDuration(timeline.buckets[0].startS) : "Início",
    timelineEnd: timelineLastBucket ? formatDuration(timelineLastBucket.endS) : "Fim",
    timelineLegend: speechRows.map((row, index) => ({
      name: row.name,
      color: colorForIndex(index, speechRows.length),
    })),
    timelineColors: createTimelineColorMap(
      speechRows.map((row) => row.name),
      speechRows.length,
    ),
    dragActive: state.dragActive,
    hasResult,
  };
}

function toStatusViewModel(message: string, tone: Tone): StatusViewModel {
  return { message, tone };
}

function createTimelineColorMap(names: string[], total: number): Record<string, string> {
  return names.reduce<Record<string, string>>((acc, name, index) => {
    acc[name] = colorForIndex(index, total);
    return acc;
  }, {});
}

function colorForIndex(index: number, total: number): string {
  const hue = total > 0 ? Math.round((index / total) * 320 + 16) : 210;
  return `hsl(${hue}deg 72% 52%)`;
}
