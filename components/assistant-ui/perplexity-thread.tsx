"use client";

import { useState, type FC } from "react";
import {
  AuiIf,
  ThreadPrimitive,
  ComposerPrimitive,
  MessagePrimitive,
  ActionBarPrimitive,
  BranchPickerPrimitive,
  useAuiState,
} from "@assistant-ui/react";
import { MarkdownText } from "@/components/assistant-ui/markdown-text";
import { TooltipIconButton } from "@/components/assistant-ui/tooltip-icon-button";
import { cn } from "@/lib/utils";
import {
  ArrowUp,
  Square,
  Mic,
  Copy,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ArrowDown,
  BookOpen,
  Check,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Composer primary action (send / cancel / dictate)
// ---------------------------------------------------------------------------

const ComposerPrimaryAction: FC = () => (
  <div className="flex items-center">
    <AuiIf condition={(s) => s.thread.isRunning}>
      <ComposerPrimitive.Cancel
        id="composer-cancel-btn"
        className="flex size-8 items-center justify-center rounded-full bg-foreground text-background transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Stop generating"
      >
        <Square className="size-3 fill-current" />
      </ComposerPrimitive.Cancel>
    </AuiIf>

    <AuiIf
      condition={(s) =>
        s.composer.dictation != null && !s.thread.isRunning
      }
    >
      <ComposerPrimitive.StopDictation
        id="composer-stop-dictation-btn"
        className="flex size-8 items-center justify-center rounded-full bg-red-500 text-white transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Stop dictation"
      >
        <Mic className="size-3.5" />
      </ComposerPrimitive.StopDictation>
    </AuiIf>

    <AuiIf
      condition={(s) =>
        s.composer.dictation == null &&
        !s.composer.isEmpty &&
        !s.thread.isRunning
      }
    >
      <ComposerPrimitive.Send
        id="composer-send-btn"
        className="flex size-8 items-center justify-center rounded-full bg-foreground text-background transition-opacity hover:opacity-80 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Send message"
      >
        <ArrowUp className="size-4" />
      </ComposerPrimitive.Send>
    </AuiIf>

    <AuiIf
      condition={(s) =>
        s.composer.dictation == null &&
        s.composer.isEmpty &&
        !s.thread.isRunning
      }
    >
      <ComposerPrimitive.Dictate
        id="composer-dictate-btn"
        className="flex size-8 items-center justify-center rounded-full bg-foreground/8 text-foreground/60 transition-colors hover:bg-foreground/15 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Start voice input"
      >
        <Mic className="size-4" />
      </ComposerPrimitive.Dictate>
    </AuiIf>
  </div>
);

// ---------------------------------------------------------------------------
// Composer
// ---------------------------------------------------------------------------

interface ComposerProps {
  placeholder?: string;
}

const Composer: FC<ComposerProps> = ({
  placeholder = "Ask a follow-up...",
}) => (
  <ComposerPrimitive.Root
    id="composer-root"
    className="w-full rounded-2xl border border-foreground/12 bg-background shadow-sm transition-shadow focus-within:border-foreground/20 focus-within:shadow-md dark:border-foreground/10 dark:bg-card"
  >
    <ComposerPrimitive.Input
      id="composer-input"
      rows={2}
      placeholder={placeholder}
      className="w-full resize-none bg-transparent px-4 pt-4 pb-2 text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/60"
      aria-label="Message input"
    />
    <div className="flex items-center justify-end px-3 pb-3">
      {/* Right: send/cancel */}
      <ComposerPrimaryAction />
    </div>
  </ComposerPrimitive.Root>
);

// ---------------------------------------------------------------------------
// Empty / welcome state
// ---------------------------------------------------------------------------

const SUGGESTED_QUESTIONS = [
  "Phân biệt vật chất và ý thức theo triết học MLN",
  "Quy luật thống nhất và đấu tranh của các mặt đối lập",
  "Sứ mệnh lịch sử của giai cấp công nhân",
  "Hàng hóa, giá trị và giá trị thặng dư là gì?",
];

const EmptyState: FC = () => (
  <div className="flex flex-1 flex-col items-center justify-center px-4 pb-8">
    {/* Logo mark */}
    <div className="mb-6 flex size-14 items-center justify-center rounded-2xl border border-foreground/10 bg-foreground/5">
      <BookOpen className="size-6 text-foreground/70" />
    </div>

    <h1 className="mb-2 text-center text-2xl font-semibold tracking-tight">
      MLN FPT Study Portal
    </h1>
    <p className="mb-8 max-w-sm text-center text-sm text-muted-foreground">
      Ask anything about Marxist-Leninist philosophy, political economics, or
      scientific socialism — grounded in your official lecture materials.
    </p>

    {/* Suggestion chips */}
    <div className="grid w-full max-w-lg grid-cols-1 gap-2 sm:grid-cols-2">
      {SUGGESTED_QUESTIONS.map((q) => (
        <button
          key={q}
          id={`suggestion-${q.slice(0, 20).replace(/\s/g, "-")}`}
          className="rounded-xl border border-foreground/10 bg-foreground/4 px-4 py-3 text-left text-xs text-foreground/70 transition-colors hover:border-foreground/20 hover:bg-foreground/8 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {q}
        </button>
      ))}
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Messages
// ---------------------------------------------------------------------------

const ThreadScrollToBottom: FC = () => (
  <ThreadPrimitive.ScrollToBottom
    render={
      <TooltipIconButton
        tooltip="Scroll to bottom"
        variant="outline"
        className="absolute -top-12 z-10 self-center rounded-full p-2 shadow-sm disabled:invisible"
      />
    }
  >
    <ArrowDown className="size-4" />
  </ThreadPrimitive.ScrollToBottom>
);

const BranchPicker: FC<BranchPickerPrimitive.Root.Props> = ({
  className,
  ...rest
}) => (
  <BranchPickerPrimitive.Root
    hideWhenSingleBranch
    className={cn(
      "inline-flex items-center gap-0.5 text-xs text-muted-foreground",
      className
    )}
    {...rest}
  >
    <BranchPickerPrimitive.Previous
      render={<TooltipIconButton tooltip="Previous" />}
    >
      <ChevronLeft className="size-3.5" />
    </BranchPickerPrimitive.Previous>
    <span className="tabular-nums">
      <BranchPickerPrimitive.Number /> /{" "}
      <BranchPickerPrimitive.Count />
    </span>
    <BranchPickerPrimitive.Next render={<TooltipIconButton tooltip="Next" />}>
      <ChevronRight className="size-3.5" />
    </BranchPickerPrimitive.Next>
  </BranchPickerPrimitive.Root>
);

const UserMessage: FC = () => (
  <MessagePrimitive.Root
    data-role="user"
    className="flex justify-end px-2"
  >
    <div className="max-w-[80%] rounded-2xl bg-foreground/8 px-4 py-2.5 text-sm leading-relaxed text-foreground dark:bg-foreground/10">
      <MessagePrimitive.Parts />
    </div>
  </MessagePrimitive.Root>
);

const AssistantMessage: FC = () => (
  <MessagePrimitive.Root
    data-role="assistant"
    className="group/msg relative px-2"
  >
    {/* Content */}
    <div className="wrap-break-word text-sm leading-relaxed text-foreground">
      <MessagePrimitive.Parts
        components={{
          Text: () => <MarkdownText />,
        }}
      />
    </div>

    {/* Action bar */}
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="not-last"
      className="mt-2 flex items-center gap-1 text-muted-foreground opacity-0 transition-opacity group-hover/msg:opacity-100"
    >
      <BranchPicker className="mr-1" />
      <ActionBarPrimitive.Copy
        render={<TooltipIconButton tooltip="Copy" />}
      >
        <AuiIf condition={(s) => s.message.isCopied}>
          <Check className="size-3.5" />
        </AuiIf>
        <AuiIf condition={(s) => !s.message.isCopied}>
          <Copy className="size-3.5" />
        </AuiIf>
      </ActionBarPrimitive.Copy>
      <ActionBarPrimitive.Reload
        render={<TooltipIconButton tooltip="Regenerate" />}
      >
        <RefreshCw className="size-3.5" />
      </ActionBarPrimitive.Reload>
    </ActionBarPrimitive.Root>
  </MessagePrimitive.Root>
);

const ThreadMessage: FC = () => {
  const role = useAuiState((s) => s.message.role);
  if (role === "user") return <UserMessage />;
  return <AssistantMessage />;
};

// ---------------------------------------------------------------------------
// Main exported component
// ---------------------------------------------------------------------------

export const PerplexityThread: FC = () => (
  <ThreadPrimitive.Root
    id="perplexity-thread"
    className="flex h-full flex-col bg-background"
    style={{ ["--thread-max-width" as string]: "40rem" }}
  >
    {/* Empty state */}
    <AuiIf condition={(s) => s.thread.isEmpty}>
      <div className="flex flex-1 flex-col">
        <EmptyState />
        {/* Composer at bottom when empty */}
        <div className="px-4 pb-6">
          <div className="mx-auto w-full max-w-(--thread-max-width)">
            <Composer placeholder="Ask anything about MLN..." />
          </div>
        </div>
      </div>
    </AuiIf>

    {/* Chat state */}
    <AuiIf condition={(s) => !s.thread.isEmpty}>
      <ThreadPrimitive.Viewport className="relative flex flex-1 flex-col overflow-y-scroll scroll-smooth">
        <div className="mx-auto flex w-full max-w-(--thread-max-width) flex-1 flex-col gap-6 px-4 py-6">
          <ThreadPrimitive.Messages>
            {() => <ThreadMessage />}
          </ThreadPrimitive.Messages>
        </div>

        <ThreadPrimitive.ViewportFooter className="sticky bottom-0 bg-background/90 px-4 pb-6 pt-2 backdrop-blur-sm">
          <div className="mx-auto w-full max-w-(--thread-max-width)">
            <ThreadScrollToBottom />
            <Composer />
          </div>
        </ThreadPrimitive.ViewportFooter>
      </ThreadPrimitive.Viewport>
    </AuiIf>
  </ThreadPrimitive.Root>
);
