import { create } from "zustand";
import {
  CATALOG_BY_TYPE,
  COINS_PER_SESSION,
  GRID_D,
  GRID_W,
  type ItemType,
  type Placement,
} from "./catalog";
import type { GameStateDTO } from "./actions";

// Footprint of an item once rotated. Odd rotations swap width/depth.
export function rotatedFootprint(type: ItemType, rot: number): [number, number] {
  const [w, d] = CATALOG_BY_TYPE[type].footprint;
  return rot % 2 === 0 ? [w, d] : [d, w];
}

// The set of tiles an item would cover if placed at (gridX, gridZ) with `rot`.
export function tilesFor(
  type: ItemType,
  gridX: number,
  gridZ: number,
  rot: number,
): { x: number; z: number }[] {
  const [w, d] = rotatedFootprint(type, rot);
  const tiles: { x: number; z: number }[] = [];
  for (let dx = 0; dx < w; dx++) {
    for (let dz = 0; dz < d; dz++) {
      tiles.push({ x: gridX + dx, z: gridZ + dz });
    }
  }
  return tiles;
}

function inBounds(type: ItemType, gridX: number, gridZ: number, rot: number) {
  const [w, d] = rotatedFootprint(type, rot);
  return gridX >= 0 && gridZ >= 0 && gridX + w <= GRID_W && gridZ + d <= GRID_D;
}

// Build a quick lookup of occupied tiles ("x,z" → true).
function occupiedSet(placements: Placement[]): Set<string> {
  const set = new Set<string>();
  for (const p of placements) {
    for (const t of tilesFor(p.type, p.gridX, p.gridZ, p.rot)) {
      set.add(`${t.x},${t.z}`);
    }
  }
  return set;
}

/** Can `type` be legally placed at (gridX,gridZ) given current placements? */
export function canPlace(
  placements: Placement[],
  type: ItemType,
  gridX: number,
  gridZ: number,
  rot: number,
): boolean {
  if (!inBounds(type, gridX, gridZ, rot)) return false;
  const occupied = occupiedSet(placements);
  return tilesFor(type, gridX, gridZ, rot).every(
    (t) => !occupied.has(`${t.x},${t.z}`),
  );
}

let idCounter = 0;
function nextId() {
  idCounter += 1;
  // Prefer a real UUID; fall back to a time+counter id. Both stay unique across
  // page reloads, so a freshly-placed item never collides with the ids already
  // loaded from the database (which previously caused duplicate React keys).
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `p-${crypto.randomUUID()}`;
  }
  return `p-${Date.now().toString(36)}-${idCounter}`;
}

interface GameStore {
  loaded: boolean;
  coins: number;
  focusMinutes: number;
  placements: Placement[];

  buildMode: boolean;
  selectedType: ItemType | null;
  ghostRot: number;

  // session-only stats (not persisted)
  quizCorrect: number;

  hydrate: (state: GameStateDTO) => void;
  addCoins: (amount: number) => void;
  recordQuizCorrect: () => void;
  setBuildMode: (on: boolean) => void;
  selectItem: (type: ItemType | null) => void;
  rotateGhost: () => void;
  tryPlace: (gridX: number, gridZ: number) => boolean;
  removePlacement: (id: string) => void;
  awardSession: (minutes: number) => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  loaded: false,
  coins: 0,
  focusMinutes: 0,
  placements: [],

  buildMode: false,
  selectedType: null,
  ghostRot: 0,

  quizCorrect: 0,

  hydrate: (state) =>
    set({
      loaded: true,
      coins: state.coins,
      focusMinutes: state.focusMinutes,
      // Re-key on load so any duplicate ids saved by older builds are healed.
      placements: (state.placements ?? []).map((p) => ({ ...p, id: nextId() })),
    }),

  addCoins: (amount) => set((s) => ({ coins: Math.max(0, s.coins + amount) })),

  recordQuizCorrect: () => set((s) => ({ quizCorrect: s.quizCorrect + 1 })),

  setBuildMode: (on) =>
    set({ buildMode: on, selectedType: on ? get().selectedType : null }),

  selectItem: (type) => set({ selectedType: type, ghostRot: 0 }),

  rotateGhost: () => set((s) => ({ ghostRot: (s.ghostRot + 1) % 4 })),

  tryPlace: (gridX, gridZ) => {
    const { selectedType, ghostRot, placements, coins } = get();
    if (!selectedType) return false;

    const price = CATALOG_BY_TYPE[selectedType].price;
    if (coins < price) return false;
    if (!canPlace(placements, selectedType, gridX, gridZ, ghostRot)) return false;

    set({
      coins: coins - price,
      placements: [
        ...placements,
        { id: nextId(), type: selectedType, gridX, gridZ, rot: ghostRot },
      ],
    });
    return true;
  },

  removePlacement: (id) => {
    const { placements } = get();
    const target = placements.find((p) => p.id === id);
    if (!target) return;
    // Refund half the price when selling back.
    const refund = Math.floor(CATALOG_BY_TYPE[target.type].price / 2);
    set({
      coins: get().coins + refund,
      placements: placements.filter((p) => p.id !== id),
    });
  },

  awardSession: (minutes) =>
    set((s) => ({
      coins: s.coins + COINS_PER_SESSION,
      focusMinutes: s.focusMinutes + minutes,
    })),
}));
