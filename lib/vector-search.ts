import dbConnect from "@/lib/mongoose";
import ChunkModel from "@/lib/models/Chunk";
import DocumentModel from "@/lib/models/Document";
import { generateEmbedding } from "./embeddings";

interface SearchResult {
  text: string;
  filename: string;
  score: number;
}

/**
 * Calculates the dot product between two vectors.
 * Since OpenAI text-embedding-3-small outputs normalized unit-length vectors (magnitude = 1),
 * the dot product is exactly equal to the cosine similarity.
 */
function dotProduct(a: number[], b: number[]): number {
  let sum = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    sum += a[i] * b[i];
  }
  return sum;
}

/**
 * Perform a hybrid vector search on uploaded documentation:
 * 1. Generates query vector embedding using OpenRouter.
 * 2. Attempts native MongoDB Atlas Vector Search ($vectorSearch).
 * 3. Falls back to in-memory dot product scoring if running locally or if index is missing.
 */
export async function searchDocumentation(query: string, limit = 5): Promise<SearchResult[]> {
  await dbConnect();

  try {
    const queryEmbedding = await generateEmbedding(query);

    // ── 1. Native MongoDB Atlas Vector Search (Production) ────────────────────
    try {
      const results = await ChunkModel.aggregate([
        {
          $vectorSearch: {
            index: "vector_index", // Configured Atlas Search Index Name
            path: "embedding",
            queryVector: queryEmbedding,
            numCandidates: Math.max(limit * 10, 100),
            limit: limit,
          },
        },
        {
          $lookup: {
            from: "documents",
            localField: "documentId",
            foreignField: "_id",
            as: "document",
          },
        },
        {
          $unwind: {
            path: "$document",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            text: 1,
            filename: { $ifNull: ["$document.filename", "Unknown Document"] },
            score: { $meta: "vectorSearchScore" },
          },
        },
      ]);

      if (results && results.length > 0) {
        console.info(`[vector-search] Atlas Vector Search retrieved ${results.length} chunks.`);
        return results.map((r) => ({
          text: r.text,
          filename: r.filename,
          score: r.score || 0,
        }));
      }
    } catch (atlasErr: any) {
      // Atlas Search may not be configured (e.g. local Mongoose setup or index absent)
      console.warn(
        `[vector-search] Atlas Vector Search failed or not available. Falling back to in-memory. Reason: ${atlasErr.message}`
      );
    }

    // ── 2. In-Memory Cosine Similarity Search (Fallback / Development) ────────
    const chunks = await ChunkModel.find({
      embedding: { $exists: true, $ne: [] },
    }).populate({
      path: "documentId",
      model: DocumentModel,
      select: "filename",
    });

    if (chunks.length === 0) {
      console.warn("[vector-search] In-memory fallback evaluated 0 chunks. Ensure documents are indexed.");
      return [];
    }

    const scored = chunks.map((chunk: any) => {
      const chunkEmbedding = chunk.embedding || [];
      const score = chunkEmbedding.length > 0 ? dotProduct(queryEmbedding, chunkEmbedding) : 0;
      const filename = chunk.documentId ? (chunk.documentId as any).filename : "Unknown Document";

      return {
        text: chunk.text,
        filename,
        score,
      };
    });

    // Sort by descending similarity score
    scored.sort((a, b) => b.score - a.score);

    const topResults = scored.slice(0, limit);
    console.info(
      `[vector-search] In-memory search scanned ${chunks.length} chunks; returned top ${topResults.length} matches.`
    );

    return topResults;
  } catch (err) {
    console.error("[vector-search] Semantic search failed completely:", err);
    throw err;
  }
}
