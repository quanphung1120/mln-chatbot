"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Toaster } from "@/components/ui/sonner";
import { useGameStore } from "../store";
import { saveRoomState, type RoomStateDTO } from "../actions";
import type { RoomTheme } from "../themes";
import type { UnlockKey } from "../catalog";
import { Hud } from "./hud";

// The 3D scene must never render on the server (WebGL needs the browser).
const Scene = dynamic(() => import("./scene"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[#dfe7ec] text-sm text-slate-700/70">
      Loading your study room…
    </div>
  ),
});

export function StudyRoomGame({
  courseCode,
  initialState,
  theme,
  unlocked,
}: {
  courseCode: string;
  initialState: RoomStateDTO;
  theme: RoomTheme;
  unlocked: UnlockKey[];
}) {
  const hydrate = useGameStore((s) => s.hydrate);
  const loaded = useGameStore((s) => s.loaded);
  const coins = useGameStore((s) => s.coins);
  const focusMinutes = useGameStore((s) => s.focusMinutes);
  const placements = useGameStore((s) => s.placements);

  // Hydrate once from the server snapshot (per course room).
  useEffect(() => {
    hydrate(initialState, courseCode);
  }, [hydrate, initialState, courseCode]);

  // Debounced autosave whenever the persisted slice changes. Skipped entirely
  // when the initial load failed, so a transient read error can't be persisted
  // as an empty room / reset wallet over the user's real data.
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!loaded || !initialState.loadOk) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      void saveRoomState(courseCode, { coins, focusMinutes, placements });
    }, 1200);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [loaded, initialState.loadOk, courseCode, coins, focusMinutes, placements]);

  // Flush the latest state on unmount (e.g. switching rooms via router.push) so
  // the last <1.2s of coin/placement changes aren't dropped by the debounce.
  const latestRef = useRef({ courseCode, coins, focusMinutes, placements, canSave: false });
  useEffect(() => {
    latestRef.current = {
      courseCode,
      coins,
      focusMinutes,
      placements,
      canSave: loaded && initialState.loadOk,
    };
  });
  useEffect(
    () => () => {
      const l = latestRef.current;
      if (l.canSave) {
        void saveRoomState(l.courseCode, {
          coins: l.coins,
          focusMinutes: l.focusMinutes,
          placements: l.placements,
        });
      }
    },
    [],
  );

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ backgroundColor: theme.bg }}
    >
      <Scene theme={theme} />
      <Hud unlocked={unlocked} />

      {/* movement hint */}
      <div className="pointer-events-none absolute bottom-3 right-3 z-10 border border-white/10 bg-black/60 px-2.5 py-1.5 text-[11px] text-white/55 backdrop-blur">
        Move: <kbd className="text-white/80">WASD</kbd> / arrows · drag to orbit · scroll to zoom
      </div>

      <Toaster position="top-center" />
    </div>
  );
}
