import mongoose, { Schema, type Document as MongoDocument } from "mongoose";

// ---------------------------------------------------------------------------
// Interface for Message subdocument
// ---------------------------------------------------------------------------
export interface IMessage {
  id: string;
  role: string;
  content: unknown;
  createdAt?: Date;
}

// ---------------------------------------------------------------------------
// Interface for Chat Session
// ---------------------------------------------------------------------------
export interface ISession extends MongoDocument {
  userId?: string;     // Clerk user ID if authenticated
  title: string;       // Thread title derived from the first query
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Message Schema
// ---------------------------------------------------------------------------
const MessageSchema = new Schema<IMessage>(
  {
    id: {
      type: String,
      required: false,
    },
    role: {
      type: String,
      required: false,
    },
    content: {
      type: Schema.Types.Mixed,
      required: false,
    },
    createdAt: {
      type: Date,
      default: () => new Date(),
    },
  },
  {
    _id: false,   // Do not add Mongoose's default subdocument _id
    strict: false, // Allow saving other properties like toolInvocations, annotations, etc.
  }
);

// ---------------------------------------------------------------------------
// Chat Session Schema
// ---------------------------------------------------------------------------
const SessionSchema = new Schema<ISession>(
  {
    userId: {
      type: String,
      index: true,
      required: false,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },
    messages: {
      type: [MessageSchema],
      default: [],
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
    collection: "chat_sessions",
  }
);

// ---------------------------------------------------------------------------
// Model (guard against Next.js hot-reload re-registration)
// ---------------------------------------------------------------------------
// Clear cached model in development to force re-evaluation of the updated schema on hot reload
if (process.env.NODE_ENV === "development" && mongoose.models.Session) {
  delete (mongoose.models as any).Session;
}

const SessionModel =
  (mongoose.models.Session as mongoose.Model<ISession> | undefined) ??
  mongoose.model<ISession>("Session", SessionSchema);

export default SessionModel;
