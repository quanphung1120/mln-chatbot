"use client";

import { useState } from "react";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { PerplexityThread } from "@/components/assistant-ui/perplexity-thread";

export default function DashboardPage() {
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);

  const runtime = useChatRuntime({
    api: "/api/chat",
    body: {
      sessionId: sessionId,
    },
    onResponse: (res: Response) => {
      const newSessionId = res.headers.get("X-Session-Id");
      if (newSessionId && !sessionId) {
        setSessionId(newSessionId);

        // Instantly update the address bar without unmounting or flickering the tree
        window.history.replaceState(null, "", `/dashboard/chat/${newSessionId}`);

        // Notify the sidebar to fetch updated chat history
        window.dispatchEvent(new Event("chat-sessions-changed"));
      }
    },
  } as any);

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className="flex flex-1 flex-col min-h-0">
        <PerplexityThread />
      </div>
    </AssistantRuntimeProvider>
  );
}

