import type { AppRefs } from "../refs";
import type { AppViewModel } from "../view-models";

export function renderInputPanel(refs: AppRefs, viewModel: AppViewModel): void {
  refs.dropMeta.textContent = viewModel.fileLabel;
  refs.dropzone.classList.toggle("dragover", viewModel.dragActive);
  refs.configCard.classList.toggle("dragover", viewModel.dragActive);
  if (refs.input.value !== viewModel.inputText) {
    refs.input.value = viewModel.inputText;
  }
}
