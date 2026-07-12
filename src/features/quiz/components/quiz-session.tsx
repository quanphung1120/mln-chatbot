"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, Clock, X } from "lucide-react";
import { getCourse } from "@/lib/courses";
import type { QuizMode, QuizQuestion } from "../types";
import { sampleQuestions, scorePercent } from "../lib";
import { recordAttempt } from "../actions";

export interface AnswerRecord {
  questionId: number;
  chosen: number | null;
  correct: boolean;
}

export interface QuizSummary {
  courseCode: string;
  mode: QuizMode;
  total: number;
  correct: number;
  score: number;
  durationSec: number;
  xpEarned: number;
  currentStreak: number;
  items: { question: QuizQuestion; chosen: number | null }[];
}

interface QuizSessionProps {
  courseCode: string;
  mode: QuizMode;
  count: number;
  reviewIds?: number[];
  onFinish: (summary: QuizSummary) => void;
  onExit: () => void;
}

function fmt(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function QuizSession({
  courseCode,
  mode,
  count,
  reviewIds,
  onFinish,
  onExit,
}: QuizSessionProps) {
  const course = getCourse(courseCode);
  const router = useRouter();
  // Draw the question set once, on mount.
  const [questions] = useState<QuizQuestion[]>(() =>
    sampleQuestions(courseCode, count, mode === "review" ? (reviewIds ?? []) : undefined),
  );

  const [pos, setPos] = useState(0);
  // chosen answer index per question position (null = unanswered)
  const [answers, setAnswers] = useState<(number | null)[]>(() =>
    questions.map(() => null),
  );
  const [revealed, setRevealed] = useState(false); // practice/review only
  const [submitting, setSubmitting] = useState(false);

  const isExam = mode === "exam";
  const startedRef = useRef<number>(0);
  const submittedRef = useRef(false);
  // Exam timer: 60s per question.
  const [remaining, setRemaining] = useState(questions.length * 60);

  const question = questions[pos];

  // Latest answers, reachable from timer callbacks without re-subscribing.
  const answersRef = useRef(answers);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  const buildSummary = useCallback(
    (chosenList: (number | null)[], durationSec: number): QuizSummary => {
      const items = questions.map((q, i) => ({ question: q, chosen: chosenList[i] }));
      const correct = items.filter((it) => it.chosen === it.question.answer).length;
      return {
        courseCode,
        mode,
        total: questions.length,
        correct,
        score: scorePercent(correct, questions.length),
        durationSec,
        xpEarned: 0,
        currentStreak: 0,
        items,
      };
    },
    [questions, courseCode, mode],
  );

  const finish = useCallback(
    async (chosenList: (number | null)[]) => {
      if (submittedRef.current) return;
      submittedRef.current = true;
      setSubmitting(true);
      const durationSec = Math.max(
        0,
        Math.round((performance.now() - startedRef.current) / 1000),
      );
      const summary = buildSummary(chosenList, durationSec);

      const result = await recordAttempt({
        courseCode,
        mode,
        durationSec,
        answers: summary.items.map((it) => ({
          questionId: it.question.id,
          chosen: it.chosen,
        })),
      });

      // Refresh server components so the "review wrong" pool (reviewIds) reflects
      // the stats this attempt just wrote.
      router.refresh();

      onFinish({
        ...summary,
        xpEarned: result.xpEarned ?? 0,
        currentStreak: result.currentStreak ?? 0,
      });
    },
    [buildSummary, courseCode, mode, onFinish, router],
  );

  // Keep the effect's interval stable while still calling the latest finish().
  const finishRef = useRef(finish);
  useEffect(() => {
    finishRef.current = finish;
  }, [finish]);

  // start the clock on mount
  useEffect(() => {
    startedRef.current = performance.now();
  }, []);

  // exam countdown -> auto submit at zero (state only mutated inside the
  // interval callback, submit deferred so we never setState in the effect body)
  useEffect(() => {
    if (!isExam || questions.length === 0) return;
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(id);
          setTimeout(() => void finishRef.current(answersRef.current), 0);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isExam, questions.length]);

  if (questions.length === 0) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Không có câu hỏi cho chế độ này.
          {mode === "review" && " Bạn chưa có câu nào cần ôn lại — hãy làm bài trước đã."}
        </p>
        <button
          onClick={onExit}
          className="mt-4 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-accent"
        >
          Quay lại
        </button>
      </div>
    );
  }

  const chosen = answers[pos];
  const answeredCount = answers.filter((a) => a !== null).length;

  const choose = (i: number) => {
    if (isExam) {
      // exam: just record selection, allow changing until submit
      setAnswers((prev) => prev.map((a, idx) => (idx === pos ? i : a)));
      return;
    }
    // practice / review: lock + reveal
    if (revealed) return;
    setAnswers((prev) => prev.map((a, idx) => (idx === pos ? i : a)));
    setRevealed(true);
    if (i === question.answer) {
      toast.success("Chính xác!");
    }
  };

  const next = () => {
    setRevealed(false);
    if (pos + 1 >= questions.length) {
      // `answers` already reflects the current pick (set in choose()).
      void finish(answers);
      return;
    }
    setPos((p) => p + 1);
  };

  const goto = (i: number) => {
    setRevealed(false);
    setPos(i);
  };

  return (
    <div className="mx-auto max-w-2xl">
      {/* header row */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            {course?.short} · {mode === "exam" ? "Thi thử" : mode === "review" ? "Ôn câu sai" : "Luyện tập"}
          </p>
          <p className="text-sm font-medium text-foreground">
            Câu {pos + 1} / {questions.length}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isExam && (
            <span
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-mono text-sm tabular-nums ${
                remaining < 60 ? "border-red-400 text-red-500" : "text-foreground"
              }`}
            >
              <Clock className="size-3.5" />
              {fmt(Math.max(0, remaining))}
            </span>
          )}
          <button
            onClick={onExit}
            className="text-muted-foreground hover:text-foreground"
            title="Thoát"
          >
            <X className="size-5" />
          </button>
        </div>
      </div>

      {/* progress bar */}
      <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${((pos + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* question card */}
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <p className="mb-4 text-base font-medium leading-snug text-card-foreground">
          {question.question}
        </p>

        <div className="flex flex-col gap-2">
          {question.options.map((opt, i) => {
            const isAnswer = i === question.answer;
            const isPicked = chosen === i;
            let cls =
              "border-border bg-background hover:bg-accent text-foreground";
            if (isExam) {
              if (isPicked) cls = "border-primary bg-primary/10 text-foreground";
            } else if (revealed) {
              if (isAnswer) cls = "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
              else if (isPicked) cls = "border-red-500 bg-red-500/10 text-red-700 dark:text-red-300";
              else cls = "border-border bg-background text-muted-foreground";
            }
            return (
              <button
                key={i}
                onClick={() => choose(i)}
                disabled={!isExam && revealed}
                className={`flex items-center justify-between rounded-lg border px-3.5 py-2.5 text-left text-sm transition-colors disabled:cursor-default ${cls}`}
              >
                <span>
                  <span className="mr-2 font-semibold text-muted-foreground">
                    {String.fromCharCode(65 + i)}.
                  </span>
                  {opt}
                </span>
                {!isExam && revealed && isAnswer && (
                  <Check className="size-4 shrink-0 text-emerald-500" />
                )}
              </button>
            );
          })}
        </div>

        {/* practice/review explanation */}
        {!isExam && revealed && question.explain && (
          <p className="mt-4 border-t pt-3 text-xs leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground">Giải thích: </span>
            {question.explain}
          </p>
        )}
      </div>

      {/* footer controls */}
      <div className="mt-4 flex items-center justify-between gap-3">
        {isExam ? (
          <>
            <button
              onClick={() => goto(Math.max(0, pos - 1))}
              disabled={pos === 0}
              className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-accent disabled:opacity-40"
            >
              ← Trước
            </button>
            <span className="text-xs text-muted-foreground">
              Đã trả lời {answeredCount}/{questions.length}
            </span>
            {pos + 1 < questions.length ? (
              <button
                onClick={() => goto(pos + 1)}
                className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-accent"
              >
                Sau →
              </button>
            ) : (
              <button
                onClick={() => void finish(answers)}
                disabled={submitting}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
              >
                {submitting ? "Đang nộp…" : "Nộp bài"}
              </button>
            )}
          </>
        ) : (
          <button
            onClick={next}
            disabled={!revealed || submitting}
            className="ml-auto rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
          >
            {pos + 1 >= questions.length ? (submitting ? "Đang lưu…" : "Hoàn thành") : "Câu tiếp theo →"}
          </button>
        )}
      </div>
    </div>
  );
}
