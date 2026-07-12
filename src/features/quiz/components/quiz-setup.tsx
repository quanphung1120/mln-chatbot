"use client";

import { useState } from "react";
import { Dumbbell, GraduationCap, RotateCcw } from "lucide-react";
import { getCourse } from "@/lib/courses";
import type { QuizMode } from "../types";

export interface QuizConfig {
  mode: QuizMode;
  count: number;
}

interface QuizSetupProps {
  courseCode: string;
  bankSize: number;
  reviewCount: number;
  onStart: (config: QuizConfig) => void;
}

const MODES: {
  mode: QuizMode;
  label: string;
  desc: string;
  icon: typeof Dumbbell;
}[] = [
  { mode: "practice", label: "Luyện tập", desc: "Phản hồi ngay, có giải thích", icon: Dumbbell },
  { mode: "exam", label: "Thi thử", desc: "Hẹn giờ, chấm điểm cuối bài", icon: GraduationCap },
  { mode: "review", label: "Ôn câu sai", desc: "Chỉ hỏi lại câu từng làm sai", icon: RotateCcw },
];

const COUNT_OPTIONS = [10, 20, 40];

export function QuizSetup({ courseCode, bankSize, reviewCount, onStart }: QuizSetupProps) {
  const course = getCourse(courseCode);
  const [mode, setMode] = useState<QuizMode>("practice");
  const [count, setCount] = useState(20);

  const counts = COUNT_OPTIONS.filter((c) => c <= bankSize);
  const showCount = mode !== "review";

  const start = () => {
    const effectiveCount = mode === "review" ? 0 : Math.min(count, bankSize);
    onStart({ mode, count: effectiveCount });
  };

  const disabledStart = mode === "review" && reviewCount === 0;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-foreground">
          {course?.title ?? courseCode}
        </h1>
        <p className="text-sm text-muted-foreground">
          {bankSize} câu hỏi · chọn chế độ để bắt đầu
        </p>
      </div>

      {/* mode selection */}
      <div className="grid gap-3 sm:grid-cols-3">
        {MODES.map((m) => {
          const Icon = m.icon;
          const isReview = m.mode === "review";
          const disabled = isReview && reviewCount === 0;
          const active = mode === m.mode;
          return (
            <button
              key={m.mode}
              onClick={() => !disabled && setMode(m.mode)}
              disabled={disabled}
              className={`flex flex-col items-start gap-1.5 rounded-xl border p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                active
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border bg-card hover:bg-accent"
              }`}
            >
              <Icon className={`size-5 ${active ? "text-primary" : "text-muted-foreground"}`} />
              <span className="text-sm font-semibold text-foreground">{m.label}</span>
              <span className="text-xs text-muted-foreground">{m.desc}</span>
              {isReview && (
                <span className="mt-1 text-[11px] font-medium text-muted-foreground">
                  {reviewCount} câu cần ôn
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* count selection */}
      {showCount && (
        <div className="mt-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Số câu
          </p>
          <div className="flex flex-wrap gap-2">
            {counts.map((c) => (
              <button
                key={c}
                onClick={() => setCount(c)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  count === c
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:bg-accent"
                }`}
              >
                {c} câu
              </button>
            ))}
            <button
              onClick={() => setCount(bankSize)}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                count === bankSize
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:bg-accent"
              }`}
            >
              Tất cả ({bankSize})
            </button>
          </div>
        </div>
      )}

      <button
        onClick={start}
        disabled={disabledStart}
        className="mt-8 w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
      >
        Bắt đầu
      </button>
    </div>
  );
}
