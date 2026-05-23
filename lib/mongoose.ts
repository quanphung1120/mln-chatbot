import mongoose from "mongoose";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error(
    "Please define the DATABASE_URL environment variable inside .env"
  );
}

interface MongooseCache {
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { promise: null };
}

const cache = cached;

/**
 * Connect to MongoDB. If Mongoose already has an active connection, returns immediately.
 * If concurrent calls are made, they await the same cached promise to ensure the
 * connection is fully established before returning.
 */
export default async function dbConnect() {
  if (mongoose.connection.readyState === 1) return;

  // Reset cached promise if it exists but the connection is disconnected (0)
  if (cache.promise && mongoose.connection.readyState !== 2) {
    cache.promise = null;
  }

  if (!cache.promise) {
    cache.promise = mongoose.connect(DATABASE_URL!, { bufferCommands: false });
  }

  try {
    await cache.promise;
  } catch (error) {
    cache.promise = null;
    throw error;
  }
}

