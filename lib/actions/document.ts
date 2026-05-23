"use server";

import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongoose";
import DocumentModel from "@/lib/models/Document";
import ChunkModel from "@/lib/models/Chunk";
import { revalidatePath } from "next/cache";
import { del } from "@vercel/blob";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface DocumentRow {
  id: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  chunkCount: number;
  uploadedAt: string; // ISO string — safe to serialize to Client Components
  blobUrl: string;
}

// ---------------------------------------------------------------------------
// getDocuments — list all uploaded documents
// ---------------------------------------------------------------------------
export async function getDocuments(): Promise<DocumentRow[]> {
  // TODO(security): When role-based access is implemented, restrict this to
  // admin users only. Currently all authenticated users can view documents.
  const { userId } = await auth();
  if (!userId) return [];

  try {
    await dbConnect();
    const docs = await DocumentModel.find()
      .select("filename mimeType sizeBytes chunkCount uploadedAt blobUrl")
      .sort({ uploadedAt: -1 })
      .lean();

    return docs.map((doc) => ({
      id: (doc._id as { toString(): string }).toString(),
      filename: doc.filename,
      mimeType: doc.mimeType,
      sizeBytes: doc.sizeBytes,
      chunkCount: doc.chunkCount,
      uploadedAt: doc.uploadedAt.toISOString(),
      blobUrl: doc.blobUrl,
    }));
  } catch (error) {
    console.error("[getDocuments] Failed to fetch documents:", error);
    return [];
  }
}

// ---------------------------------------------------------------------------
// deleteDocumentAction — remove a document, its chunks and its Vercel Blob
// ---------------------------------------------------------------------------
export async function deleteDocumentAction(formData: FormData): Promise<void> {
  // TODO(security): Restrict to admin role when role system is implemented.
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const documentId = formData.get("documentId") as string;
  if (!documentId || typeof documentId !== "string") {
    throw new Error("Document ID is required");
  }

  await dbConnect();

  // Fetch the document first to get the blobUrl for deletion
  const doc = await DocumentModel.findById(documentId).lean();
  if (!doc) {
    throw new Error("Document not found");
  }

  // 1. Delete all associated chunks
  await ChunkModel.deleteMany({ documentId });

  // 2. Delete the blob from Vercel storage
  try {
    await del(doc.blobUrl);
  } catch (blobErr) {
    // Log but don't block DB cleanup if blob deletion fails
    console.error("[deleteDocumentAction] Failed to delete blob:", blobErr);
  }

  // 3. Delete the Document record
  await DocumentModel.deleteOne({ _id: documentId });

  revalidatePath("/dashboard/upload");
}
