import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { ChatClient } from "@/features/chat/components/chat-client";
import type { UIMessage } from "ai";

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

function getMessageText(message: UIMessage): string {
  return message.parts
    ?.map((part) => (part.type === "text" ? part.text : ""))
    .filter(Boolean)
    .join("\n") ?? "";
}

function hashString(value: string): string {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = Math.imul(31, hash) + value.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash).toString(36);
}

function ensureMessageIds(messages: UIMessage[], sessionId: string) {
  return messages.map((message, index) => {
    if (message.id && message.id.trim().length > 0) {
      return message;
    }

    const fingerprint = hashString(`${sessionId}:${index}:${message.role}:${getMessageText(message)}`);

    return {
      ...message,
      id: `${message.role}-${index}-${fingerprint}`,
    };
  });
}

export default async function ChatSessionPage({ params }: PageProps) {
  const { sessionId } = await params;

  if (!sessionId) {
    redirect("/dashboard");
  }

  const { userId } = await auth();
  let session:
    | {
      userId: string | null;
      messages: unknown;
    }
    | null = null;

  try {
    session = await prisma.chatSession.findUnique({
      where: { id: sessionId },
      select: { userId: true, messages: true },
    });
  } catch (error) {
    console.error("[ChatSessionPage] Server-side session fetch failed:", error);
    redirect("/dashboard");
  }

  if (!session) {
    redirect("/dashboard");
  }

  if (session.userId && session.userId !== userId) {
    notFound();
  }

  const initialMessages = ensureMessageIds(session.messages as UIMessage[], sessionId);

  if (process.env.NODE_ENV !== "production" || process.env.DEBUG_CHAT_PERSISTENCE === "1") {
    console.debug("[ChatSessionPage] Hydration payload", {
      sessionId,
      initialMessagesLength: Array.isArray(initialMessages) ? initialMessages.length : 0,
    });
  }

  return (
    <ChatClient
      key={sessionId}
      sessionId={sessionId}
      initialMessages={initialMessages}
    />
  );
}
