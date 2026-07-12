// ---------------------------------------------------------------------------
// Per-course room themes. Each course code that has a theme here gets its own
// study room (route + picker card + HUD switcher entry). All the previously
// hardcoded colors in scene.tsx / room.tsx / environment.tsx now come from here.
// ---------------------------------------------------------------------------

export interface RoomTheme {
  courseCode: string;
  /** short room name shown in the HUD / picker */
  name: string;
  bg: string;
  fog: [string, number, number];
  sky: {
    sunPosition: [number, number, number];
    turbidity: number;
    rayleigh: number;
    mieCoefficient: number;
  };
  light: {
    hemiSky: string;
    hemiGround: string;
    ambient: number;
    dirColor: string;
    dirIntensity: number;
  };
  floorLight: string;
  floorDark: string;
  grid: [string, string];
  wallBack: string;
  wallLeft: string;
  baseboard: [string, string];
  /** hex accent used for HUD chrome tied to this room */
  accent: string;
  /** wall-art panel color on the back wall */
  poster: string;
  decor: {
    grass: string;
    grassDark: string;
    trunk: string;
    leaves: [string, string, string];
    flowerColors: string[];
    fence: [string, string];
  };
}

export const ROOM_THEMES: Record<string, RoomTheme> = {
  // Triết học Mác – Lênin — warm scholarly library.
  MLN111: {
    courseCode: "MLN111",
    name: "Phòng Triết học",
    bg: "#e7ddc7",
    fog: ["#e7ddc7", 30, 70],
    sky: { sunPosition: [8, 14, 5], turbidity: 6, rayleigh: 1.0, mieCoefficient: 0.006 },
    light: {
      hemiSky: "#fff3dd",
      hemiGround: "#6a5a3f",
      ambient: 0.42,
      dirColor: "#ffe9c2",
      dirIntensity: 2.1,
    },
    floorLight: "#caa46e",
    floorDark: "#b8915c",
    grid: ["#8a6c44", "#9c7c52"],
    wallBack: "#7c6a52",
    wallLeft: "#6f5e48",
    baseboard: ["#4a3d2c", "#443626"],
    accent: "#d9a441",
    poster: "#3f5447",
    decor: {
      grass: "#6aa84f",
      grassDark: "#5e9a45",
      trunk: "#6b4a2e",
      leaves: ["#3f7d3a", "#4c9145", "#357031"],
      flowerColors: ["#e8c15a", "#d4564b", "#c77dd0"],
      fence: ["#8a6a44", "#7a5d3c"],
    },
  },

  // Kinh tế chính trị Mác – Lênin — cool modern office.
  MLN122: {
    courseCode: "MLN122",
    name: "Phòng Kinh tế",
    bg: "#cddde6",
    fog: ["#cddde6", 30, 70],
    sky: { sunPosition: [6, 13, 7], turbidity: 4, rayleigh: 1.4, mieCoefficient: 0.004 },
    light: {
      hemiSky: "#eaf3ff",
      hemiGround: "#4a5a63",
      ambient: 0.45,
      dirColor: "#eef4ff",
      dirIntensity: 2.0,
    },
    floorLight: "#a9b7bf",
    floorDark: "#98a8b1",
    grid: ["#7f929c", "#8ea1aa"],
    wallBack: "#4f6d78",
    wallLeft: "#456069",
    baseboard: ["#2f4149", "#293940"],
    accent: "#3f7fbf",
    poster: "#2f4149",
    decor: {
      grass: "#74a86a",
      grassDark: "#6a9c60",
      trunk: "#6b4a2e",
      leaves: ["#4a8a5a", "#5aa06a", "#3f8050"],
      flowerColors: ["#5b8dd6", "#e8c15a", "#7fb0e0"],
      fence: ["#7d7f8a", "#6b6d78"],
    },
  },
};

/** Course codes that have a study room, in display order. */
export const ROOM_COURSES = Object.keys(ROOM_THEMES);

export function getTheme(courseCode: string): RoomTheme {
  return ROOM_THEMES[courseCode] ?? ROOM_THEMES.MLN111;
}

export function hasRoom(courseCode: string): boolean {
  return courseCode in ROOM_THEMES;
}
