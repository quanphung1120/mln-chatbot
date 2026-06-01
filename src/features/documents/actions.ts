"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
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
  const { userId } = await auth();
  if (!userId) return [];

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  if (user.publicMetadata?.role !== "admin") {
    return [];
  }

  try {
    const docs = await prisma.document.findMany({
      select: {
        id: true,
        filename: true,
        mimeType: true,
        sizeBytes: true,
        chunkCount: true,
        uploadedAt: true,
        blobUrl: true,
      },
      orderBy: { uploadedAt: "desc" },
    });

    return docs.map((doc) => ({
      id: doc.id,
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
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  if (user.publicMetadata?.role !== "admin") {
    throw new Error("Forbidden: Admins only");
  }

  const documentId = formData.get("documentId") as string;
  if (!documentId || typeof documentId !== "string") {
    throw new Error("Document ID is required");
  }

  const doc = await prisma.document.findUnique({
    where: { id: documentId },
  });
  if (!doc) {
    throw new Error("Document not found");
  }

  // 1. Delete the blob from Vercel storage
  try {
    await del(doc.blobUrl);
  } catch (blobErr) {
    // Log but don't block DB cleanup if blob deletion fails
    console.error("[deleteDocumentAction] Failed to delete blob:", blobErr);
  }

  // 2. Delete the Document record; chunks are removed by ON DELETE CASCADE.
  await prisma.document.delete({
    where: { id: documentId },
  });

  revalidatePath("/dashboard/upload");
}
