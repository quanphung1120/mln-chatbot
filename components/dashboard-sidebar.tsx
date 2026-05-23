"use client";

import { useState } from "react";
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
  SidebarMenuAction,
} from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { UserButton, useUser, Show } from "@clerk/nextjs";
import { Plus, GalleryVerticalEnd, UploadCloud, Trash2, MoreHorizontal, Pencil } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { deleteSessionAction, renameSessionAction } from "@/lib/actions/session";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";


export interface DashboardSidebarProps {
  sessions: { id: string; title: string }[];
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export function DashboardSidebar({ sessions }: DashboardSidebarProps) {
  const { isLoaded, isSignedIn } = useUser();
  const params = useParams();
  const currentSessionId = params?.sessionId as string | undefined;

  const [renameSession, setRenameSession] = useState<{ id: string; title: string } | null>(null);
  const [deleteSession, setDeleteSession] = useState<{ id: string; title: string } | null>(null);

  return (
    <Sidebar collapsible="offcanvas">
      {/* ── Header ─────────────────────────────────────── */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/dashboard">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <GalleryVerticalEnd className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold text-sm">MLN Assistant</span>
              </div>
            </Link>}>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* ── Content ─────────────────────────────────────── */}
      <SidebarContent className="px-1">
        {/* New Chat Action Button */}
        <SidebarGroup className="pt-2">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/dashboard" />}
                  tooltip="Start a fresh chat thread"
                  className="gap-3 rounded-xl px-3 py-2 text-sm bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary-hover font-semibold border border-primary/15 transition-all shadow-xs"
                >
                  <Plus className="size-4 shrink-0 text-primary" />
                  <span className="truncate">New Chat</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
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
              {sessions.length === 0 ? (
                <div className="px-3 py-2 text-xs text-muted-foreground/50 italic">
                  No chat history yet
                </div>
              ) : (
                sessions.map((thread) => (
                  <SidebarMenuItem key={thread.id}>
                    <SidebarMenuButton
                      render={<Link href={`/dashboard/chat/${thread.id}`} />}
                      tooltip={thread.title}
                      className="rounded-xl px-3 py-1.5 hover:bg-sidebar-accent"
                    >
                      <span className="truncate text-[13px] text-sidebar-foreground/70 hover:text-sidebar-foreground">
                        {thread.title}
                      </span>
                    </SidebarMenuButton>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <SidebarMenuAction
                            showOnHover
                            className="text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
                            title="Session options"
                          >
                            <MoreHorizontal className="size-3.5" />
                          </SidebarMenuAction>
                        }
                      />
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                          onClick={() => setRenameSession(thread)}
                          className="gap-2 text-xs cursor-pointer"
                        >
                          <Pencil className="size-3.5" />
                          <span>Rename</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteSession(thread)}
                          className="gap-2 text-xs cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                        >
                          <Trash2 className="size-3.5 text-destructive" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </SidebarMenuItem>
                ))
              )}
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
                  <span className="truncate">Documentation</span>
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

      {/* Rename Dialog */}
      <Dialog
        open={!!renameSession}
        onOpenChange={(open) => !open && setRenameSession(null)}
      >
        <DialogContent className="max-w-sm rounded-3xl">
          <DialogHeader>
            <DialogTitle>Rename Chat Session</DialogTitle>
            <DialogDescription>
              Enter a new title for this chat session.
            </DialogDescription>
          </DialogHeader>
          <form
            action={async (formData) => {
              await renameSessionAction(formData);
              setRenameSession(null);
            }}
            className="space-y-4"
          >
            <input type="hidden" name="sessionId" value={renameSession?.id || ""} />
            <Input
              key={renameSession?.id}
              name="title"
              defaultValue={renameSession?.title || ""}
              placeholder="Session title"
              required
              autoFocus
              className="rounded-xl"
            />
            <DialogFooter className="flex justify-end gap-2 pt-2">
              <DialogClose render={<Button variant="outline" className="rounded-xl">Cancel</Button>} />
              <Button type="submit" className="rounded-xl">
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={!!deleteSession}
        onOpenChange={(open) => !open && setDeleteSession(null)}
      >
        <DialogContent className="max-w-sm rounded-3xl">
          <DialogHeader>
            <DialogTitle>Delete Chat Session</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong className="text-foreground">"{deleteSession?.title}"</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <form
            action={async (formData) => {
              await deleteSessionAction(formData);
              setDeleteSession(null);
            }}
            className="flex justify-end gap-2 pt-4"
          >
            <input type="hidden" name="sessionId" value={deleteSession?.id || ""} />
            <input
              type="hidden"
              name="currentSessionId"
              value={currentSessionId || ""}
            />
            <DialogClose render={<Button variant="outline" className="rounded-xl">Cancel</Button>} />
            <Button type="submit" variant="destructive" className="rounded-xl">
              Delete
            </Button>
          </form>
        </DialogContent>
      </Dialog>
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
