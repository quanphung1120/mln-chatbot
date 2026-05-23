import { DashboardSidebar } from "@/components/dashboard-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import SessionModel from "@/lib/models/Session";
import dbConnect from "@/lib/mongoose";
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
      // ── Connect to MongoDB ─────────────────────────────────────────────────
      await dbConnect();

      // ── Fetch User Sessions ────────────────────────────────────────────────
      // Retrieve sessions owned by this user, ordered by updatedAt (newest first).
      const rawSessions = await SessionModel.find({ userId })
        .select("_id title updatedAt")
        .sort({ updatedAt: -1 })
        .lean();

      // Map to plain, serializable objects for Client Component (DashboardSidebar)
      sessions = rawSessions.map((session) => ({
        id: (session._id as any).toString(),
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
