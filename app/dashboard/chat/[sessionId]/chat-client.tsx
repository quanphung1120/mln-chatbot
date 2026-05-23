"use client";

import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useAISDKRuntime } from "@assistant-ui/react-ai-sdk";
import { useChat } from "@ai-sdk/react";
import { PerplexityThread } from "@/components/assistant-ui/perplexity-thread";
import { DefaultChatTransport } from "ai";

interface ChatClientProps {
  sessionId: string;
  initialMessages: any[];
}

export function ChatClient({ sessionId, initialMessages }: ChatClientProps) {
  const chat = useChat({
    id: sessionId,
    messages: initialMessages,
    transport: new DefaultChatTransport({
      body: { sessionId },
    }),
  });

  const runtime = useAISDKRuntime(chat);

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className="flex flex-1 flex-col min-h-0">
        <PerplexityThread />
      </div>
    </AssistantRuntimeProvider>
  );
}
