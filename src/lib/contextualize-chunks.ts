import { generateText } from "ai";

import { openrouter, PIPELINE_MODEL } from "@/lib/openrouter";
import type { TextChunk } from "@/lib/chunk-text";

// How much of the document the model sees when situating a chunk.
const MAX_DOC_CHARS = 20_000;
// Parallel LLM calls during ingestion.
const CONCURRENCY = 8;

const SYSTEM_PROMPT =
  "You situate a chunk of a document within the whole document to improve " +
  "search retrieval. Answer with 1-2 short sentences of context and nothing " +
  "else — no preamble, no quotes. Respond in the same language as the document.";

/**
 * Contextual retrieval (Anthropic-style): prepend a short LLM-generated
 * description of where each chunk sits in the document, so the embedded text
 * carries document-level context the chunk alone lacks.
 *
 * Best-effort — if a context call fails, the original chunk is kept as-is.
 */
export async function contextualizeChunks(
  chunks: TextChunk[],
  documentText: string,
  filename: string,
): Promise<TextChunk[]> {
  if (chunks.length === 0) return [];

  const docExcerpt =
    documentText.length > MAX_DOC_CHARS
      ? `${documentText.slice(0, MAX_DOC_CHARS)}\n[document truncated]`
      : documentText;

  const results: TextChunk[] = new Array(chunks.length);
  let nextIndex = 0;

  async function worker(): Promise<void> {
    while (nextIndex < chunks.length) {
      const i = nextIndex++;
      const chunk = chunks[i];
      try {
        const { text } = await generateText({
          model: openrouter(PIPELINE_MODEL),
          system: SYSTEM_PROMPT,
          prompt:
            `<document filename="${filename}">\n${docExcerpt}\n</document>\n\n` +
            `Here is the chunk we want to situate within the document:\n` +
            `<chunk>\n${chunk.text}\n</chunk>\n\n` +
            `Give the succinct context for this chunk.`,
        });
        const context = text.trim();
        results[i] = context
          ? { index: chunk.index, text: `${context}\n\n${chunk.text}` }
          : chunk;
      } catch (err) {
        console.warn(
          `[contextualize] Failed for chunk ${chunk.index} of "${filename}"; keeping raw chunk:`,
          err,
        );
        results[i] = chunk;
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, chunks.length) }, worker),
  );

  return results;
}
