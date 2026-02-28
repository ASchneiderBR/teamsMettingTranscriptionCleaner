import type { MeetingMetadata } from "../../app/state";
import { formatCount, formatDuration, formatMtldValue, formatRatioPercent } from "./format";
import type { NgramRow, ProcessedTranscript } from "./types";

export function buildPlainTextOutput(
  result: ProcessedTranscript,
  metadata: MeetingMetadata,
): string {
  const sections = [
    buildPlainTextSummary(result, metadata),
    "",
    "Transcrição:",
    result.cleanText.trim() || "—",
    "",
  ];
  return sections.join("\n");
}

function buildPlainTextSummary(result: ProcessedTranscript, metadata: MeetingMetadata): string {
  const title = (metadata.title || metadata.inferredTitle || "(sem título)").trim();
  const lines: string[] = [
    `Título: ${title}`,
    `Origem: ${result.source.toUpperCase()}`,
    `Data: ${metadata.date || "—"}`,
    `Horário de início: ${metadata.startTime || "—"}`,
    `Observações: ${metadata.notes || "—"}`,
    `Participantes: ${result.stats.presence.join(", ") || "—"}`,
    `Duração total: ${formatDuration(result.stats.totalMeeting)}`,
    `Tempo total de fala: ${formatDuration(result.stats.totalSpeech)}`,
    `Turnos totais: ${formatCount(result.stats.totalTurns)}`,
    "",
    "Tempo de fala:",
    buildSpeechTable(result),
    "",
    "Turnos:",
    buildTurnsTable(result),
    "",
    "Variedade de vocabulário (TTR e MTLD):",
    "MTLD = medida mais estável da diversidade; quanto maior, maior a variedade.",
    buildLexicalTable(result),
    "",
    "Top bi-gramas:",
    buildNgramTable(result.stats.ngrams.bigrams.rows),
    "",
    "Top tri-gramas:",
    buildNgramTable(result.stats.ngrams.trigrams.rows),
  ];

  return lines.join("\n");
}

function buildSpeechTable(result: ProcessedTranscript): string {
  const header = ["Participante", "Tempo", "% fala"];
  const rows = result.stats.rows.map((row) => [
    row.name,
    formatDuration(row.seconds),
    formatRatioPercent(row.pct),
  ]);
  return buildTextTable(header, rows);
}

function buildTurnsTable(result: ProcessedTranscript): string {
  const header = ["Participante", "Turnos", "% turnos"];
  const rows = result.stats.turnRows.map((row) => [
    row.name,
    formatCount(row.turns),
    formatRatioPercent(row.turnPct),
  ]);
  return buildTextTable(header, rows);
}

function buildLexicalTable(result: ProcessedTranscript): string {
  const header = ["Participante", "Tipos", "TTR", "MTLD"];
  const rows = [
    [
      "Reunião",
      formatCount(result.stats.lexical.meeting.unique),
      formatRatioPercent(result.stats.lexical.meeting.ttr * 100),
      formatMtldValue(result.stats.lexical.meeting.mtld),
    ],
    ...result.stats.lexical.rows.map((row) => [
      row.name,
      formatCount(row.unique),
      formatRatioPercent(row.ttr * 100),
      formatMtldValue(row.mtld),
    ]),
  ];
  return buildTextTable(header, rows);
}

function buildNgramTable(rows: NgramRow[]): string {
  const header = ["Expressão", "Freq."];
  return buildTextTable(
    header,
    rows.length ? rows.map((row) => [row.gram, formatCount(row.count)]) : [["—", "0"]],
  );
}

function buildTextTable(header: string[], rows: string[][]): string {
  const widths = header.map((column, columnIndex) =>
    Math.max(column.length, ...rows.map((row) => row[columnIndex]?.length ?? 0)),
  );

  const formatLine = (values: string[]) =>
    values.map((value, index) => value.padEnd(widths[index] ?? 0)).join("  ");

  return [
    formatLine(header),
    widths.map((width) => "-".repeat(width)).join("  "),
    ...rows.map((row) => formatLine(row)),
  ].join("\n");
}
