import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import dbConnect from "@/lib/mongoose";
import SessionModel from "@/lib/models/Session";
import { ChatClient } from "./chat-client";

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function ChatSessionPage({ params }: PageProps) {
  const { sessionId } = await params;

  if (!sessionId) {
    redirect("/dashboard");
  }

  // Get user authentication context from Clerk
  const { userId } = await auth();

  try {
    // Establish database connection on the server
    await dbConnect();

    const session = await SessionModel.findById(sessionId);
    if (!session) {
      redirect("/dashboard");
    }

    if (session.userId && session.userId !== userId) {
      notFound()
    }

    // Map messages to plain serializable objects for client invocation
    const initialMessages = session.messages.map((m) => {
      const doc = m as unknown as { toObject?: () => Record<string, unknown> };
      const msgObj = doc.toObject ? doc.toObject() : { ...m };
      if ('_id' in msgObj) delete msgObj._id;
      if ('__v' in msgObj) delete msgObj.__v;
      return {
        ...msgObj,
        createdAt: msgObj.createdAt ? new Date(msgObj.createdAt as string | Date).toISOString() : undefined,
      };
    });

    console.log("Messages: " + JSON.stringify(initialMessages))

    return (
      <ChatClient
        sessionId={sessionId}
        initialMessages={initialMessages}
      />
    );
  } catch (error) {
    console.error("[ChatSessionPage] Server-side session fetch failed:", error);
    redirect("/dashboard");
  }
}
