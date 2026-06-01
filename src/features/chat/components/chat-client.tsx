"use client";

import { useEffect, useMemo } from "react";
import { AssistantRuntimeProvider, useAuiState } from "@assistant-ui/react";
import { useAISDKRuntime } from "@assistant-ui/react-ai-sdk";
import { useChat } from "@ai-sdk/react";
import { PerplexityThread } from "@/components/assistant-ui/perplexity-thread";
import { DefaultChatTransport, type UIMessage } from "ai";

interface ChatClientProps {
  sessionId: string;
  initialMessages: UIMessage[];
}

const ENABLE_CHAT_PERSISTENCE_DEBUG =
  process.env.NODE_ENV !== "production" ||
  process.env.NEXT_PUBLIC_DEBUG_CHAT_PERSISTENCE === "1";

function getMessageIds(messages: UIMessage[]) {
  return messages.map((message) => `${message.role}:${message.id ?? "missing-id"}`);
}

function ChatRuntimeDiagnostics({
  sessionId,
  chatMessages,
  initialMessages,
}: {
  sessionId: string;
  chatMessages: UIMessage[];
  initialMessages: UIMessage[];
}) {
  const threadMessages = useAuiState((state) => state.thread.messages);

  useEffect(() => {
    if (!ENABLE_CHAT_PERSISTENCE_DEBUG) return;

    console.debug("[ChatClient] Runtime state", {
      sessionId,
      initialMessagesLength: initialMessages.length,
      chatMessagesLength: chatMessages.length,
      threadMessagesLength: threadMessages.length,
      initialMessageIds: getMessageIds(initialMessages),
      chatMessageIds: getMessageIds(chatMessages),
      threadMessageIds: threadMessages.map(
        (message) => `${message.role}:${message.id ?? "missing-id"}`,
      ),
    });
  }, [chatMessages, initialMessages, sessionId, threadMessages]);

  return null;
}

// ---------------------------------------------------------------------------
// Core Client Content
// ---------------------------------------------------------------------------
export function ChatClient({ sessionId, initialMessages }: ChatClientProps) {
  const transport = useMemo(
    () =>
      new DefaultChatTransport<UIMessage>({
        prepareSendMessagesRequest({ messages }) {
          return {
            body: {
              id: sessionId,
              messages,
              message: messages[messages.length - 1],
              sessionId,
            },
          };
        },
      }),
    [sessionId]
  );

  const chat = useChat({
    id: sessionId,
    messages: initialMessages,
    transport,
  });

  const runtime = useAISDKRuntime(chat);

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <ChatRuntimeDiagnostics
        sessionId={sessionId}
        chatMessages={chat.messages}
        initialMessages={initialMessages}
      />
      <div className="flex flex-1 flex-col min-h-0">
        <PerplexityThread />
      </div>
    </AssistantRuntimeProvider>
  );
}
