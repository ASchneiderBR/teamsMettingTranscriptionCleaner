import { AppError } from "../../domain/transcript/errors";

export async function readClipboardText(): Promise<string> {
  if (!navigator.clipboard?.readText) {
    throw new AppError("clipboard_unavailable", "Clipboard não disponível no navegador.");
  }
  return navigator.clipboard.readText();
}

export async function writeClipboardText(
  text: string,
  element?: HTMLTextAreaElement,
): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  if (!element) {
    throw new AppError("copy_failed", "Não foi possível copiar.");
  }

  element.focus();
  element.select();
  const ok = typeof document.execCommand === "function" ? document.execCommand("copy") : false;
  if (!ok) {
    throw new AppError("copy_failed", "Não foi possível copiar.");
  }
}
