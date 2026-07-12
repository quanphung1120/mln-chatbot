"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { BookOpen, Check, Coins, X } from "lucide-react";
import { getCourse } from "@/lib/courses";
import { getBank } from "../data";
import { COINS_PER_CORRECT } from "../constants";
import { shuffledOrder } from "../lib";

interface QuizRunnerProps {
  courseCode: string;
  open: boolean;
  onClose: () => void;
  /** Called with the coins earned each time the user answers correctly. */
  onCorrect?: (coins: number) => void;
}

export function QuizRunner({ courseCode, open, onClose, onCorrect }: QuizRunnerProps) {
  const questions = useMemo(() => getBank(courseCode), [courseCode]);
  const course = getCourse(courseCode);

  const [order, setOrder] = useState<number[]>(() => shuffledOrder(questions.length));
  const [pos, setPos] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [earned, setEarned] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  // NOTE: run state (order/pos/earned/…) is initialized once at mount. To start
  // a fresh run for a different course, remount via `key={courseCode}` at the
  // call site (see hud.tsx and the standalone quiz page) rather than changing
  // `courseCode` on a mounted instance.
  const question = questions[order[pos]];
  const revealed = selected !== null;

  if (!open) return null;

  const title = course?.title ?? "Quiz";

  const choose = (i: number) => {
    if (revealed || !question) return;
    setSelected(i);
    if (i === question.answer) {
      onCorrect?.(COINS_PER_CORRECT);
      setEarned((e) => e + COINS_PER_CORRECT);
      setCorrectCount((c) => c + 1);
      toast.success(`Chính xác! +${COINS_PER_CORRECT} coins`);
    }
  };

  const next = () => {
    let nextPos = pos + 1;
    if (nextPos >= order.length) {
      setOrder(shuffledOrder(questions.length));
      nextPos = 0;
    }
    setPos(nextPos);
    setSelected(null);
  };

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg border border-white/15 bg-[#1c1712] text-white shadow-2xl">
        {/* header */}
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <BookOpen className="size-4 text-emerald-300" />
            {title}
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-xs text-amber-300">
              <Coins className="size-3.5" /> +{earned} ({correctCount} đúng)
            </span>
            <button
              onClick={onClose}
              className="text-white/50 hover:text-white"
              title="Đóng"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* empty-bank state */}
        {!question ? (
          <div className="px-4 py-10 text-center text-sm text-white/60">
            Chưa có câu hỏi cho môn{" "}
            <span className="font-semibold text-white/80">{course?.short ?? courseCode}</span>.
            <br />
            Bộ câu hỏi sẽ sớm được thêm vào.
          </div>
        ) : (
          <div className="px-4 py-4">
            <p className="mb-1 text-[11px] uppercase tracking-widest text-white/35">
              Câu hỏi · trả lời đúng để nhận {COINS_PER_CORRECT} coins
            </p>
            <p className="mb-4 text-base font-medium leading-snug">{question.question}</p>

            <div className="flex flex-col gap-2">
              {question.options.map((opt, i) => {
                const isAnswer = i === question.answer;
                const isPicked = selected === i;
                let cls =
                  "border-white/12 bg-white/[0.03] hover:bg-white/10 text-white/85";
                if (revealed && isAnswer) cls = "border-emerald-400 bg-emerald-500/20 text-emerald-100";
                else if (revealed && isPicked && !isAnswer)
                  cls = "border-red-400 bg-red-500/20 text-red-100";
                else if (revealed) cls = "border-white/10 bg-white/[0.02] text-white/40";
                return (
                  <button
                    key={i}
                    onClick={() => choose(i)}
                    disabled={revealed}
                    className={`flex items-center justify-between border px-3 py-2.5 text-left text-sm transition-colors disabled:cursor-default ${cls}`}
                  >
                    <span>
                      <span className="mr-2 font-semibold text-white/50">
                        {String.fromCharCode(65 + i)}.
                      </span>
                      {opt}
                    </span>
                    {revealed && isAnswer && <Check className="size-4 shrink-0 text-emerald-300" />}
                  </button>
                );
              })}
            </div>

            {/* explanation + next */}
            {revealed && (
              <div className="mt-4 border-t border-white/10 pt-3">
                {question.explain && (
                  <p className="mb-3 text-xs leading-relaxed text-white/60">
                    <span className="font-semibold text-white/80">Giải thích: </span>
                    {question.explain}
                  </p>
                )}
                <button
                  onClick={next}
                  className="w-full border border-amber-400/50 bg-amber-400/15 px-3 py-2 text-sm font-semibold text-amber-200 hover:bg-amber-400/25"
                >
                  Câu tiếp theo →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
