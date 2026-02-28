import type { DocxSegment, ProcessedTranscript } from "../domain/transcript/types";

export type SourceKind = "vtt" | "docx";
export type Tone = "muted" | "success" | "warn";
export type ThemePreference = "light" | "dark" | "system";

export interface MeetingMetadata {
  date: string;
  startTime: string;
  title: string;
  inferredTitle: string;
  notes: string;
}

export interface UiStatus {
  message: string;
  tone: Tone;
}

export interface AppState {
  source: SourceKind;
  fileName: string;
  inputText: string;
  outputText: string;
  metadata: MeetingMetadata;
  processStatus: UiStatus;
  outputStatus: UiStatus;
  theme: ThemePreference;
  docxSegments: DocxSegment[];
  result: ProcessedTranscript | null;
  timelineWidth: number;
  dragActive: boolean;
}

export function createInitialState(theme: ThemePreference = "system"): AppState {
  return {
    source: "vtt",
    fileName: "",
    inputText: "",
    outputText: "",
    metadata: {
      date: "",
      startTime: "",
      title: "",
      inferredTitle: "",
      notes: "",
    },
    processStatus: { message: "Pronto.", tone: "muted" },
    outputStatus: { message: "—", tone: "muted" },
    theme,
    docxSegments: [],
    result: null,
    timelineWidth: 0,
    dragActive: false,
  };
}
