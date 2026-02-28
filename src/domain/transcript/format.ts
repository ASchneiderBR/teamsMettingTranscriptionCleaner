export function formatDuration(seconds: number): string {
  const safe = Math.max(0, Math.round(seconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
}

export function formatCount(value: number): string {
  return Number(value || 0).toLocaleString("pt-BR");
}

export function formatRatioPercent(value: number): string {
  return `${Math.round(value || 0)}%`;
}

export function formatMtldValue(value: number | null): string {
  if (value === null || !Number.isFinite(value)) {
    return "—";
  }
  return value.toFixed(1);
}
