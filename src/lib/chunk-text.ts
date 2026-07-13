import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export interface TextChunk {
  index: number;
  text: string;
}

interface ChunkTextOptions {
  chunkSize?: number;
  overlap?: number;
}

/**
 * Split markdown/plain text into chunks along document structure: headings
 * first, then paragraphs, then sentences — falling back to a hard cut only
 * when a single unbroken run exceeds chunkSize.
 */
export async function chunkText(
  input: string,
  { chunkSize = 800, overlap = 100 }: ChunkTextOptions = {},
): Promise<TextChunk[]> {
  if (chunkSize <= 0) throw new Error("chunkSize must be greater than 0");
  if (overlap < 0 || overlap >= chunkSize) {
    throw new Error("overlap must be greater than or equal to 0 and less than chunkSize");
  }

  const text = input.trim();
  if (!text) return [];

  const splitter = RecursiveCharacterTextSplitter.fromLanguage("markdown", {
    chunkSize,
    chunkOverlap: overlap,
  });

  const pieces = (await splitter.splitText(text))
    .map((piece) => piece.trim())
    .filter((piece) => piece.length > 0);

  // The markdown splitter emits headings and stray fragments as standalone
  // pieces; a chunk like "# Chapter 1" is useless on its own, so fold short
  // pieces into the following chunk (or the previous one for the tail).
  const MIN_CHUNK_CHARS = 100;
  const merged: string[] = [];
  let pending = "";
  for (const piece of pieces) {
    const candidate = pending ? `${pending}\n\n${piece}` : piece;
    if (candidate.length < MIN_CHUNK_CHARS) {
      pending = candidate;
    } else {
      merged.push(candidate);
      pending = "";
    }
  }
  if (pending) {
    if (merged.length > 0) {
      merged[merged.length - 1] = `${merged[merged.length - 1]}\n\n${pending}`;
    } else {
      merged.push(pending);
    }
  }

  return merged.map((piece, index) => ({ index, text: piece }));
}
