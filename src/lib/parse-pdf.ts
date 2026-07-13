import { LiteParse } from "@llamaindex/liteparse";

// Single shared parser instance — loading PDFium is the expensive part.
// OCR is disabled: it needs a tesseract runtime that isn't available on
// Vercel, so scanned (image-only) PDFs will yield empty text.
const parser = new LiteParse({
  ocrEnabled: false,
  outputFormat: "markdown",
  imageMode: "off",
  quiet: true,
});

/**
 * Extract a PDF's content as markdown. Headings are inferred from font
 * sizes and wrapped lines are merged back into paragraphs, so the output
 * chunks cleanly along document structure.
 */
export async function parsePdfToMarkdown(pdfBuffer: Buffer): Promise<string> {
  const result = await parser.parse(pdfBuffer);
  return result.text;
}
