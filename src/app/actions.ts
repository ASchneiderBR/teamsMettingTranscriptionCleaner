import { buildPlainTextOutput } from "../domain/transcript/export-plain-text";
import type { DocxSegment, ProcessedTranscript } from "../domain/transcript/types";
import { type AppState, type ThemePreference, type Tone, createInitialState } from "./state";

export function setProcessStatus(state: AppState, message: string, tone: Tone): AppState {
  return {
    ...state,
    processStatus: { message, tone },
  };
}

export function setOutputStatus(state: AppState, message: string, tone: Tone): AppState {
  return {
    ...state,
    outputStatus: { message, tone },
  };
}

export function setTheme(state: AppState, theme: ThemePreference): AppState {
  return { ...state, theme };
}

export function setTimelineWidth(state: AppState, width: number): AppState {
  return { ...state, timelineWidth: width };
}

export function setDragActive(state: AppState, active: boolean): AppState {
  return { ...state, dragActive: active };
}

export function setInputText(state: AppState, inputText: string): AppState {
  return {
    ...state,
    source: "vtt",
    inputText,
  };
}

export function updateMetadata(
  state: AppState,
  field: keyof AppState["metadata"],
  value: string,
): AppState {
  const next = {
    ...state,
    metadata: {
      ...state.metadata,
      [field]: value,
    },
  };
  return next.result ? refreshOutput(next) : next;
}

export function loadVttSource(state: AppState, fileName: string, inputText: string): AppState {
  return {
    ...state,
    source: "vtt",
    fileName,
    inputText,
    docxSegments: [],
    metadata: {
      ...state.metadata,
      inferredTitle: "",
    },
  };
}

export function loadDocxSource(
  state: AppState,
  fileName: string,
  inputText: string,
  docxSegments: DocxSegment[],
): AppState {
  return {
    ...state,
    source: "docx",
    fileName,
    inputText,
    docxSegments,
  };
}

export function setInferredTitle(state: AppState, inferredTitle: string): AppState {
  return {
    ...state,
    metadata: {
      ...state.metadata,
      inferredTitle,
    },
  };
}

export function setProcessedResult(state: AppState, result: ProcessedTranscript): AppState {
  const next = {
    ...state,
    result,
  };
  return refreshOutput(next);
}

export function refreshOutput(state: AppState): AppState {
  if (!state.result) {
    return {
      ...state,
      outputText: "",
    };
  }
  return {
    ...state,
    outputText: buildPlainTextOutput(state.result, state.metadata),
  };
}

export function clearApplication(theme: ThemePreference): AppState {
  return createInitialState(theme);
}
