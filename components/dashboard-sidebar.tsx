"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { UserButton, useUser, Show } from "@clerk/nextjs";
import { Plus, BookOpen, GalleryVerticalEnd, UploadCloud } from "lucide-react";
import Link from "next/link";

// ---------------------------------------------------------------------------
// Mock recent threads
// ---------------------------------------------------------------------------
const RECENT_THREADS = [
  { id: "1", title: "Definition of Matter & Origin of Consciousness" },
  { id: "2", title: "2 Principles & 3 Laws of Dialectics" },
  { id: "3", title: "Theory of Surplus Value (M - C - M')" },
  { id: "4", title: "Historical Mission of the Working Class" },
  { id: "5", title: "6 Pairs of Basic Dialectical Categories" },
  { id: "6", title: "Socio-Economic Formations & Historical Materialism" },
  { id: "7", title: "Capital Accumulation & Monopolistic Competition" },
  { id: "8", title: "National, Religious & Family Issues" },
  { id: "9", title: "Transition Period & Socialist Formations" },
  { id: "10", title: "Commodities, Currency & Market Laws" },
];

// ---------------------------------------------------------------------------
// Pinned / featured subjects
// ---------------------------------------------------------------------------
const PINNED_SUBJECTS = [
  {
    id: "mln111",
    label: "MLN111 – Philosophy",
    icon: "🧠",
    href: "#",
  },
  {
    id: "mln122",
    label: "MLN122 – Political Economics",
    icon: "📊",
    href: "#",
  },
  {
    id: "mln131",
    label: "MLN131 – Scientific Socialism",
    icon: "🌐",
    href: "#",
  },
];

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export function DashboardSidebar() {
  return (
    <Sidebar collapsible="offcanvas">
      {/* ── Header ─────────────────────────────────────── */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<a href="#">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <GalleryVerticalEnd className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-medium">MLN Assistant</span>
              </div>
            </a>}>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* ── Content ─────────────────────────────────────── */}
      <SidebarContent className="px-1">
        {/* Pinned subjects */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-[11px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">
            MLN Subjects
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {PINNED_SUBJECTS.map((subject) => (
                <SidebarMenuItem key={subject.id}>
                  <SidebarMenuButton
                    render={<a href={subject.href} />}
                    tooltip={subject.label}
                    className="gap-3 rounded-xl px-3 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  >
                    <span className="text-base leading-none shrink-0">
                      {subject.icon}
                    </span>
                    <span className="truncate">{subject.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Recents */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-[11px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">
            Recent Q&A History
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {RECENT_THREADS.map((thread) => (
                <SidebarMenuItem key={thread.id}>
                  <SidebarMenuButton
                    render={<a href="#" />}
                    tooltip={thread.title}
                    className="rounded-xl px-3 py-1.5 hover:bg-sidebar-accent"
                  >
                    <span className="truncate text-[13px] text-sidebar-foreground/70 hover:text-sidebar-foreground">
                      {thread.title}
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Tools */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-[11px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">
            Tools
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/dashboard/upload" />}
                  tooltip="Upload a reference document"
                  className="gap-3 rounded-xl px-3 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                >
                  <UploadCloud className="size-4 shrink-0" />
                  <span className="truncate">Upload Document</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ── Footer ─────────────────────────────────────── */}
      <SidebarFooter className="border-t border-sidebar-border px-3 py-3">
        <div className="flex items-center justify-between">
          {/* User */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Show when="signed-in">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "size-7 rounded-full",
                    userButtonTrigger: "focus-visible:outline-none",
                  },
                }}
              />
              <UserDisplayName />
            </Show>
            <Show when="signed-out">
              <div className="flex size-7 items-center justify-center rounded-full bg-sidebar-accent text-sidebar-foreground/60 text-xs font-bold">
                ?
              </div>
              <span className="truncate text-xs text-sidebar-foreground/60">
                Guest
              </span>
            </Show>
          </div>

          {/* Theme toggle */}
          <div className="shrink-0">
            <ModeToggle />
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

// ---------------------------------------------------------------------------
// User display name (Clerk)
// ---------------------------------------------------------------------------
function UserDisplayName() {
  const { user } = useUser();
  if (!user) return null;
  return (
    <span className="truncate text-xs font-medium text-sidebar-foreground">
      {user.fullName ?? user.primaryEmailAddress?.emailAddress ?? "User"}
    </span>
  );
}
