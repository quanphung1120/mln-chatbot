"use client";

import { memo } from "react";
import { GRID_D, GRID_W } from "../catalog";
import { HALF_D, HALF_W, tileCenter } from "../geometry";
import type { RoomTheme } from "../themes";

// ---------------------------------------------------------------------------
// The room: a checkerboard floor + two low walls forming an L, a top cornice,
// and a framed wall-art panel. All colors come from the course RoomTheme so
// each subject's room looks distinct.
// ---------------------------------------------------------------------------

const WALL_H = 2.6;
const WALL_T = 0.18;

function RoomImpl({ theme }: { theme: RoomTheme }) {
  const tiles = [];
  for (let x = 0; x < GRID_W; x++) {
    for (let z = 0; z < GRID_D; z++) {
      const [wx, wz] = tileCenter(x, z);
      const light = (x + z) % 2 === 0;
      tiles.push(
        <mesh key={`${x}-${z}`} position={[wx, 0, wz]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[1, 1]} />
          <meshStandardMaterial color={light ? theme.floorLight : theme.floorDark} />
        </mesh>,
      );
    }
  }

  return (
    <group>
      {tiles}

      {/* subtle grid lines on top of the floor */}
      <gridHelper
        args={[Math.max(GRID_W, GRID_D), Math.max(GRID_W, GRID_D), theme.grid[0], theme.grid[1]]}
        position={[0, 0.011, 0]}
      />

      {/* back wall (along the far -Z edge) */}
      <mesh position={[0, WALL_H / 2, -HALF_D - WALL_T / 2]} castShadow receiveShadow>
        <boxGeometry args={[GRID_W + WALL_T * 2, WALL_H, WALL_T]} />
        <meshStandardMaterial color={theme.wallBack} />
      </mesh>

      {/* left wall (along the -X edge) */}
      <mesh position={[-HALF_W - WALL_T / 2, WALL_H / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[WALL_T, WALL_H, GRID_D]} />
        <meshStandardMaterial color={theme.wallLeft} />
      </mesh>

      {/* baseboards for a bit of depth */}
      <mesh position={[0, 0.08, -HALF_D - 0.01]}>
        <boxGeometry args={[GRID_W + WALL_T * 2, 0.16, 0.06]} />
        <meshStandardMaterial color={theme.baseboard[0]} />
      </mesh>
      <mesh position={[-HALF_W - 0.01, 0.08, 0]}>
        <boxGeometry args={[0.06, 0.16, GRID_D]} />
        <meshStandardMaterial color={theme.baseboard[1]} />
      </mesh>

      {/* top cornice trim on both walls */}
      <mesh position={[0, WALL_H - 0.06, -HALF_D - WALL_T / 2]}>
        <boxGeometry args={[GRID_W + WALL_T * 2, 0.12, WALL_T + 0.06]} />
        <meshStandardMaterial color={theme.baseboard[0]} />
      </mesh>
      <mesh position={[-HALF_W - WALL_T / 2, WALL_H - 0.06, 0]}>
        <boxGeometry args={[WALL_T + 0.06, 0.12, GRID_D]} />
        <meshStandardMaterial color={theme.baseboard[1]} />
      </mesh>

      {/* framed wall-art panel on the back wall (faces +Z into the room) */}
      <group position={[-1.6, 1.55, -HALF_D + 0.05]}>
        <mesh castShadow>
          <boxGeometry args={[1.7, 1.15, 0.05]} />
          <meshStandardMaterial color={theme.baseboard[0]} />
        </mesh>
        <mesh position={[0, 0, 0.035]}>
          <boxGeometry args={[1.48, 0.94, 0.02]} />
          <meshStandardMaterial color={theme.poster} />
        </mesh>
        <mesh position={[0, -0.32, 0.05]}>
          <boxGeometry args={[1.15, 0.12, 0.02]} />
          <meshStandardMaterial color={theme.accent} emissive={theme.accent} emissiveIntensity={0.25} />
        </mesh>
        <mesh position={[0, 0.18, 0.05]}>
          <boxGeometry args={[1.15, 0.06, 0.02]} />
          <meshStandardMaterial color={theme.accent} />
        </mesh>
      </group>
    </group>
  );
}

// Static per-theme; memo so build-mode ghost updates don't re-render the room.
export const Room = memo(RoomImpl);
