import type { Tone } from "../app/state";
import type { NgramRow, TimelineBucket, WordCloudItem } from "../domain/transcript/types";

export interface StatusViewModel {
  message: string;
  tone: Tone;
}

export interface DistributionRowViewModel {
  name: string;
  value: string;
  percent: string;
  barWidth: number;
}

export interface LexicalRowViewModel {
  name: string;
  types: string;
  ttr: string;
  mtld: string;
}

export interface AppViewModel {
  title: string;
  totalPill: string;
  peoplePill: string;
  fileLabel: string;
  processStatus: StatusViewModel;
  outputStatus: StatusViewModel;
  inputText: string;
  outputText: string;
  outputInfo: {
    chars: string;
    tokens: string;
  };
  speechRows: DistributionRowViewModel[];
  turnsMeta: string;
  turnRows: DistributionRowViewModel[];
  lexicalMeta: string;
  lexicalRows: LexicalRowViewModel[];
  ngramMeta: string;
  bigrams: NgramRow[];
  trigrams: NgramRow[];
  wordCloud: WordCloudItem[];
  wordCloudMeta: string;
  timeline: {
    bucketSeconds: number;
    bucketCount: number;
    maxBucketSeconds: number;
    buckets: TimelineBucket[];
  };
  timelineMeta: string;
  timelineStart: string;
  timelineEnd: string;
  timelineLegend: Array<{ name: string; color: string }>;
  timelineColors: Record<string, string>;
  dragActive: boolean;
  hasResult: boolean;
}
