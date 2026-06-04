"use client";

import { GRID_D, GRID_W } from "../catalog";
import { HALF_D, HALF_W, tileCenter } from "../geometry";

// ---------------------------------------------------------------------------
// The room: a checkerboard wood floor + two low walls forming an L (matching
// the cozy isometric shop look). Floor receives shadows from furniture/player.
// ---------------------------------------------------------------------------

const WALL_H = 2.6;
const WALL_T = 0.18;

export function Room() {
  const tiles = [];
  for (let x = 0; x < GRID_W; x++) {
    for (let z = 0; z < GRID_D; z++) {
      const [wx, wz] = tileCenter(x, z);
      const light = (x + z) % 2 === 0;
      tiles.push(
        <mesh key={`${x}-${z}`} position={[wx, 0, wz]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[1, 1]} />
          <meshStandardMaterial color={light ? "#caa46e" : "#b8915c"} />
        </mesh>,
      );
    }
  }

  return (
    <group>
      {tiles}

      {/* subtle grid lines on top of the floor */}
      <gridHelper
        args={[Math.max(GRID_W, GRID_D), Math.max(GRID_W, GRID_D), "#8a6c44", "#9c7c52"]}
        position={[0, 0.011, 0]}
      />

      {/* back wall (along the far -Z edge) */}
      <mesh position={[0, WALL_H / 2, -HALF_D - WALL_T / 2]} castShadow receiveShadow>
        <boxGeometry args={[GRID_W + WALL_T * 2, WALL_H, WALL_T]} />
        <meshStandardMaterial color="#5f7d6e" />
      </mesh>

      {/* left wall (along the -X edge) */}
      <mesh position={[-HALF_W - WALL_T / 2, WALL_H / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[WALL_T, WALL_H, GRID_D]} />
        <meshStandardMaterial color="#54705f" />
      </mesh>

      {/* baseboards for a bit of depth */}
      <mesh position={[0, 0.08, -HALF_D - 0.01]}>
        <boxGeometry args={[GRID_W + WALL_T * 2, 0.16, 0.06]} />
        <meshStandardMaterial color="#3f5447" />
      </mesh>
      <mesh position={[-HALF_W - 0.01, 0.08, 0]}>
        <boxGeometry args={[0.06, 0.16, GRID_D]} />
        <meshStandardMaterial color="#3a4d41" />
      </mesh>
    </group>
  );
}
