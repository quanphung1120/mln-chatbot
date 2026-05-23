"use client";

import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { PerplexityThread } from "@/components/assistant-ui/perplexity-thread";

interface ChatClientProps {
  sessionId: string;
  initialMessages: any[];
}

export function ChatClient({ sessionId, initialMessages }: ChatClientProps) {
  const runtime = useChatRuntime({
    messages: initialMessages,
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className="flex flex-1 flex-col min-h-0">
        <PerplexityThread />
      </div>
    </AssistantRuntimeProvider>
  );
}
