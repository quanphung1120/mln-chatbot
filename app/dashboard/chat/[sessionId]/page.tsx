import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import dbConnect from "@/lib/mongoose";
import SessionModel from "@/lib/models/Session";
import { ChatClientWrapper } from "./chat-client-wrapper";

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

    const session = await SessionModel.findById(sessionId).lean();
    if (!session) {
      redirect("/dashboard");
    }

    if (session.userId && session.userId !== userId) {
      notFound();
    }

    // Map messages to plain serializable objects for client invocation
    const initialMessages = session.messages.map((message: any) => ({
      ...message,
      createdAt: message.createdAt ? new Date(message.createdAt).toISOString() : undefined,
    }));

    return (
      <ChatClientWrapper
        sessionId={sessionId}
        initialMessages={initialMessages}
      />
    );
  } catch (error) {
    console.error("[ChatSessionPage] Server-side session fetch failed:", error);
    redirect("/dashboard");
  }
}
