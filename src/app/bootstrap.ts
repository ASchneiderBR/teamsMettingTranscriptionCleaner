import { applyTheme, loadThemePreference, resolveTheme } from "../platform/browser/storage";
import { type AppRefs, createAppRefs } from "../ui/refs";
import { renderHeader } from "../ui/render/header";
import { renderInputPanel } from "../ui/render/input-panel";
import { renderLexicalTable } from "../ui/render/lexical-table";
import { renderNgrams } from "../ui/render/ngrams";
import { renderOutputPanel } from "../ui/render/output-panel";
import { renderSpeechTable } from "../ui/render/speech-table";
import { renderStatus } from "../ui/render/status";
import { renderTimeline } from "../ui/render/timeline";
import { renderTurnsTable } from "../ui/render/turns-table";
import { renderWordCloud } from "../ui/render/word-cloud";
import { createShell } from "../ui/shell";
import { createController } from "./controller";
import { selectAppViewModel } from "./selectors";
import { createInitialState } from "./state";
import type { AppState } from "./state";
import { type AppStore, createStore } from "./store";

export function bootstrap(container: Element | null): void {
  if (!container) {
    throw new Error("Elemento raiz #app não encontrado.");
  }

  createShell(container);
  const refs = createAppRefs(container);
  const initialTheme = loadThemePreference();
  applyTheme(initialTheme);

  const store = createStore(createInitialState(initialTheme));
  renderApp(refs, store.getState());
  store.subscribe(() => renderApp(refs, store.getState()));
  createController(refs, store);
}

export function renderApp(refs: AppRefs, state: AppState): void {
  const viewModel = selectAppViewModel(state);
  renderHeader(refs, viewModel);
  renderInputPanel(refs, viewModel);
  renderOutputPanel(refs, viewModel);
  renderSpeechTable(refs, viewModel.speechRows);
  renderTurnsTable(refs, viewModel.turnsMeta, viewModel.turnRows);
  renderLexicalTable(refs, viewModel.lexicalMeta, viewModel.lexicalRows);
  renderNgrams(refs, viewModel.ngramMeta, viewModel.bigrams, viewModel.trigrams);
  renderWordCloud(refs, viewModel.wordCloud, viewModel.wordCloudMeta);
  renderTimeline(refs, viewModel);
  renderStatus(refs.status, viewModel.processStatus);

  if (refs.meetingDate.value !== state.metadata.date) {
    refs.meetingDate.value = state.metadata.date;
  }
  if (refs.meetingStart.value !== state.metadata.startTime) {
    refs.meetingStart.value = state.metadata.startTime;
  }
  if (refs.meetingTitle.value !== state.metadata.title) {
    refs.meetingTitle.value = state.metadata.title;
  }
  if (refs.meetingNotes.value !== state.metadata.notes) {
    refs.meetingNotes.value = state.metadata.notes;
  }

  const resolvedTheme = resolveTheme(state.theme);
  refs.themeToggle.textContent = resolvedTheme === "dark" ? "Modo claro" : "Modo escuro";
  refs.themeToggle.setAttribute("aria-pressed", String(resolvedTheme === "dark"));
}
