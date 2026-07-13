import { extractText, getDocumentProxy } from "unpdf";

/**
 * Extract a PDF's text content. Pure JS/WASM (PDF.js under the hood) — no
 * native binaries, so it runs reliably on Vercel serverless. Scanned
 * (image-only) PDFs yield no text since OCR isn't performed.
 */
export async function parsePdfToText(pdfBuffer: Buffer): Promise<string> {
  const pdf = await getDocumentProxy(new Uint8Array(pdfBuffer));
  const { text } = await extractText(pdf, { mergePages: true });
  return text;
}
