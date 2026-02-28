import type { AppRefs } from "../refs";
import type { DistributionRowViewModel } from "../view-models";
import { renderDistributionTable } from "./speech-table";

export function renderTurnsTable(
  refs: AppRefs,
  turnsMeta: string,
  rows: DistributionRowViewModel[],
): void {
  refs.turnsMeta.textContent = turnsMeta;
  renderDistributionTable(refs.turnsBody, rows, "Turnos");
}
