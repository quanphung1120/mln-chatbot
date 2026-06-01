import { DashboardSidebar } from "@/features/chat/components/dashboard-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ── Authenticate User via Clerk ──────────────────────────────────────────
  const { userId } = await auth();

  let sessions: { id: string; title: string }[] = [];

  if (userId) {
    try {
      // Retrieve sessions owned by this user, ordered by updatedAt (newest first).
      const rawSessions = await prisma.chatSession.findMany({
        where: { userId },
        select: { id: true, title: true },
        orderBy: { updatedAt: "desc" },
      });

      // Map to plain, serializable objects for Client Component (DashboardSidebar)
      sessions = rawSessions.map((session) => ({
        id: session.id,
        title: session.title || "Untitled Chat",
      }));
    } catch (error) {
      console.error("[DashboardLayout] Failed to load user sessions:", error);
    }
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <DashboardSidebar sessions={sessions} />

      <SidebarInset className="flex flex-col h-screen overflow-hidden">
        {/* Slim top bar with sidebar trigger - shared across all dashboard sub-pages */}
        <header className="flex shrink-0 items-center gap-2 border-b border-border px-3 h-10 bg-background">
          <SidebarTrigger className="-ml-1" />
          <div className="h-4 w-px bg-border" />
          <span className="text-xs text-muted-foreground tracking-widest uppercase">
            MLN Study Thread
          </span>
        </header>

        {/* Children (e.g. Chat thread or settings page) */}
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
