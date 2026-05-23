import dbConnect from "@/lib/mongoose";
import ChunkModel from "@/lib/models/Chunk";
import { generateEmbedding } from "./embeddings";

interface SearchResult {
  text: string;
  filename: string;
  score: number;
}

/**
 * Perform a vector search on uploaded documentation using MongoDB Atlas Vector Search.
 * Requires a configured Atlas Search index named "vector_index" on the chunks collection.
 */
export async function searchDocumentation(query: string, limit = 5): Promise<SearchResult[]> {
  await dbConnect();

  const queryEmbedding = await generateEmbedding(query);

  const results = await ChunkModel.aggregate([
    {
      $vectorSearch: {
        index: "vector_index",
        path: "embedding",
        queryVector: queryEmbedding,
        numCandidates: Math.max(limit * 10, 100),
        limit,
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

  console.info(`[vector-search] Atlas Vector Search retrieved ${results.length} chunks.`);

  return results.map((r) => ({
    text: r.text,
    filename: r.filename,
    score: r.score ?? 0,
  }));
}
