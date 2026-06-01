CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE "chat_sessions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "userId" TEXT,
  "title" VARCHAR(255) NOT NULL,
  "messages" JSONB NOT NULL DEFAULT '[]',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "chat_sessions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "documents" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "filename" VARCHAR(255) NOT NULL,
  "blobUrl" TEXT NOT NULL,
  "mimeType" VARCHAR(120) NOT NULL,
  "sizeBytes" INTEGER NOT NULL,
  "chunkCount" INTEGER NOT NULL DEFAULT 0,
  "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "chunks" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "documentId" UUID NOT NULL,
  "index" INTEGER NOT NULL,
  "text" TEXT NOT NULL,
  "embedding" vector(1536) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "chunks_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "chat_sessions_userId_updatedAt_idx" ON "chat_sessions" ("userId", "updatedAt");
CREATE INDEX "documents_uploadedAt_idx" ON "documents" ("uploadedAt");
CREATE INDEX "chunks_documentId_idx" ON "chunks" ("documentId");
CREATE UNIQUE INDEX "chunks_documentId_index_key" ON "chunks" ("documentId", "index");
CREATE INDEX "chunks_embedding_hnsw_cosine_idx" ON "chunks" USING hnsw ("embedding" vector_cosine_ops);

ALTER TABLE "chunks"
  ADD CONSTRAINT "chunks_documentId_fkey"
  FOREIGN KEY ("documentId") REFERENCES "documents"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
