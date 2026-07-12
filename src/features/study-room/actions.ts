"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { ITEM_TYPES, type Placement, type UnlockKey } from "./catalog";
import { hasRoom } from "./themes";
import type { Prisma } from "@/generated/prisma/client";

// ---------------------------------------------------------------------------
// Persistence for the Study Room. Coins + focusMinutes live on GameState as a
// single shared wallet (per Clerk userId). Furniture layout lives per course in
// StudyRoom (userId + courseCode), so each subject has its own decorated room.
// ---------------------------------------------------------------------------

export interface GameStateDTO {
  coins: number;
  focusMinutes: number;
  placements: Placement[];
}

export interface RoomStateDTO extends GameStateDTO {
  /** false only when an authenticated load hit a DB error — the client must NOT
   *  autosave in that case, or it would clobber real data with the fallback. */
  loadOk: boolean;
}

const DEFAULT_STATE: GameStateDTO = {
  coins: 120,
  focusMinutes: 0,
  placements: [],
};

const MIGRATION_COURSE = "MLN111";

const placementSchema = z.object({
  id: z.string(),
  type: z.enum(ITEM_TYPES),
  gridX: z.number().int(),
  gridZ: z.number().int(),
  rot: z.number().int().min(0).max(3),
});

const saveSchema = z.object({
  coins: z.number().int().min(0).max(1_000_000),
  focusMinutes: z.number().int().min(0).max(1_000_000),
  placements: z.array(placementSchema).max(200),
});

// Only courses that actually have a room are valid (also normalizes case).
function normalizeCourse(courseCode: string): string | null {
  const c = courseCode.trim().toUpperCase();
  return hasRoom(c) ? c : null;
}

/** Load the shared wallet + the furniture layout for one course's room. */
export async function getRoomState(courseCode: string): Promise<RoomStateDTO> {
  const { userId } = await auth();
  if (!userId) return { ...DEFAULT_STATE, loadOk: true };

  const course = normalizeCourse(courseCode);
  if (!course) return { ...DEFAULT_STATE, loadOk: true };

  try {
    const [wallet, room] = await Promise.all([
      prisma.gameState.findUnique({ where: { userId } }),
      prisma.studyRoom.findUnique({
        where: { userId_courseCode: { userId, courseCode: course } },
      }),
    ]);

    const coins = wallet?.coins ?? DEFAULT_STATE.coins;
    const focusMinutes = wallet?.focusMinutes ?? DEFAULT_STATE.focusMinutes;

    let placements: Placement[] = [];
    if (room) {
      placements = (room.placements as unknown as Placement[]) ?? [];
    } else if (course === MIGRATION_COURSE && wallet) {
      // One-time graft: reuse the pre-multi-room single layout as MLN111's room,
      // and persist it immediately so the legacy path retires after the first
      // read (otherwise a fast room-switch could resurrect deleted furniture).
      placements = (wallet.placements as unknown as Placement[]) ?? [];
      if (placements.length > 0) {
        try {
          await prisma.studyRoom.create({
            data: {
              userId,
              courseCode: course,
              placements: placements as unknown as Prisma.InputJsonValue,
            },
          });
        } catch {
          // row may already exist from a concurrent request — safe to ignore
        }
      }
    }

    return { coins, focusMinutes, placements, loadOk: true };
  } catch (error) {
    console.error("[getRoomState] Failed to load room state:", error);
    // Signal failure so the client skips autosave instead of clobbering data.
    return { ...DEFAULT_STATE, loadOk: false };
  }
}

/** Achievement-based item unlocks the signed-in user has earned. */
export async function getUnlockedItems(): Promise<UnlockKey[]> {
  const { userId } = await auth();
  if (!userId) return [];

  try {
    const [stats, exam] = await Promise.all([
      prisma.userStats.findUnique({
        where: { userId },
        select: { longestStreak: true },
      }),
      prisma.quizAttempt.findFirst({
        where: { userId, mode: "exam", score: { gte: 80 } },
        select: { id: true },
      }),
    ]);

    const out: UnlockKey[] = [];
    if ((stats?.longestStreak ?? 0) >= 7) out.push("streak7");
    if (exam) out.push("exam80");
    return out;
  } catch (error) {
    console.error("[getUnlockedItems] failed:", error);
    return [];
  }
}

/** Upsert the shared wallet and the given course's furniture layout. */
export async function saveRoomState(
  courseCode: string,
  input: GameStateDTO,
): Promise<{ ok: boolean }> {
  const { userId } = await auth();
  if (!userId) return { ok: false };

  const course = normalizeCourse(courseCode);
  if (!course) return { ok: false };

  const parsed = saveSchema.safeParse(input);
  if (!parsed.success) {
    console.error("[saveRoomState] Invalid payload:", parsed.error.flatten());
    return { ok: false };
  }

  const { coins, focusMinutes, placements } = parsed.data;

  try {
    await Promise.all([
      // shared wallet
      prisma.gameState.upsert({
        where: { userId },
        create: { userId, coins, focusMinutes },
        update: { coins, focusMinutes },
      }),
      // per-course furniture layout
      prisma.studyRoom.upsert({
        where: { userId_courseCode: { userId, courseCode: course } },
        create: { userId, courseCode: course, placements },
        update: { placements },
      }),
    ]);
    return { ok: true };
  } catch (error) {
    console.error("[saveRoomState] Failed to save room state:", error);
    return { ok: false };
  }
}
