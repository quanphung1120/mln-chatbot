import mongoose, { Schema, type Document as MongoDocument } from "mongoose";

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------
export interface IDocument extends MongoDocument {
  filename: string;      // sanitised original filename (basename only)
  blobUrl: string;       // URL in Vercel Blob storage
  mimeType: string;      // e.g. "text/plain"
  sizeBytes: number;     // original file size in bytes
  chunkCount: number;    // how many sentence-chunks were extracted
  uploadedAt: Date;
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
const DocumentSchema = new Schema<IDocument>(
  {
    // Store only the basename — never raw user-supplied path components
    // to prevent path traversal when the value is later used in file IO.
    filename: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },
    blobUrl: {
      type: String,
      required: true,
    },
    // Allow-listed MIME types (plain-text / markdown only for now)
    // TODO(security): extend allow-list when PDF support is added
    mimeType: {
      type: String,
      required: true,
      enum: ["text/plain", "text/markdown", "text/x-markdown"],
    },
    sizeBytes: {
      type: Number,
      required: true,
      min: 0,
      max: 10 * 1024 * 1024, // 10 MB ceiling — prevents DoS via huge files
    },
    chunkCount: {
      type: Number,
      default: 0,
    },
    uploadedAt: {
      type: Date,
      default: () => new Date(),
    },
  },
  { collection: "documents" }
);

// ---------------------------------------------------------------------------
// Model (guard against Next.js hot-reload re-registration)
// ---------------------------------------------------------------------------
const DocumentModel =
  (mongoose.models.Document as mongoose.Model<IDocument> | undefined) ??
  mongoose.model<IDocument>("Document", DocumentSchema);

export default DocumentModel;
