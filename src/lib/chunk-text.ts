export interface TextChunk {
  index: number;
  text: string;
}

interface ChunkTextOptions {
  chunkSize?: number;
  overlap?: number;
}

export function chunkText(
  input: string,
  { chunkSize = 800, overlap = 100 }: ChunkTextOptions = {},
): TextChunk[] {
  const text = input.replace(/\s+/g, " ").trim();
  if (!text) return [];
  if (chunkSize <= 0) throw new Error("chunkSize must be greater than 0");
  if (overlap < 0 || overlap >= chunkSize) {
    throw new Error("overlap must be greater than or equal to 0 and less than chunkSize");
  }

  const chunks: TextChunk[] = [];
  let start = 0;

  while (start < text.length) {
    const targetEnd = Math.min(start + chunkSize, text.length);
    let end = targetEnd;

    if (targetEnd < text.length) {
      const boundary = Math.max(
        text.lastIndexOf(". ", targetEnd),
        text.lastIndexOf("? ", targetEnd),
        text.lastIndexOf("! ", targetEnd),
        text.lastIndexOf("\n", targetEnd),
        text.lastIndexOf(" ", targetEnd),
      );

      if (boundary > start + chunkSize * 0.5) {
        end = boundary + 1;
      }
    }

    const chunk = text.slice(start, end).trim();
    if (chunk) {
      chunks.push({ index: chunks.length, text: chunk });
    }

    if (end >= text.length) break;
    start = Math.max(0, end - overlap);
  }

  return chunks;
}
