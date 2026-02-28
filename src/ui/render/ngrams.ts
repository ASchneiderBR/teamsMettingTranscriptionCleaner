import type { NgramRow } from "../../domain/transcript/types";
import type { AppRefs } from "../refs";

export function renderNgrams(
  refs: AppRefs,
  meta: string,
  bigrams: NgramRow[],
  trigrams: NgramRow[],
): void {
  refs.ngramMeta.textContent = meta;
  renderNgramRows(refs.bigramBody, bigrams);
  renderNgramRows(refs.trigramBody, trigrams);
}

function renderNgramRows(tbody: HTMLTableSectionElement, rows: NgramRow[]): void {
  tbody.innerHTML = "";
  if (!rows.length) {
    tbody.append(createEmptyRow(2));
    return;
  }

  const fragment = document.createDocumentFragment();
  for (const row of rows) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="ngramTableWord" title="${escapeHtml(row.gram)}">${escapeHtml(row.gram)}</td>
      <td>${row.count}</td>
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
