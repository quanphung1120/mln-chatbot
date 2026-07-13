import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { generateEmbedding } from "@/lib/embeddings";

export interface SearchResult {
  text: string;
  filename: string;
  score: number;
}

function queryChunks(vector: string, take: number, courseCode?: string): Promise<SearchResult[]> {
  const courseFilter = courseCode
    ? Prisma.sql`WHERE d."filename" ILIKE ${`%${courseCode}%`}`
    : Prisma.empty;

  return prisma.$queryRaw<SearchResult[]>`
    SELECT
      c."text",
      d."filename",
      1 - (c."embedding" <=> ${vector}::vector) AS "score"
    FROM "chunks" c
    INNER JOIN "documents" d ON d."id" = c."documentId"
    ${courseFilter}
    ORDER BY c."embedding" <=> ${vector}::vector
    LIMIT ${take}
  `;
}

export async function searchDocumentation(
  query: string,
  limit = 5,
  courseCode?: string,
): Promise<SearchResult[]> {
  const embedding = await generateEmbedding(query);
  const vector = `[${embedding.join(",")}]`;
  const take = Math.max(1, Math.min(limit, 20));

  let rows = await queryChunks(vector, take, courseCode);

  // Document filenames are arbitrary uploads and may not contain the course
  // code. When the filter matches nothing, search all documents instead —
  // vector ranking still surfaces the right course's material.
  if (rows.length === 0 && courseCode) {
    console.warn(`[vector-search] No documents matched course "${courseCode}"; searching all documents.`);
    rows = await queryChunks(vector, take);
  }

  console.info(`[vector-search] pgvector retrieved ${rows.length} chunks.`);
  return rows;
}
