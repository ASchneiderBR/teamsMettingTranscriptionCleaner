export async function readTextFile(file: File): Promise<string> {
  return file.text();
}
