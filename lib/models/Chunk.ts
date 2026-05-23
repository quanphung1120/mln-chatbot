import mongoose, { Schema, type Document } from "mongoose";

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------
export interface IChunk extends Document {
  documentId: mongoose.Types.ObjectId; // ref → Document
  index: number;                        // sentence position (0-based)
  text: string;                         // the sentence text
  embedding?: number[];                 // vector embedding
  createdAt: Date;
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
const ChunkSchema = new Schema<IChunk>(
  {
    documentId: {
      type: Schema.Types.ObjectId,
      ref: "Document",
      required: true,
      index: true,
    },
    index: {
      type: Number,
      required: true,
    },
    // Limit individual chunk size to prevent storing malformed/huge strings
    text: {
      type: String,
      required: true,
      maxlength: 5000,
    },
    embedding: {
      type: [Number],
      required: false,
    },
    createdAt: {
      type: Date,
      default: () => new Date(),
    },
  },
  { collection: "chunks" }
);

// Compound index for ordered chunk retrieval per document
ChunkSchema.index({ documentId: 1, index: 1 });

// ---------------------------------------------------------------------------
// Model (guard against Next.js hot-reload re-registration)
// ---------------------------------------------------------------------------
const ChunkModel =
  (mongoose.models.Chunk as mongoose.Model<IChunk> | undefined) ??
  mongoose.model<IChunk>("Chunk", ChunkSchema);

export default ChunkModel;
