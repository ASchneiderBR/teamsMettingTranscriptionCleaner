import { AppError } from "../../domain/transcript/errors";

export function downloadTextFile(filename: string, text: string): void {
  try {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  } catch {
    throw new AppError("download_failed", "Não foi possível iniciar o download.");
  }
}
