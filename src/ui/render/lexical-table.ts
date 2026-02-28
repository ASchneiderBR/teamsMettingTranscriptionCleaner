import type { AppRefs } from "../refs";
import type { LexicalRowViewModel } from "../view-models";

export function renderLexicalTable(refs: AppRefs, meta: string, rows: LexicalRowViewModel[]): void {
  refs.lexicalMeta.textContent = meta;
  refs.lexicalBody.innerHTML = "";
  if (!rows.length) {
    refs.lexicalBody.append(createEmptyRow(4));
    return;
  }

  const fragment = document.createDocumentFragment();
  for (const row of rows) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${escapeHtml(row.name)}</strong></td>
      <td>${row.types}</td>
      <td>${row.ttr}</td>
      <td>${row.mtld}</td>
    `;
    fragment.append(tr);
  }
  refs.lexicalBody.append(fragment);
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
