"use client";

import { useRef, useState } from "react";
import { Canvas, type ThreeEvent } from "@react-three/fiber";
import { ContactShadows, OrbitControls, Sky } from "@react-three/drei";
import { GRID_D, GRID_W } from "../catalog";
import { worldToTile } from "../geometry";
import { useGameStore } from "../store";
import type { RoomTheme } from "../themes";
import { Room } from "./room";
import { Character } from "./character";
import { Furniture } from "./furniture";
import { Environment } from "./environment";

// ---------------------------------------------------------------------------
// The 3D world. A fixed, gently-orbitable isometric camera looks down on the
// room. In build mode an invisible floor plane translates cursor position into
// grid tiles for ghost preview + placement.
// ---------------------------------------------------------------------------

function World({ theme }: { theme: RoomTheme }) {
  const buildMode = useGameStore((s) => s.buildMode);
  const tryPlace = useGameStore((s) => s.tryPlace);
  const [ghost, setGhost] = useState<{ gridX: number; gridZ: number } | null>(null);
  const lastTile = useRef<string>("");

  const handleMove = (e: ThreeEvent<PointerEvent>) => {
    if (!buildMode) return;
    const { gridX, gridZ } = worldToTile(e.point.x, e.point.z);
    if (gridX < 0 || gridZ < 0 || gridX >= GRID_W || gridZ >= GRID_D) {
      if (ghost) setGhost(null);
      return;
    }
    const key = `${gridX},${gridZ}`;
    if (key !== lastTile.current) {
      lastTile.current = key;
      setGhost({ gridX, gridZ });
    }
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    if (!buildMode) return;
    const { gridX, gridZ } = worldToTile(e.point.x, e.point.z);
    tryPlace(gridX, gridZ);
  };

  return (
    <group>
      <hemisphereLight args={[theme.light.hemiSky, theme.light.hemiGround, theme.light.ambient + 0.5]} />
      <ambientLight intensity={theme.light.ambient} />
      <directionalLight
        position={theme.sky.sunPosition}
        intensity={theme.light.dirIntensity}
        color={theme.light.dirColor}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-16}
        shadow-camera-right={16}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
      />

      <Environment theme={theme} />
      <Room theme={theme} />
      <ContactShadows
        position={[0, 0.02, 0]}
        scale={GRID_W + 4}
        blur={2.4}
        opacity={0.35}
        far={5}
        resolution={512}
      />
      <Furniture ghost={ghost} />
      <Character />

      {/* transparent interaction plane for build mode (sits just above the floor).
          NOTE: it must stay `visible` — three.js skips invisible meshes when
          raycasting, which would swallow all pointer events. */}
      <mesh
        position={[0, 0.015, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerMove={handleMove}
        onClick={handleClick}
        onPointerLeave={() => setGhost(null)}
      >
        <planeGeometry args={[GRID_W, GRID_D]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

export default function Scene({ theme }: { theme: RoomTheme }) {
  return (
    <Canvas
      shadows="soft"
      dpr={[1, 2]}
      camera={{ position: [9, 10, 11], fov: 32 }}
      style={{ width: "100%", height: "100%" }}
    >
      <color attach="background" args={[theme.bg]} />
      <fog attach="fog" args={theme.fog} />
      <Sky
        sunPosition={theme.sky.sunPosition}
        turbidity={theme.sky.turbidity}
        rayleigh={theme.sky.rayleigh}
        mieCoefficient={theme.sky.mieCoefficient}
      />
      <World theme={theme} />
      <OrbitControls
        makeDefault
        enablePan={false}
        target={[0, 0.5, 0]}
        minPolarAngle={0.25}
        maxPolarAngle={1.15}
        minDistance={8}
        maxDistance={22}
      />
    </Canvas>
  );
}
