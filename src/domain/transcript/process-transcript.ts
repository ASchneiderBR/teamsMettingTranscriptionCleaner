import { buildDocxCuesFromSegments } from "./build-docx-cues";
import { AppError } from "./errors";
import { computeLexicalMetrics } from "./metrics/lexical";
import { computeNgramMetrics } from "./metrics/ngrams";
import { computeSpeechMetrics } from "./metrics/speech";
import { computeTurnMetrics } from "./metrics/turns";
import { computeWordCloudData } from "./metrics/word-cloud";
import { parseVtt } from "./parse-vtt";
import type { ProcessedTranscript, TranscriptProcessInput } from "./types";

export function processTranscript(input: TranscriptProcessInput): ProcessedTranscript {
  if (input.source === "vtt") {
    const parsed = parseVtt(input.rawText);
    return buildProcessedTranscript("vtt", parsed.cleanText, parsed.cues);
  }

  if (!input.cleanText.trim()) {
    throw new AppError("empty_input", "Nenhum DOCX carregado.");
  }

  const cues = buildDocxCuesFromSegments(input.segments);
  return buildProcessedTranscript("docx", input.cleanText, cues);
}

function buildProcessedTranscript(
  source: "vtt" | "docx",
  cleanText: string,
  cues: ProcessedTranscript["cues"],
): ProcessedTranscript {
  const speech = computeSpeechMetrics(cues);
  const turns = computeTurnMetrics(cues);
  const lexical = computeLexicalMetrics(cues, cleanText);
  const ngrams = computeNgramMetrics(cleanText);
  const wordCloud = computeWordCloudData(cleanText, undefined, speech.presence);

  return {
    source,
    cleanText,
    cues,
    stats: {
      totalMeeting: speech.totalMeeting,
      totalSpeech: speech.totalSpeech,
      totalTurns: turns.totalTurns,
      presence: speech.presence,
      rows: speech.rows,
      turnRows: turns.rows,
      lexical,
      ngrams,
      wordCloud,
    },
  };
}
