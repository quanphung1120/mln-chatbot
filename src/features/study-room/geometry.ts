import { GRID_D, GRID_W, type ItemType } from "./catalog";
import { rotatedFootprint } from "./store";

// Grid origin (tile 0,0) is at the back-left; the grid is centred on the world
// origin so the camera looks at the middle of the room.
export const HALF_W = GRID_W / 2;
export const HALF_D = GRID_D / 2;

/** World x/z of the centre of tile (gridX, gridZ). */
export function tileCenter(gridX: number, gridZ: number): [number, number] {
  return [gridX - HALF_W + 0.5, gridZ - HALF_D + 0.5];
}

/** World x/z of the centre of an item's footprint placed at its near corner. */
export function footprintCenter(
  type: ItemType,
  gridX: number,
  gridZ: number,
  rot: number,
): [number, number] {
  const [w, d] = rotatedFootprint(type, rot);
  return [gridX - HALF_W + w / 2, gridZ - HALF_D + d / 2];
}

/** Convert a world x/z hit point to the tile under it. */
export function worldToTile(x: number, z: number): { gridX: number; gridZ: number } {
  return {
    gridX: Math.floor(x + HALF_W),
    gridZ: Math.floor(z + HALF_D),
  };
}
