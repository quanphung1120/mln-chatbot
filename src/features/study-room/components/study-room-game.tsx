"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Toaster } from "@/components/ui/sonner";
import { useGameStore } from "../store";
import { saveGameState, type GameStateDTO } from "../actions";
import { Hud } from "./hud";

// The 3D scene must never render on the server (WebGL needs the browser).
const Scene = dynamic(() => import("./scene"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[#bcd9e8] text-sm text-slate-700/70">
      Loading your study room…
    </div>
  ),
});

export function StudyRoomGame({ initialState }: { initialState: GameStateDTO }) {
  const hydrate = useGameStore((s) => s.hydrate);
  const loaded = useGameStore((s) => s.loaded);
  const coins = useGameStore((s) => s.coins);
  const focusMinutes = useGameStore((s) => s.focusMinutes);
  const placements = useGameStore((s) => s.placements);

  // Hydrate once from the server snapshot.
  useEffect(() => {
    hydrate(initialState);
  }, [hydrate, initialState]);

  // Debounced autosave whenever the persisted slice changes.
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!loaded) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      void saveGameState({ coins, focusMinutes, placements });
    }, 1200);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [loaded, coins, focusMinutes, placements]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#bcd9e8]">
      <Scene />
      <Hud />

      {/* movement hint */}
      <div className="pointer-events-none absolute bottom-3 right-3 z-10 border border-white/10 bg-black/60 px-2.5 py-1.5 text-[11px] text-white/55 backdrop-blur">
        Move: <kbd className="text-white/80">WASD</kbd> / arrows · drag to orbit · scroll to zoom
      </div>

      <Toaster position="top-center" />
    </div>
  );
}
