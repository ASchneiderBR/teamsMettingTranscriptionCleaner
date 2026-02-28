import { unzipSync } from "fflate";
import { AppError } from "../../domain/transcript/errors";

export async function readDocxDocumentXml(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const archive = unzipSync(new Uint8Array(buffer));
  const documentXml = archive["word/document.xml"];

  if (!documentXml) {
    throw new AppError("invalid_docx", "O arquivo DOCX não contém word/document.xml.");
  }

  return new TextDecoder("utf-8").decode(documentXml);
}
