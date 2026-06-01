import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse, type NextRequest } from "next/server";
import path from "path";
import pdf from "pdf-parse";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { Prisma } from "@/generated/prisma/client";

import { prisma } from "@/lib/db";
import { chunkText } from "@/lib/chunk-text";
import { generateEmbeddings } from "@/lib/embeddings";

// Must run on Node.js runtime for pdf parsing and server-side ingestion.
export const runtime = "nodejs";

// ---------------------------------------------------------------------------
// Security: Allow-listed MIME types for upload
// ---------------------------------------------------------------------------
const ALLOWED_CONTENT_TYPES = new Set([
  "text/plain",
  "text/markdown",
  "text/x-markdown",
  "application/pdf",
]);

// 10 MB maximum (in bytes) — prevents DoS via massive file uploads
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

function toVectorLiteral(embedding: number[]): string {
  return `[${embedding.join(",")}]`;
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
        // Security: only keep the basename to prevent path traversal
        const safeName = path.basename(pathname);
        const { userId } = await auth();
        if (!userId) notFound();

        const client = await clerkClient();
        const user = await client.users.getUser(userId);
        if (user.publicMetadata?.role !== "admin") {
          throw new Error("Forbidden: Admins only");
        }

        return {
          allowedContentTypes: Array.from(ALLOWED_CONTENT_TYPES),
          maximumSizeInBytes: MAX_SIZE_BYTES,
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
          // ── Parse tokenPayload to get original filename ──────────────────
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
          // Security: strip path traversal sequences, limit length
          const safeFilename = path.basename(originalFilename).slice(0, 255);

          // ── Fetch document content from Vercel Blob ──────────────────────
          const fetchRes = await fetch(blob.url);
          if (!fetchRes.ok) {
            throw new Error(
              `Failed to fetch blob: ${blob.url} (status: ${fetchRes.status})`,
            );
          }

          // Determine MIME type from the fetched response
          const resolvedMimeType =
            fetchRes.headers.get("content-type")?.split(";")[0]?.trim() ||
            "text/plain";

          let rawText = "";
          let resolvedSizeBytes = 0;

          if (resolvedMimeType === "application/pdf") {
            const arrayBuffer = await fetchRes.arrayBuffer();
            resolvedSizeBytes = arrayBuffer.byteLength;

            const pdfBuffer = Buffer.from(arrayBuffer);
            const parsedPdf = await pdf(pdfBuffer);
            rawText = parsedPdf.text;
          } else {
            rawText = await fetchRes.text();
            resolvedSizeBytes = Buffer.byteLength(rawText);
          }

          const chunks = chunkText(rawText, { chunkSize: 800, overlap: 100 });

          if (chunks.length === 0) {
            console.warn(
              `[upload/token] Document "${safeFilename}" yielded no chunks.`,
            );
            return;
          }

          const doc = await prisma.document.create({
            data: {
              filename: safeFilename,
              blobUrl: blob.url,
              mimeType: resolvedMimeType,
              sizeBytes: resolvedSizeBytes,
              chunkCount: chunks.length,
            },
          });

          const embeddings = await generateEmbeddings(
            chunks.map((chunk) => chunk.text),
          );

          const chunkRows = chunks.map((chunk, index) => Prisma.sql`
            (gen_random_uuid(), ${doc.id}::uuid, ${chunk.index}, ${chunk.text}, ${toVectorLiteral(embeddings[index])}::vector)
          `);

          await prisma.$executeRaw`
            INSERT INTO "chunks" ("id", "documentId", "index", "text", "embedding")
            VALUES ${Prisma.join(chunkRows)}
          `;

          console.info(
            `[upload/token] Ingested "${safeFilename}": ${chunks.length} chunks (doc=${doc.id})`,
          );
        } catch (err) {
          console.error(
            "[upload/token] Ingestion failed inside onUploadCompleted:",
            err,
          );
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
      { status: 400 },
    );
  }
}
