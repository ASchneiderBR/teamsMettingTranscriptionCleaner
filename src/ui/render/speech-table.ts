import type { AppRefs } from "../refs";
import type { DistributionRowViewModel } from "../view-models";

export function renderSpeechTable(refs: AppRefs, rows: DistributionRowViewModel[]): void {
  renderDistributionTable(refs.statsBody, rows, "Tempo");
}

export function renderDistributionTable(
  tbody: HTMLTableSectionElement,
  rows: DistributionRowViewModel[],
  valueLabel: string,
): void {
  tbody.innerHTML = "";
  if (!rows.length) {
    tbody.append(createEmptyRow(4));
    return;
  }

  const fragment = document.createDocumentFragment();
  for (const row of rows) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${escapeHtml(row.name)}</strong></td>
      <td title="${valueLabel}">${row.value}</td>
      <td>${row.percent}</td>
      <td><div class="bar" title="${row.percent}"><div style="width:${row.barWidth.toFixed(1)}%"></div></div></td>
    `;
    fragment.append(tr);
  }
  tbody.append(fragment);
}

function createEmptyRow(colSpan: number): HTMLTableRowElement {
  const tr = document.createElement("tr");
  const td = document.createElement("td");
  td.colSpan = colSpan;
  td.className = "emptyState";
  td.textContent = "Sem dados";
  tr.append(td);
  return tr;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
