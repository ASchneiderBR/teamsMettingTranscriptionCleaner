import { parseDocxXml } from "../domain/transcript/parse-docx";
import { processTranscript } from "../domain/transcript/process-transcript";
import { readClipboardText, writeClipboardText } from "../platform/browser/clipboard";
import { downloadTextFile } from "../platform/browser/download";
import { observeElementWidth } from "../platform/browser/resize-observer";
import { applyTheme, resolveTheme, saveThemePreference } from "../platform/browser/storage";
import { buildDownloadFilename, inferTitleFromFilename } from "../platform/files/filename";
import { readDocxDocumentXml } from "../platform/files/read-docx";
import { readTextFile } from "../platform/files/read-text-file";
import { formatDateInput, formatTimeInput } from "../platform/time/format";
import type { AppRefs } from "../ui/refs";
import {
  clearApplication,
  loadDocxSource,
  loadVttSource,
  refreshOutput,
  setDragActive,
  setInferredTitle,
  setInputText,
  setOutputStatus,
  setProcessStatus,
  setProcessedResult,
  setTheme,
  setTimelineWidth,
  updateMetadata,
} from "./actions";
import type { AppState, ThemePreference } from "./state";
import type { AppStore } from "./store";

export function createController(refs: AppRefs, store: AppStore<AppState>): () => void {
  const unobserveTimeline = observeElementWidth(refs.timelineChart, (width) => {
    store.setState((state) => setTimelineWidth(state, width));
  });

  const onFileChange = async () => {
    const file = refs.file.files?.[0];
    if (!file) {
      return;
    }
    await handleSelectedFile(file);
  };

  const handleSelectedFile = async (file: File) => {
    try {
      const inferredTitle = inferTitleFromFilename(file.name);
      store.setState((state) => setInferredTitle(state, inferredTitle));

      if (file.name.toLowerCase().endsWith(".docx")) {
        store.setState((state) => setProcessStatus(state, `Lendo DOCX: ${file.name}...`, "muted"));
        const xml = await readDocxDocumentXml(file);
        const parsed = parseDocxXml(xml);
        store.setState((state) =>
          setProcessStatus(
            setOutputStatus(
              loadDocxSource(state, file.name, parsed.cleanText, parsed.segments),
              "—",
              "muted",
            ),
            `DOCX carregado: ${file.name} (${parsed.segments.length} fala(s))`,
            "success",
          ),
        );
        return;
      }

      store.setState((state) => setProcessStatus(state, `Lendo: ${file.name}...`, "muted"));
      const inputText = await readTextFile(file);
      store.setState((state) =>
        setProcessStatus(
          setOutputStatus(loadVttSource(state, file.name, inputText), "—", "muted"),
          `Arquivo carregado: ${file.name}`,
          "success",
        ),
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao ler o arquivo.";
      store.setState((state) => setProcessStatus(state, message, "warn"));
    }
  };

  const processCurrentSource = () => {
    const state = store.getState();
    try {
      const result =
        state.source === "docx"
          ? processTranscript({
              source: "docx",
              segments: state.docxSegments,
              cleanText: state.inputText,
            })
          : processTranscript({
              source: "vtt",
              rawText: state.inputText,
            });

      const lineCount = result.cleanText ? result.cleanText.split("\n").filter(Boolean).length : 0;
      store.setState((current) =>
        setOutputStatus(
          setProcessStatus(
            setProcessedResult(current, result),
            state.source === "docx" ? "Processado (DOCX)." : "Processado.",
            "success",
          ),
          `${lineCount} linha(s) na transcrição`,
          "success",
        ),
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao processar.";
      store.setState((current) => {
        const reset = {
          ...current,
          result: null,
          outputText: "",
        };
        return setProcessStatus(setOutputStatus(reset, "—", "muted"), message, "warn");
      });
    }
  };

  const onThemeToggle = () => {
    store.setState((state) => {
      const nextTheme = getNextTheme(state.theme);
      saveThemePreference(nextTheme);
      applyTheme(nextTheme, { animated: true });
      return setTheme(state, nextTheme);
    });
  };

  refs.file.addEventListener("change", onFileChange);
  refs.pickFile.addEventListener("click", (event) => {
    event.stopPropagation();
    refs.file.click();
  });
  refs.dropzone.addEventListener("click", () => refs.file.click());
  refs.dropzone.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      refs.file.click();
    }
  });
  refs.configCard.addEventListener("dragenter", (event) => {
    event.preventDefault();
    store.setState((state) => setDragActive(state, true));
  });
  refs.configCard.addEventListener("dragover", (event) => {
    event.preventDefault();
    store.setState((state) => setDragActive(state, true));
  });
  refs.configCard.addEventListener("dragleave", (event) => {
    if (event.currentTarget instanceof Node && event.relatedTarget instanceof Node) {
      if (event.currentTarget.contains(event.relatedTarget)) {
        return;
      }
    }
    store.setState((state) => setDragActive(state, false));
  });
  refs.configCard.addEventListener("drop", async (event) => {
    event.preventDefault();
    store.setState((state) => setDragActive(state, false));
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      await handleSelectedFile(file);
    }
  });
  refs.input.addEventListener("input", () => {
    store.setState((state) => setInputText(state, refs.input.value));
  });
  refs.meetingDate.addEventListener("input", () => {
    const value = formatDateInput(refs.meetingDate.value);
    refs.meetingDate.value = value;
    store.setState((state) => updateMetadata(state, "date", value));
  });
  refs.meetingStart.addEventListener("input", () => {
    const value = formatTimeInput(refs.meetingStart.value);
    refs.meetingStart.value = value;
    store.setState((state) => updateMetadata(state, "startTime", value));
  });
  refs.meetingTitle.addEventListener("input", () => {
    store.setState((state) => updateMetadata(state, "title", refs.meetingTitle.value));
  });
  refs.meetingNotes.addEventListener("input", () => {
    store.setState((state) => updateMetadata(state, "notes", refs.meetingNotes.value));
  });
  refs.process.addEventListener("click", processCurrentSource);
  refs.pasteInput.addEventListener("click", async () => {
    try {
      const text = await readClipboardText();
      if (!String(text || "").trim()) {
        store.setState((state) => setProcessStatus(state, "Área de transferência vazia.", "warn"));
        return;
      }
      refs.input.value = text;
      store.setState((state) =>
        setProcessStatus(setInputText(state, text), "Conteúdo colado.", "success"),
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Não foi possível ler a área de transferência.";
      store.setState((state) => setProcessStatus(state, message, "warn"));
    }
  });
  refs.clear.addEventListener("click", () => {
    const theme = store.getState().theme;
    store.setState(clearApplication(theme));
    refs.file.value = "";
    applyTheme(theme);
  });
  refs.copy.addEventListener("click", async () => {
    const text = store.getState().outputText;
    if (!text.trim()) {
      store.setState((state) => setOutputStatus(state, "Nada para copiar", "warn"));
      return;
    }
    try {
      await writeClipboardText(text, refs.output);
      store.setState((state) => setOutputStatus(state, "Copiado", "success"));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível copiar.";
      store.setState((state) => setOutputStatus(state, message, "warn"));
    }
  });
  refs.download.addEventListener("click", () => {
    const state = store.getState();
    if (!state.outputText.trim()) {
      store.setState((current) => setOutputStatus(current, "Nada para baixar", "warn"));
      return;
    }
    try {
      const title = state.metadata.title || state.metadata.inferredTitle || "transcricao";
      const filename = buildDownloadFilename(title);
      downloadTextFile(filename, state.outputText);
      store.setState((current) => setOutputStatus(current, "Download iniciado", "success"));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Não foi possível iniciar o download.";
      store.setState((current) => setOutputStatus(current, message, "warn"));
    }
  });
  refs.themeToggle.addEventListener("click", onThemeToggle);

  return () => {
    unobserveTimeline();
    refs.file.removeEventListener("change", onFileChange);
    refs.themeToggle.removeEventListener("click", onThemeToggle);
  };
}

function getNextTheme(theme: ThemePreference): ThemePreference {
  return resolveTheme(theme) === "dark" ? "light" : "dark";
}
