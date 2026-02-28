import type { StatusViewModel } from "../view-models";

export function renderStatus(element: HTMLElement, status: StatusViewModel): void {
  element.textContent = status.message;
  element.className = `status ${status.tone}`;
}
