import { embed, embedMany } from "ai";

import { openrouter } from "@/lib/openrouter";

// Standard premium 1536-dimensional embedding model hosted on OpenAI via OpenRouter
const EMBEDDING_MODEL = openrouter.embeddingModel("openai/text-embedding-3-small");

/**
 * Generate a 1536-dimensional embedding vector for a single text query.
 * Useful for query-time vector generation.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error("[embeddings] Cannot generate embedding for empty or whitespace string.");
  }

  const { embedding } = await embed({
    model: EMBEDDING_MODEL,
    value: trimmed,
  });

  return embedding;
}

/**
 * Generate 1536-dimensional embedding vectors for a batch of text values.
 * Automatically slices the requests into robust batches to respect API limits.
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const sanitized = texts.map((t) => t.trim()).filter((t) => t.length > 0);
  if (sanitized.length === 0) {
    return [];
  }

  const BATCH_SIZE = 100;
  const results: number[][] = [];

  for (let i = 0; i < sanitized.length; i += BATCH_SIZE) {
    const batch = sanitized.slice(i, i + BATCH_SIZE);
    try {
      const { embeddings } = await embedMany({
        model: EMBEDDING_MODEL,
        values: batch,
      });
      results.push(...embeddings);
    } catch (err) {
      console.error(`[embeddings] Failed to generate embeddings for batch starting at index ${i}:`, err);
      throw err;
    }
  }

  return results;
}
