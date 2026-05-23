"use client";

import { PerplexityThread } from "@/components/assistant-ui/perplexity-thread";

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col min-h-0">
      <PerplexityThread />
    </div>
  );
}

