"use client";

import {
  AssistantRuntimeProvider,
  useLocalRuntime,
  type ChatModelAdapter,
} from "@assistant-ui/react";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

// ---------------------------------------------------------------------------
// Mock adapter — replace with your real API call when ready
// ---------------------------------------------------------------------------
const mockAdapter: ChatModelAdapter = {
  async *run({ messages, abortSignal }) {
    // Placeholder: yields a stub reply. Wire up your real endpoint here.
    await new Promise((r) => setTimeout(r, 600));
    if (abortSignal.aborted) return;
    yield {
      content: [
        {
          type: "text",
          text: "*(This is a placeholder response — connect a real model in `app/api/chat/route.ts`.)*",
        },
      ],
    };
  },
};

// ---------------------------------------------------------------------------
// Provider wrapper (must wrap the dashboard to keep chat state consistent)
// ---------------------------------------------------------------------------
function DashboardRuntime({ children }: { children: React.ReactNode }) {
  const runtime = useLocalRuntime(mockAdapter);
  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
}

// ---------------------------------------------------------------------------
// Dashboard Layout
// ---------------------------------------------------------------------------
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardRuntime>
      <SidebarProvider defaultOpen={true}>
        <DashboardSidebar />

        <SidebarInset className="flex flex-col h-screen overflow-hidden">
          {/* Slim top bar with sidebar trigger - shared across all dashboard sub-pages */}
          <header className="flex shrink-0 items-center gap-2 border-b border-border px-3 h-10 bg-background">
            <SidebarTrigger className="-ml-1" />
            <div className="h-4 w-px bg-border" />
            <span className="text-xs text-muted-foreground tracking-widest uppercase">
              MLN Study Thread
            </span>
          </header>

          {/* Children (e.g. PerplexityThread on page.tsx or any other child pages) */}
          {children}
        </SidebarInset>
      </SidebarProvider>
    </DashboardRuntime>
  );
}
