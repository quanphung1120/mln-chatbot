import "dotenv/config";

import dbConnect from "../lib/mongoose";
import ChunkModel from "../lib/models/Chunk";
import { generateEmbeddings } from "../lib/embeddings";

async function main() {
  try {
    console.log("[backfill] Connecting to MongoDB database...");
    await dbConnect();
    console.log("[backfill] Database connected successfully.");

    // Find all chunks where embedding field does not exist, is null, or is empty
    const unindexedChunks = await ChunkModel.find({
      $or: [
        { embedding: { $exists: false } },
        { embedding: null },
        { embedding: { $size: 0 } },
      ],
    });

    console.log(`[backfill] Found ${unindexedChunks.length} chunks missing vector embeddings.`);

    if (unindexedChunks.length === 0) {
      console.log("[backfill] All existing documentation is already indexed! Nothing to do.");
      process.exit(0);
    }

    const BATCH_SIZE = 50; // Index 50 sentences at a time to prevent API rate/payload issues
    let successCount = 0;

    for (let i = 0; i < unindexedChunks.length; i += BATCH_SIZE) {
      const batch = unindexedChunks.slice(i, i + BATCH_SIZE);
      const texts = batch.map((c) => c.text);

      console.log(
        `[backfill] Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(
          unindexedChunks.length / BATCH_SIZE
        )} (size: ${batch.length})...`
      );

      try {
        const embeddings = await generateEmbeddings(texts);

        // Perform in-place updates for each chunk
        for (let j = 0; j < batch.length; j++) {
          const chunk = batch[j];
          const vector = embeddings[j];

          if (vector && vector.length > 0) {
            chunk.embedding = vector;
            await chunk.save();
            successCount++;
          }
        }
      } catch (batchErr) {
        console.error(`[backfill] Failed to process batch starting at index ${i}:`, batchErr);
      }
    }

    console.log(`[backfill] Successfully back-filled ${successCount}/${unindexedChunks.length} chunks with embeddings.`);
    process.exit(0);
  } catch (err) {
    console.error("[backfill] Fatal migration failure:", err);
    process.exit(1);
  }
}

// Execute back-fill process
main();
