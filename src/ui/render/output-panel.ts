import type { AppRefs } from "../refs";
import type { AppViewModel } from "../view-models";
import { renderStatus } from "./status";

export function renderOutputPanel(refs: AppRefs, viewModel: AppViewModel): void {
  if (refs.output.value !== viewModel.outputText) {
    refs.output.value = viewModel.outputText;
  }
  refs.outChars.textContent = viewModel.outputInfo.chars;
  refs.outTokens.textContent = viewModel.outputInfo.tokens;
  renderStatus(refs.outStatus, viewModel.outputStatus);
}
