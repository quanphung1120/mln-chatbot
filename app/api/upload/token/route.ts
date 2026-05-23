import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse, type NextRequest } from "next/server";
import path from "path";
import dbConnect from "@/lib/mongoose";
import DocumentModel from "@/lib/models/Document";
import ChunkModel from "@/lib/models/Chunk";
import { auth } from "@clerk/nextjs/server";
import { generateEmbeddings } from "@/lib/embeddings";
import { notFound } from "next/navigation";

// ---------------------------------------------------------------------------
// Allow-listed MIME types for upload
// ---------------------------------------------------------------------------
const ALLOWED_CONTENT_TYPES = new Set([
  "text/plain",
  "text/markdown",
  "text/x-markdown",
]);

// 10 MB maximum (in bytes)
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

// Sentence splitter regex (handles ., ?, ! with trailing spaces / newlines)
// Keeps things simple — no external NLP dependency needed.
const SENTENCE_REGEX = /(?<=[.?!])\s+/;

/**
 * Splits plain text into sentence-level chunks.
 * Filters out blank / whitespace-only entries.
 */
function splitIntoSentences(text: string): string[] {
  return text
    .split(SENTENCE_REGEX)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

// ---------------------------------------------------------------------------
// POST /api/upload/token
// Server-side half of the Vercel Blob client-upload handshake.
// The client calls this to get a short-lived upload token; the actual bytes
// are streamed directly from the browser to Vercel Blob — they never pass
// through this server.
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;
  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const safeName = path.basename(pathname);
        const { userId } = await auth();
        if (!userId) notFound();
        return {
          allowedContentTypes: Array.from(ALLOWED_CONTENT_TYPES),
          addRandomSuffix: true,
          pathname: `${userId}/${safeName}`,
          tokenPayload: JSON.stringify({ originalPathname: safeName }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Called by Vercel after the upload lands in storage.
        console.info("[upload/token] Upload completed. Starting ingestion:", {
          url: blob.url,
          tokenPayload,
        });

        try {
          // ── Parse tokenPayload to get original filename ────────────────────
          let originalFilename = "";
          if (tokenPayload) {
            try {
              const parsed = JSON.parse(tokenPayload);
              originalFilename = parsed.originalPathname || "";
            } catch (e) {
              console.warn("[upload/token] Failed to parse tokenPayload:", e);
            }
          }
          if (!originalFilename) {
            originalFilename = path.basename(blob.pathname);
          }
          const safeFilename = path.basename(originalFilename).slice(0, 255);

          // ── Fetch document text from Vercel Blob ───────────────────────────
          const fetchRes = await fetch(blob.url);
          if (!fetchRes.ok) {
            throw new Error(`Failed to fetch blob from URL: ${blob.url} (status: ${fetchRes.status})`);
          }
          const rawText = await fetchRes.text();

          // ── Split into sentences ───────────────────────────────────────────
          const sentences = splitIntoSentences(rawText);
          if (sentences.length === 0) {
            console.warn(`[upload/token] Uploaded document "${safeFilename}" contains no readable text.`);
            return;
          }

          // Determine MIME type and content length from the fetched response
          const resolvedMimeType = fetchRes.headers.get("content-type")?.split(";")[0]?.trim() || "text/plain";
          const resolvedSizeBytes = Buffer.byteLength(rawText);

          // ── Persist to MongoDB ─────────────────────────────────────────────
          await dbConnect();

          // 1. Create the parent Document record
          const doc = await DocumentModel.create({
            filename: safeFilename,
            blobUrl: blob.url,
            mimeType: resolvedMimeType,
            sizeBytes: resolvedSizeBytes,
            chunkCount: sentences.length,
          });

          // Generate embeddings in batch for all split sentences
          let embeddings: number[][] = [];
          try {
            console.info(`[upload/token] Generating embeddings for ${sentences.length} sentences...`);
            embeddings = await generateEmbeddings(sentences);
          } catch (embedErr) {
            console.error("[upload/token] Ingestion failed during embedding generation:", embedErr);
            throw embedErr;
          }

          // 2. Bulk-insert Chunk documents
          const chunkDocs = sentences.map((text, index) => ({
            documentId: doc._id,
            index,
            text: text.slice(0, 5000), // Truncate to schema limit
            embedding: embeddings[index] || [],
          }));

          await ChunkModel.insertMany(chunkDocs, { ordered: false });

          console.info(
            `[upload/token] Ingested "${safeFilename}": ${sentences.length} chunks (doc=${doc._id})`
          );
        } catch (err) {
          console.error("[upload/token] Ingestion failed inside onUploadCompleted:", err);
          throw err;
        }
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    // Return generic error to client; detail is logged for developers only
    console.error("[upload/token] handleUpload error:", error);
    return NextResponse.json(
      { error: "Failed to generate upload token." },
      { status: 400 }
    );
  }
}
