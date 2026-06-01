import { prisma } from "@/lib/db";
import { generateEmbedding } from "@/lib/embeddings";

interface SearchResult {
  text: string;
  filename: string;
  score: number;
}

function toVectorLiteral(embedding: number[]): string {
  return `[${embedding.join(",")}]`;
}

export async function searchDocumentation(
  query: string,
  limit = 5,
  courseCode?: string,
): Promise<SearchResult[]> {
  const embedding = await generateEmbedding(query);
  const vector = toVectorLiteral(embedding);
  const take = Math.max(1, Math.min(limit, 20));

  const rows = courseCode
    ? await prisma.$queryRaw<SearchResult[]>`
        SELECT
          c."text",
          d."filename",
          1 - (c."embedding" <=> ${vector}::vector) AS "score"
        FROM "chunks" c
        INNER JOIN "documents" d ON d."id" = c."documentId"
        WHERE d."filename" ILIKE ${`%${courseCode}%`}
        ORDER BY c."embedding" <=> ${vector}::vector
        LIMIT ${take}
      `
    : await prisma.$queryRaw<SearchResult[]>`
        SELECT
          c."text",
          d."filename",
          1 - (c."embedding" <=> ${vector}::vector) AS "score"
        FROM "chunks" c
        INNER JOIN "documents" d ON d."id" = c."documentId"
        ORDER BY c."embedding" <=> ${vector}::vector
        LIMIT ${take}
      `;

  console.info(`[vector-search] pgvector retrieved ${rows.length} chunks.`);
  return rows;
}
