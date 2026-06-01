CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE "chunks"
  ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
