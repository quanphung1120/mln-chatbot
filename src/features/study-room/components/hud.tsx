"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  BookOpen,
  Coins,
  GraduationCap,
  Hammer,
  Pause,
  Play,
  RotateCw,
  Square,
  X,
} from "lucide-react";
import { CATALOG, CATALOG_BY_TYPE, COINS_PER_SESSION } from "../catalog";
import { useGameStore } from "../store";
import { Quiz } from "./quiz";

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

export function Hud() {
  const coins = useGameStore((s) => s.coins);
  const focusMinutes = useGameStore((s) => s.focusMinutes);
  const buildMode = useGameStore((s) => s.buildMode);
  const selectedType = useGameStore((s) => s.selectedType);
  const setBuildMode = useGameStore((s) => s.setBuildMode);
  const selectItem = useGameStore((s) => s.selectItem);
  const rotateGhost = useGameStore((s) => s.rotateGhost);
  const awardSession = useGameStore((s) => s.awardSession);

  // ── Screens ───────────────────────────────────────────────────────────
  const [quizOpen, setQuizOpen] = useState(false);

  // ── Pomodoro timer ────────────────────────────────────────────────────
  const [duration, setDuration] = useState(25);
  const [remaining, setRemaining] = useState(25 * 60);
  const [running, setRunning] = useState(false);

  const finish = useCallback(() => {
    setRunning(false);
    awardSession(duration);
    toast.success(`Focus complete! +${COINS_PER_SESSION} coins`, {
      description: `${duration} minutes studied. Spend them in build mode.`,
    });
  }, [awardSession, duration]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(id);
          finish();
          return duration * 60;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, duration, finish]);

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
      {/* ── Top bar: coins + study total ─────────────────────────── */}
      <div className="pointer-events-none absolute left-3 top-3 z-10 flex gap-2">
        <div className="pointer-events-auto flex items-center gap-1.5 border border-amber-400/40 bg-black/70 px-3 py-1.5 text-sm font-semibold text-amber-300 backdrop-blur">
          <Coins className="size-4" />
          {coins}
        </div>
        <div className="pointer-events-auto flex items-center gap-1.5 border border-emerald-400/30 bg-black/70 px-3 py-1.5 text-xs font-medium text-emerald-300 backdrop-blur">
          <GraduationCap className="size-4" />
          {focusMinutes}m studied
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
          onClick={() => setQuizOpen(true)}
          className="flex items-center gap-2 border border-emerald-400/40 bg-black/70 px-3 py-2 text-sm font-semibold text-emerald-200 backdrop-blur transition-colors hover:bg-emerald-500/20"
        >
          <BookOpen className="size-4" />
          Triết học Quiz
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

      {/* ── Quiz screen ──────────────────────────────────────────── */}
      <Quiz open={quizOpen} onClose={() => setQuizOpen(false)} />

      {/* ── Build palette (bottom, when in build mode) ───────────── */}
      {buildMode && (
        <div className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2">
          <div className="flex max-w-[90vw] flex-wrap items-center justify-center gap-1.5 border border-white/10 bg-black/80 p-2 backdrop-blur">
            {CATALOG.map((item) => {
              const affordable = coins >= item.price;
              const active = selectedType === item.type;
              return (
                <button
                  key={item.type}
                  onClick={() => selectItem(active ? null : item.type)}
                  disabled={!affordable}
                  title={item.hint}
                  className={`flex w-20 flex-col items-center gap-1 border px-2 py-1.5 text-center transition-colors disabled:cursor-not-allowed disabled:opacity-35 ${
                    active
                      ? "border-amber-400 bg-amber-400/20"
                      : "border-white/10 hover:bg-white/10"
                  }`}
                >
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
                <RotateCw className="size-3" /> Press <kbd className="px-1 text-white/80">R</kbd> to
                rotate · click floor to place {CATALOG_BY_TYPE[selectedType].label}
              </span>
            ) : (
              <span>Pick an item, or click a placed item to sell it (50% refund)</span>
            )}
          </div>
        </div>
      )}
    </>
  );
}
