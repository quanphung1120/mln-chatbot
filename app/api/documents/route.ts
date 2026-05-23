import { NextResponse, type NextRequest } from "next/server";
import dbConnect from "@/lib/mongoose";
import DocumentModel from "@/lib/models/Document";

// Only accept blob URLs from Vercel's storage domain
const BLOB_URL_HOSTNAME = "public.blob.vercel-storage.com";

/**
 * Validates that the URL is an absolute HTTPS URL pointing to Vercel Blob.
 * Prevents SSRF by enforcing an exact hostname allow-list.
 */
function validateBlobUrl(raw: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error("Invalid blobUrl: not a valid URL.");
  }
  if (parsed.protocol !== "https:") {
    throw new Error("Invalid blobUrl: must use HTTPS.");
  }
  // Strict hostname check — prevents SSRF to internal services
  if (parsed.hostname !== BLOB_URL_HOSTNAME) {
    throw new Error(
      `Invalid blobUrl: hostname must be ${BLOB_URL_HOSTNAME}.`
    );
  }
  return parsed;
}

// ---------------------------------------------------------------------------
// GET /api/documents
//
// Query parameters: ?blobUrl=...
//
// 1. Validates input blobUrl (SSRF-safe check)
// 2. Connects to the database and checks if the document is ingested.
// 3. Returns status: "pending" or "completed" along with documentId and chunkCount.
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const blobUrl = searchParams.get("blobUrl");

  if (!blobUrl) {
    return NextResponse.json(
      { error: "Missing blobUrl query parameter." },
      { status: 400 }
    );
  }

  // ── Validate blobUrl (SSRF-safe) ──────────────────────────────────────────
  try {
    validateBlobUrl(blobUrl);
  } catch (err) {
    console.warn("[documents GET] blobUrl validation failed:", err);
    return NextResponse.json(
      { error: "Invalid blobUrl." },
      { status: 400 }
    );
  }

  try {
    await dbConnect();

    // Find the document in the DB
    const doc = await DocumentModel.findOne({ blobUrl });

    if (!doc) {
      // Document is not yet in the DB, meaning ingestion is still processing
      return NextResponse.json({ status: "pending" });
    }

    // Ingestion has completed successfully
    return NextResponse.json({
      status: "completed",
      documentId: doc._id.toString(),
      chunkCount: doc.chunkCount,
    });
  } catch (err) {
    console.error("[documents GET] DB error:", err);
    return NextResponse.json(
      { error: "Failed to retrieve document status." },
      { status: 500 }
    );
  }
}
