"use client";

import { useState } from "react";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { PerplexityThread } from "@/components/assistant-ui/perplexity-thread";
import { DefaultChatTransport, UIMessage } from "ai";
import { useRouter } from "next/navigation";

export default function NewChatClient() {
  const router = useRouter();
  const [pendingSessionId, setPendingSessionId] = useState<string | null>(null);

  const runtime = useChatRuntime({
    transport: new DefaultChatTransport<UIMessage>({
      prepareSendMessagesRequest({ messages }) {
        return {
          body: {
            messages,
            message: messages[messages.length - 1],
          },
        };
      },
      fetch: async (input, init) => {
        const res = await fetch(input, init);

        const newSessionId = res.headers.get("X-Session-Id");
        if (newSessionId) {
          setPendingSessionId(newSessionId);
        }

        return res;
      },
    }),
    onFinish: () => {
      if (pendingSessionId) {
        setPendingSessionId(null);
        window.dispatchEvent(new Event("chat-sessions-changed"));
        router.push(`/dashboard/chat/${pendingSessionId}`);
      }
    },
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className="flex flex-1 flex-col min-h-0">
        <PerplexityThread />
      </div>
    </AssistantRuntimeProvider>
  );
}
