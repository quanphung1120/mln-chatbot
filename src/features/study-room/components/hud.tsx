"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  BookOpen,
  Coins,
  GraduationCap,
  Hammer,
  Lock,
  Pause,
  Play,
  RotateCw,
  Square,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  CATALOG,
  CATALOG_BY_TYPE,
  COINS_PER_SESSION,
  type ItemCategory,
  type UnlockKey,
} from "../catalog";
import { useGameStore } from "../store";
import { ROOM_THEMES } from "../themes";
import { QuizRunner } from "@/features/quiz/components/quiz-runner";
import { COURSES } from "@/lib/courses";
import { coursesWithQuestions } from "@/features/quiz/data";

const DURATIONS = [
  { label: "5m", minutes: 5 },
  { label: "15m", minutes: 15 },
  { label: "25m", minutes: 25 },
];

function fmt(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

const CATEGORY_LABELS: Record<ItemCategory, string> = {
  basic: "Cơ bản",
  decor: "Theo môn",
  fun: "Vui",
  trophy: "Thành tích",
};
const CATEGORY_ORDER: ItemCategory[] = ["basic", "decor", "fun", "trophy"];

export function Hud({ unlocked = [] }: { unlocked?: UnlockKey[] }) {
  const coins = useGameStore((s) => s.coins);
  const focusMinutes = useGameStore((s) => s.focusMinutes);
  const buildMode = useGameStore((s) => s.buildMode);
  const selectedType = useGameStore((s) => s.selectedType);
  const setBuildMode = useGameStore((s) => s.setBuildMode);
  const selectItem = useGameStore((s) => s.selectItem);
  const rotateGhost = useGameStore((s) => s.rotateGhost);
  const awardSession = useGameStore((s) => s.awardSession);
  const addCoins = useGameStore((s) => s.addCoins);
  const recordQuizCorrect = useGameStore((s) => s.recordQuizCorrect);
  const currentCourse = useGameStore((s) => s.courseCode);
  const router = useRouter();
  const rooms = Object.values(ROOM_THEMES);

  // ── Screens ───────────────────────────────────────────────────────────
  // course picker open? which course's quiz is running (null = none)?
  const [pickerOpen, setPickerOpen] = useState(false);
  const [quizCourse, setQuizCourse] = useState<string | null>(null);
  const readyCourses = coursesWithQuestions();

  // ── Build palette (grouped by category, filtered to this room) ─────────
  const [buildCat, setBuildCat] = useState<ItemCategory>("basic");
  const roomItems = CATALOG.filter(
    (it) => !it.courses || it.courses.includes(currentCourse),
  );
  const categories = CATEGORY_ORDER.filter((cat) =>
    roomItems.some((it) => it.category === cat),
  );
  const activeCat = categories.includes(buildCat) ? buildCat : categories[0];
  const paletteItems = roomItems.filter((it) => it.category === activeCat);

  // ── Pomodoro timer ────────────────────────────────────────────────────
  const [duration, setDuration] = useState(25);
  const [remaining, setRemaining] = useState(25 * 60);
  const [running, setRunning] = useState(false);

  // Guard so a completed session only awards once even if React re-invokes the
  // state updater (Strict Mode / concurrent rendering).
  const awardedRef = useRef(false);

  const finish = useCallback(() => {
    if (awardedRef.current) return;
    awardedRef.current = true;
    setRunning(false);
    awardSession(duration);
    toast.success(`Focus complete! +${COINS_PER_SESSION} coins`, {
      description: `${duration} minutes studied. Spend them in build mode.`,
    });
  }, [awardSession, duration]);

  // Keep the interval callback pointed at the latest finish() without resubscribing.
  const finishRef = useRef(finish);
  useEffect(() => {
    finishRef.current = finish;
  }, [finish]);

  // Arm the award guard whenever a session (re)starts.
  useEffect(() => {
    if (running) awardedRef.current = false;
  }, [running]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(id);
          // Defer side-effects out of the (must-be-pure) state updater.
          setTimeout(() => finishRef.current(), 0);
          return duration * 60;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, duration]);

  const pickDuration = (m: number) => {
    setDuration(m);
    setRemaining(m * 60);
    setRunning(false);
  };

  const reset = () => {
    setRunning(false);
    setRemaining(duration * 60);
  };

  // ── Keyboard: R to rotate ghost, Esc to leave build mode ───────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "r" && buildMode) rotateGhost();
      if (e.key === "Escape" && buildMode) setBuildMode(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [buildMode, rotateGhost, setBuildMode]);

  return (
    <>
      {/* ── Top bar: coins + study total + room switcher ─────────── */}
      <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-col gap-2">
        <div className="flex gap-2">
          <div className="pointer-events-auto flex items-center gap-1.5 border border-amber-400/40 bg-black/70 px-3 py-1.5 text-sm font-semibold text-amber-300 backdrop-blur">
            <Coins className="size-4" />
            {coins}
          </div>
          <div className="pointer-events-auto flex items-center gap-1.5 border border-emerald-400/30 bg-black/70 px-3 py-1.5 text-xs font-medium text-emerald-300 backdrop-blur">
            <GraduationCap className="size-4" />
            {focusMinutes}m studied
          </div>
        </div>

        {/* room switcher — coins are shared, layout is per course */}
        <div className="pointer-events-auto flex items-center gap-1 border border-white/10 bg-black/70 p-1 backdrop-blur">
          {rooms.map((r) => {
            const active = r.courseCode === currentCourse;
            return (
              <button
                key={r.courseCode}
                onClick={() => {
                  if (!active) router.push(`/dashboard/study-room/${r.courseCode}`);
                }}
                title={r.name}
                className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                  active ? "bg-white/15 text-white" : "text-white/55 hover:bg-white/10 hover:text-white/80"
                }`}
              >
                {r.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Pomodoro panel (top-right) ───────────────────────────── */}
      <div className="pointer-events-auto absolute right-3 top-3 z-10 w-52 border border-white/10 bg-black/75 p-3 text-white backdrop-blur">
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-white/50">
          Focus session
        </div>
        <div className="mb-2 text-center font-mono text-3xl tabular-nums">{fmt(remaining)}</div>
        <div className="mb-2 flex gap-1">
          {DURATIONS.map((d) => (
            <button
              key={d.minutes}
              onClick={() => pickDuration(d.minutes)}
              disabled={running}
              className={`flex-1 border px-1 py-1 text-xs transition-colors disabled:opacity-40 ${
                duration === d.minutes
                  ? "border-amber-400 bg-amber-400/20 text-amber-200"
                  : "border-white/15 text-white/70 hover:bg-white/10"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setRunning((r) => !r)}
            className="flex flex-1 items-center justify-center gap-1 border border-emerald-400/50 bg-emerald-500/20 px-2 py-1.5 text-xs font-semibold text-emerald-200 hover:bg-emerald-500/30"
          >
            {running ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
            {running ? "Pause" : "Start"}
          </button>
          <button
            onClick={reset}
            className="flex items-center justify-center border border-white/15 px-2 py-1.5 text-white/60 hover:bg-white/10"
            title="Reset"
          >
            <Square className="size-3.5" />
          </button>
        </div>
        <p className="mt-2 text-[10px] leading-snug text-white/40">
          Finish a session to earn {COINS_PER_SESSION} coins, then build your room.
        </p>
      </div>

      {/* ── Actions (bottom-left): Quiz + Build ──────────────────── */}
      <div className="absolute bottom-3 left-3 z-10 flex flex-col gap-2">
        <button
          onClick={() => setPickerOpen(true)}
          className="flex items-center gap-2 border border-emerald-400/40 bg-black/70 px-3 py-2 text-sm font-semibold text-emerald-200 backdrop-blur transition-colors hover:bg-emerald-500/20"
        >
          <BookOpen className="size-4" />
          Quiz ôn tập
        </button>
        <button
          onClick={() => setBuildMode(!buildMode)}
          className={`flex items-center gap-2 border px-3 py-2 text-sm font-semibold backdrop-blur transition-colors ${
            buildMode
              ? "border-amber-400 bg-amber-400/20 text-amber-200"
              : "border-white/15 bg-black/70 text-white/80 hover:bg-white/10"
          }`}
        >
          {buildMode ? <X className="size-4" /> : <Hammer className="size-4" />}
          {buildMode ? "Exit build" : "Build mode"}
        </button>
      </div>

      {/* ── Course picker (before launching a quiz) ──────────────── */}
      {pickerOpen && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm border border-white/15 bg-[#1c1712] text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <BookOpen className="size-4 text-emerald-300" />
                Chọn môn ôn tập
              </div>
              <button
                onClick={() => setPickerOpen(false)}
                className="text-white/50 hover:text-white"
                title="Đóng"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="flex flex-col gap-2 p-4">
              {COURSES.map((c) => {
                const ready = readyCourses.includes(c.code);
                return (
                  <button
                    key={c.code}
                    onClick={() => {
                      if (!ready) return;
                      setQuizCourse(c.code);
                      setPickerOpen(false);
                    }}
                    disabled={!ready}
                    className="flex flex-col items-start border border-white/12 bg-white/[0.03] px-3 py-2.5 text-left transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <span className="text-sm font-semibold text-white/90">
                      {c.short} · {c.title}
                    </span>
                    <span className="text-[11px] text-white/45">
                      {ready ? c.blurb : "Sắp có câu hỏi"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Quiz screen ──────────────────────────────────────────── */}
      {quizCourse && (
        <QuizRunner
          key={quizCourse}
          courseCode={quizCourse}
          open
          onClose={() => setQuizCourse(null)}
          onCorrect={(coins) => {
            addCoins(coins);
            recordQuizCorrect();
          }}
        />
      )}

      {/* ── Build palette (bottom, when in build mode) ───────────── */}
      {buildMode && (
        <div className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2">
          {/* category tabs */}
          <div className="mb-1.5 flex items-center justify-center gap-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setBuildCat(cat)}
                className={`border px-3 py-1 text-[11px] font-medium backdrop-blur transition-colors ${
                  activeCat === cat
                    ? "border-amber-400 bg-amber-400/20 text-amber-200"
                    : "border-white/10 bg-black/70 text-white/60 hover:bg-white/10"
                }`}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>

          <div className="flex max-w-[90vw] flex-wrap items-center justify-center gap-1.5 border border-white/10 bg-black/80 p-2 backdrop-blur">
            {paletteItems.map((item) => {
              const locked = !!item.unlock && !unlocked.includes(item.unlock);
              const affordable = coins >= item.price;
              const active = selectedType === item.type;
              return (
                <button
                  key={item.type}
                  onClick={() => selectItem(active ? null : item.type)}
                  disabled={locked || !affordable}
                  title={locked ? `Khoá · ${item.hint}` : item.hint}
                  className={`relative flex w-20 flex-col items-center gap-1 border px-2 py-1.5 text-center transition-colors disabled:cursor-not-allowed disabled:opacity-35 ${
                    active
                      ? "border-amber-400 bg-amber-400/20"
                      : "border-white/10 hover:bg-white/10"
                  }`}
                >
                  {locked && (
                    <span className="absolute right-1 top-1 text-white/70">
                      <Lock className="size-3" />
                    </span>
                  )}
                  <span
                    className="size-5 border border-black/30"
                    style={{ backgroundColor: item.swatch }}
                  />
                  <span className="text-[11px] font-medium text-white/85">{item.label}</span>
                  <span className="flex items-center gap-0.5 text-[10px] text-amber-300">
                    <Coins className="size-2.5" />
                    {item.price}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mt-1.5 flex items-center justify-center gap-3 text-[11px] text-white/55">
            {selectedType ? (
              <span className="flex items-center gap-1">
                <RotateCw className="size-3" /> Nhấn <kbd className="px-1 text-white/80">R</kbd> để
                xoay · bấm sàn để đặt {CATALOG_BY_TYPE[selectedType].label}
              </span>
            ) : (
              <span>Chọn một món, hoặc bấm món đã đặt để bán lại (hoàn 50%)</span>
            )}
          </div>
        </div>
      )}
    </>
  );
}
