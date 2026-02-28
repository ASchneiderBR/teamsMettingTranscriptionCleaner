export type AppErrorCode =
  | "empty_input"
  | "invalid_vtt"
  | "invalid_docx"
  | "unsupported_docx"
  | "clipboard_unavailable"
  | "copy_failed"
  | "download_failed";

export class AppError extends Error {
  code: AppErrorCode;

  constructor(code: AppErrorCode, message: string) {
    super(message);
    this.name = "AppError";
    this.code = code;
  }
}
