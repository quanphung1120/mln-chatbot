"use client";

import { useRef } from "react";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { PerplexityThread } from "@/components/assistant-ui/perplexity-thread";
import { DefaultChatTransport } from "ai";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const pendingSessionId = useRef<string | null>(null);

  const runtime = useChatRuntime({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      fetch: async (input, init) => {
        const res = await fetch(input, init);

        const newSessionId = res.headers.get("X-Session-Id");
        if (newSessionId) {
          pendingSessionId.current = newSessionId;
        }

        return res;
      },
    }),
    onFinish: () => {
      const id = pendingSessionId.current;
      if (id) {
        pendingSessionId.current = null;
        window.dispatchEvent(new Event("chat-sessions-changed"));
        router.push(`/dashboard/chat/${id}`);
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

