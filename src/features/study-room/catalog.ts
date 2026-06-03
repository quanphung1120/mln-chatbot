// ---------------------------------------------------------------------------
// Furniture catalog — the things you can buy with coins earned from studying.
// Each item is built from primitives in <Furniture/>, so no 3D assets needed.
// `footprint` is how many tiles (w × d) the item occupies on the grid.
// ---------------------------------------------------------------------------

export type ItemType =
  | "desk"
  | "bookshelf"
  | "plant"
  | "lamp"
  | "rug"
  | "bed"
  | "chair"
  | "globe";

export interface CatalogItem {
  type: ItemType;
  label: string;
  price: number;
  /** tile footprint [width, depth] */
  footprint: [number, number];
  /** swatch colour shown in the build palette */
  swatch: string;
  hint: string;
}

export const CATALOG: CatalogItem[] = [
  { type: "rug",       label: "Rug",        price: 20,  footprint: [2, 2], swatch: "#b45f52", hint: "Cozy floor" },
  { type: "plant",     label: "Plant",      price: 35,  footprint: [1, 1], swatch: "#3f8a4d", hint: "A little green" },
  { type: "chair",     label: "Chair",      price: 40,  footprint: [1, 1], swatch: "#8a6d3b", hint: "Take a seat" },
  { type: "lamp",      label: "Lamp",       price: 55,  footprint: [1, 1], swatch: "#e8c15a", hint: "Warm light" },
  { type: "desk",      label: "Study Desk", price: 90,  footprint: [2, 1], swatch: "#9c7a4d", hint: "Where you focus" },
  { type: "bookshelf", label: "Bookshelf",  price: 120, footprint: [1, 1], swatch: "#6b4f8a", hint: "Hold your notes" },
  { type: "globe",     label: "Globe",      price: 150, footprint: [1, 1], swatch: "#4d7d9c", hint: "See the world" },
  { type: "bed",       label: "Bed",        price: 200, footprint: [2, 3], swatch: "#5a7da8", hint: "Rest & recover" },
];

export const CATALOG_BY_TYPE: Record<ItemType, CatalogItem> = Object.fromEntries(
  CATALOG.map((item) => [item.type, item]),
) as Record<ItemType, CatalogItem>;

// A placed piece of furniture. (gridX, gridZ) is the tile of its near corner.
export interface Placement {
  id: string;
  type: ItemType;
  gridX: number;
  gridZ: number;
  /** rotation in 90° steps: 0,1,2,3 */
  rot: number;
}

// World dimensions, in tiles.
export const GRID_W = 10;
export const GRID_D = 10;
export const TILE = 1; // world units per tile

// Reward: coins earned per fully-completed focus session.
export const COINS_PER_SESSION = 50;
