export interface SpeakerSegment {
  name: string;
  text: string;
}

export interface Cue {
  startS: number;
  endS: number;
  speakers: SpeakerSegment[];
}

export interface ParsedTranscript {
  cleanText: string;
  cues: Cue[];
}

export interface DocxSegment {
  speaker: string;
  text: string;
  startS: number;
  timeStr: string;
}

export interface ParsedDocxTranscript {
  segments: DocxSegment[];
  cleanText: string;
}

export interface SpeechRow {
  name: string;
  seconds: number;
  pct: number;
}

export interface TurnRow {
  name: string;
  turns: number;
  turnPct: number;
}

export interface LexicalMetricsRow {
  name: string;
  tokens: number;
  unique: number;
  ttr: number;
  mtld: number | null;
}

export interface LexicalMetrics {
  meeting: {
    tokens: number;
    unique: number;
    ttr: number;
    mtld: number | null;
  };
  rows: LexicalMetricsRow[];
}

export interface NgramRow {
  gram: string;
  count: number;
}

export interface NgramGroup {
  n: 2 | 3;
  rows: NgramRow[];
  uniqueCount: number;
  totalCount: number;
  limit: number;
}

export interface NgramMetrics {
  bigrams: NgramGroup;
  trigrams: NgramGroup;
}

export interface WordCloudItem {
  word: string;
  count: number;
}

export interface TimelineBucketSpeaker {
  name: string;
  seconds: number;
}

export interface TimelineBucket {
  startS: number;
  endS: number;
  speakers: TimelineBucketSpeaker[];
  totalSeconds: number;
}

export interface TranscriptStats {
  totalMeeting: number;
  totalSpeech: number;
  totalTurns: number;
  presence: string[];
  rows: SpeechRow[];
  turnRows: TurnRow[];
  lexical: LexicalMetrics;
  ngrams: NgramMetrics;
  wordCloud: WordCloudItem[];
}

export interface ProcessedTranscript {
  source: "vtt" | "docx";
  cleanText: string;
  cues: Cue[];
  stats: TranscriptStats;
}

export type TranscriptProcessInput =
  | {
      source: "vtt";
      rawText: string;
    }
  | {
      source: "docx";
      segments: DocxSegment[];
      cleanText: string;
    };
