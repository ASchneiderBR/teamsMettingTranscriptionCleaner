export function inferTitleFromFilename(name: string): string {
  const base = name.replace(/\.[^.]+$/, "");
  return base.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
}

export function buildDownloadFilename(title: string): string {
  const safeTitle = (title || "transcricao")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^\w\d\s-]+/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase();
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  return `${safeTitle || "transcricao"}-limpa-${stamp}.txt`;
}
