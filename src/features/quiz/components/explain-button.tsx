"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import type { QuizQuestion } from "../types";

interface ExplainButtonProps {
  courseCode: string;
  question: QuizQuestion;
}

export function ExplainButton({ courseCode, question }: ExplainButtonProps) {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState(false);

  const ask = async () => {
    if (loading || content) return;
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/quiz/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseCode,
          questionId: question.id,
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { content?: string };
      setContent(data.content ?? "Không có nội dung.");
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (content) {
    return (
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs leading-relaxed text-foreground">
        <p className="mb-1 flex items-center gap-1.5 font-semibold text-primary">
          <Sparkles className="size-3.5" /> AI giải thích
        </p>
        <p className="whitespace-pre-wrap text-muted-foreground">{content}</p>
      </div>
    );
  }

  return (
    <button
      onClick={ask}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10 disabled:opacity-60"
    >
      {loading ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
      {loading ? "Đang hỏi AI…" : error ? "Thử lại" : "Hỏi AI giải thích"}
    </button>
  );
}
