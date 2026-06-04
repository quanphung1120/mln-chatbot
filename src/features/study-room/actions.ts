"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import type { Placement } from "./catalog";

// ---------------------------------------------------------------------------
// Persistence for the Study Room game. State is keyed on the Clerk userId
// (a string), mirroring how chat sessions are scoped in this app.
// ---------------------------------------------------------------------------

export interface GameStateDTO {
  coins: number;
  focusMinutes: number;
  placements: Placement[];
}

const DEFAULT_STATE: GameStateDTO = {
  coins: 120,
  focusMinutes: 0,
  placements: [],
};

const placementSchema = z.object({
  id: z.string(),
  type: z.enum([
    "desk",
    "bookshelf",
    "plant",
    "lamp",
    "rug",
    "bed",
    "chair",
    "globe",
  ]),
  gridX: z.number().int(),
  gridZ: z.number().int(),
  rot: z.number().int().min(0).max(3),
});

const saveSchema = z.object({
  coins: z.number().int().min(0).max(1_000_000),
  focusMinutes: z.number().int().min(0).max(1_000_000),
  placements: z.array(placementSchema).max(200),
});

/** Load (or lazily create) the signed-in user's game state. */
export async function getGameState(): Promise<GameStateDTO> {
  const { userId } = await auth();
  if (!userId) return DEFAULT_STATE;

  try {
    const existing = await prisma.gameState.findUnique({ where: { userId } });
    if (!existing) return DEFAULT_STATE;

    return {
      coins: existing.coins,
      focusMinutes: existing.focusMinutes,
      placements: (existing.placements as unknown as Placement[]) ?? [],
    };
  } catch (error) {
    console.error("[getGameState] Failed to load game state:", error);
    return DEFAULT_STATE;
  }
}

/** Upsert the signed-in user's game state. Returns the saved snapshot. */
export async function saveGameState(
  input: GameStateDTO,
): Promise<{ ok: boolean }> {
  const { userId } = await auth();
  if (!userId) return { ok: false };

  const parsed = saveSchema.safeParse(input);
  if (!parsed.success) {
    console.error("[saveGameState] Invalid payload:", parsed.error.flatten());
    return { ok: false };
  }

  const { coins, focusMinutes, placements } = parsed.data;

  try {
    await prisma.gameState.upsert({
      where: { userId },
      create: { userId, coins, focusMinutes, placements },
      update: { coins, focusMinutes, placements },
    });
    return { ok: true };
  } catch (error) {
    console.error("[saveGameState] Failed to save game state:", error);
    return { ok: false };
  }
}
