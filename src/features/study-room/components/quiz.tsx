"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { BookOpen, Check, Coins, X } from "lucide-react";
import { COINS_PER_CORRECT, QUIZ_QUESTIONS } from "../quiz-data";
import { useGameStore } from "../store";

// Fisher–Yates shuffle of question indices so questions don't repeat until the
// whole bank has been seen.
function shuffledOrder(): number[] {
  const order = QUIZ_QUESTIONS.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

export function Quiz({ open, onClose }: { open: boolean; onClose: () => void }) {
  const addCoins = useGameStore((s) => s.addCoins);
  const recordQuizCorrect = useGameStore((s) => s.recordQuizCorrect);

  const [order, setOrder] = useState<number[]>(() => shuffledOrder());
  const [pos, setPos] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [earned, setEarned] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  const question = useMemo(() => QUIZ_QUESTIONS[order[pos]], [order, pos]);
  const revealed = selected !== null;

  if (!open) return null;

  const choose = (i: number) => {
    if (revealed) return;
    setSelected(i);
    if (i === question.answer) {
      addCoins(COINS_PER_CORRECT);
      recordQuizCorrect();
      setEarned((e) => e + COINS_PER_CORRECT);
      setCorrectCount((c) => c + 1);
      toast.success(`Chính xác! +${COINS_PER_CORRECT} coins`);
    }
  };

  const next = () => {
    let nextPos = pos + 1;
    let nextOrder = order;
    if (nextPos >= order.length) {
      nextOrder = shuffledOrder();
      nextPos = 0;
      setOrder(nextOrder);
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
            Triết học Mác – Lênin
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

        {/* question */}
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
      </div>
    </div>
  );
}
