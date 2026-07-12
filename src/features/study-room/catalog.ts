// ---------------------------------------------------------------------------
// Furniture catalog — the things you can buy with coins earned from studying.
// Each item is built from primitives in <Furniture/>, so no 3D assets needed.
// `footprint` is how many tiles (w × d) the item occupies on the grid.
// ---------------------------------------------------------------------------

// Single source of truth for furniture ids — the TS union and the server-side
// zod validation (actions.ts) both derive from this tuple, so adding an item is
// a one-line change here plus a CATALOG entry + a furniture-models case.
export const ITEM_TYPES = [
  // original set
  "desk",
  "bookshelf",
  "plant",
  "lamp",
  "rug",
  "bed",
  "chair",
  "globe",
  // basic (new)
  "sofa",
  "coffeetable",
  "floorlamp",
  "tallshelf",
  "clock",
  "roundrug",
  "cabinet",
  // course-specific decor
  "abacus",
  "ledger",
  "bust",
  "scroll",
  // fun
  "cat",
  "aquarium",
  "bigplant",
  // achievement (unlockable)
  "trophy",
  "medalshelf",
] as const;

export type ItemType = (typeof ITEM_TYPES)[number];

export type ItemCategory = "basic" | "decor" | "fun" | "trophy";
export type UnlockKey = "streak7" | "exam80";

export interface CatalogItem {
  type: ItemType;
  label: string;
  price: number;
  /** tile footprint [width, depth] */
  footprint: [number, number];
  /** swatch colour shown in the build palette */
  swatch: string;
  hint: string;
  /** palette group */
  category: ItemCategory;
  /** if set, item only appears in these courses' rooms (course-specific decor) */
  courses?: string[];
  /** if set, item is locked until the achievement is earned */
  unlock?: UnlockKey;
}

export const CATALOG: CatalogItem[] = [
  // ── basic ────────────────────────────────────────────────────────────
  { type: "rug",         label: "Thảm",        price: 20,  footprint: [2, 2], swatch: "#b45f52", hint: "Sàn ấm cúng",        category: "basic" },
  { type: "plant",       label: "Cây nhỏ",     price: 35,  footprint: [1, 1], swatch: "#3f8a4d", hint: "Chút xanh",          category: "basic" },
  { type: "chair",       label: "Ghế",         price: 40,  footprint: [1, 1], swatch: "#8a6d3b", hint: "Ngồi nghỉ",          category: "basic" },
  { type: "lamp",        label: "Đèn bàn",     price: 55,  footprint: [1, 1], swatch: "#e8c15a", hint: "Ánh sáng ấm",        category: "basic" },
  { type: "desk",        label: "Bàn học",     price: 90,  footprint: [2, 1], swatch: "#9c7a4d", hint: "Nơi tập trung",      category: "basic" },
  { type: "bookshelf",   label: "Kệ sách",     price: 120, footprint: [1, 1], swatch: "#6b4f8a", hint: "Đựng ghi chú",       category: "basic" },
  { type: "globe",       label: "Quả địa cầu", price: 150, footprint: [1, 1], swatch: "#4d7d9c", hint: "Nhìn ra thế giới",   category: "basic" },
  { type: "bed",         label: "Giường",      price: 200, footprint: [2, 3], swatch: "#5a7da8", hint: "Nghỉ ngơi",          category: "basic" },
  { type: "sofa",        label: "Sofa",        price: 130, footprint: [2, 1], swatch: "#7c6f9c", hint: "Ghế dài thư giãn",   category: "basic" },
  { type: "coffeetable", label: "Bàn trà",     price: 60,  footprint: [1, 1], swatch: "#a07f52", hint: "Bàn trà nhỏ",        category: "basic" },
  { type: "floorlamp",   label: "Đèn sàn",     price: 70,  footprint: [1, 1], swatch: "#e8c15a", hint: "Đèn đứng cao",       category: "basic" },
  { type: "tallshelf",   label: "Kệ sách cao", price: 160, footprint: [1, 1], swatch: "#5a4a78", hint: "Nhiều sách hơn",     category: "basic" },
  { type: "clock",       label: "Đồng hồ cây", price: 110, footprint: [1, 1], swatch: "#7a5d3c", hint: "Điểm giờ học",       category: "basic" },
  { type: "roundrug",    label: "Thảm tròn",   price: 30,  footprint: [2, 2], swatch: "#c77dd0", hint: "Thảm mềm tròn",      category: "basic" },
  { type: "cabinet",     label: "Tủ hồ sơ",    price: 100, footprint: [1, 1], swatch: "#7f929c", hint: "Cất tài liệu",       category: "basic" },

  // ── course-specific decor ────────────────────────────────────────────
  { type: "abacus",      label: "Bàn tính",    price: 80,  footprint: [1, 1], swatch: "#b3473d", hint: "Kinh tế chính trị",  category: "decor", courses: ["MLN122"] },
  { type: "ledger",      label: "Sổ & biểu đồ",price: 90,  footprint: [1, 1], swatch: "#4d7d9c", hint: "Số liệu kinh tế",    category: "decor", courses: ["MLN122"] },
  { type: "bust",        label: "Tượng bán thân",price: 140,footprint: [1, 1], swatch: "#cfc6b6", hint: "Nhà triết học",     category: "decor", courses: ["MLN111"] },
  { type: "scroll",      label: "Cuộn thư tịch",price: 75, footprint: [1, 1], swatch: "#d8c79a", hint: "Kinh điển triết học", category: "decor", courses: ["MLN111"] },

  // ── fun ──────────────────────────────────────────────────────────────
  { type: "cat",         label: "Mèo cưng",    price: 120, footprint: [1, 1], swatch: "#d69a5c", hint: "Bạn đồng hành",      category: "fun" },
  { type: "aquarium",    label: "Bể cá",       price: 150, footprint: [2, 1], swatch: "#4fa0c0", hint: "Thư giãn mắt",       category: "fun" },
  { type: "bigplant",    label: "Cây lớn",     price: 90,  footprint: [1, 1], swatch: "#357031", hint: "Góc xanh mát",       category: "fun" },

  // ── achievement (unlockable) ─────────────────────────────────────────
  { type: "trophy",      label: "Cúp",         price: 200, footprint: [1, 1], swatch: "#e8c15a", hint: "Mở khi chuỗi 7 ngày", category: "trophy", unlock: "streak7" },
  { type: "medalshelf",  label: "Kệ huy chương",price: 220,footprint: [1, 1], swatch: "#d9a441", hint: "Mở khi thi ≥ 80%",   category: "trophy", unlock: "exam80" },
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
