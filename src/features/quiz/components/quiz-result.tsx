"use client";

import Link from "next/link";
import { Check, Flame, Sparkles, X, Zap } from "lucide-react";
import type { QuizSummary } from "./quiz-session";
import { ExplainButton } from "./explain-button";

interface QuizResultProps {
  summary: QuizSummary;
  onRetry: () => void;
}

export function QuizResult({ summary, onRetry }: QuizResultProps) {
  const { score, correct, total, xpEarned, currentStreak, items, courseCode, mode } = summary;
  const tone =
    score >= 80
      ? "text-emerald-500"
      : score >= 50
        ? "text-amber-500"
        : "text-red-500";

  return (
    <div className="mx-auto max-w-2xl">
      {/* score summary */}
      <div className="rounded-xl border bg-card p-6 text-center shadow-sm">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          {mode === "exam" ? "Kết quả thi thử" : mode === "review" ? "Kết quả ôn tập" : "Kết quả luyện tập"}
        </p>
        <p className={`mt-2 text-5xl font-bold tabular-nums ${tone}`}>{score}%</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Đúng {correct}/{total} câu
        </p>
        <div className="mt-4 flex items-center justify-center gap-4 text-sm">
          <span className="flex items-center gap-1.5 text-amber-500">
            <Zap className="size-4" /> +{xpEarned} XP
          </span>
          {currentStreak > 0 && (
            <span className="flex items-center gap-1.5 text-orange-500">
              <Flame className="size-4" /> {currentStreak} ngày liên tiếp
            </span>
          )}
        </div>
        <div className="mt-5 flex justify-center gap-2">
          <button
            onClick={onRetry}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Làm lại
          </button>
          <Link
            href="/dashboard/quiz/stats"
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            Xem thống kê
          </Link>
        </div>
      </div>

      {/* per-question review */}
      <div className="mt-6 space-y-3">
        <p className="text-sm font-semibold text-foreground">Xem lại từng câu</p>
        {items.map((it, idx) => {
          const isCorrect = it.chosen === it.question.answer;
          return (
            <div key={it.question.id} className="rounded-xl border bg-card p-4">
              <div className="flex items-start gap-2">
                <span
                  className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full ${
                    isCorrect ? "bg-emerald-500/15 text-emerald-500" : "bg-red-500/15 text-red-500"
                  }`}
                >
                  {isCorrect ? <Check className="size-3.5" /> : <X className="size-3.5" />}
                </span>
                <p className="text-sm font-medium text-card-foreground">
                  <span className="text-muted-foreground">Câu {idx + 1}. </span>
                  {it.question.question}
                </p>
              </div>

              <div className="mt-2 space-y-1 pl-7 text-sm">
                {it.question.options.map((opt, i) => {
                  const isAnswer = i === it.question.answer;
                  const isPicked = it.chosen === i;
                  let cls = "text-muted-foreground";
                  if (isAnswer) cls = "text-emerald-600 dark:text-emerald-400 font-medium";
                  else if (isPicked) cls = "text-red-600 dark:text-red-400 line-through";
                  return (
                    <p key={i} className={cls}>
                      {String.fromCharCode(65 + i)}. {opt}
                      {isAnswer && " ✓"}
                    </p>
                  );
                })}
              </div>

              {it.question.explain && (
                <p className="mt-2 pl-7 text-xs leading-relaxed text-muted-foreground">
                  <span className="font-semibold text-foreground">Giải thích: </span>
                  {it.question.explain}
                </p>
              )}

              <div className="mt-2 pl-7">
                <ExplainButton courseCode={courseCode} question={it.question} />
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
        <Sparkles className="size-3.5" />
        Câu sai sẽ tự động vào danh sách &quot;Ôn câu sai&quot; để bạn luyện lại.
      </p>
    </div>
  );
}
