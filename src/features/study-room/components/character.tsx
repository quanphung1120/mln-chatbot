"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { HALF_D, HALF_W } from "../geometry";

// ---------------------------------------------------------------------------
// The player avatar: a small stylised human with a proper rig. Hips and
// shoulders are pivot groups, so the legs and arms swing in a walk cycle while
// moving and settle into a gentle "breathing" idle when still.
//   Move with WASD / arrow keys.
// ---------------------------------------------------------------------------

const SPEED = 3.2; // world units per second
const MARGIN = 0.4; // keep the avatar inside the walls
const SKIN = "#e9b48c";
const SHIRT = "#c8533f";
const PANTS = "#36456b";

export function Character() {
  const root = useRef<THREE.Group>(null);
  const torso = useRef<THREE.Group>(null);
  const legL = useRef<THREE.Group>(null);
  const legR = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);

  const pos = useRef(new THREE.Vector3(0, 0, 2));
  const facing = useRef(0);
  const phase = useRef(0); // walk-cycle phase
  const swing = useRef(0); // 0 (idle) → 1 (walking), eased
  const keys = useRef<Record<string, boolean>>({});

  useEffect(() => {
    const move = ["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"];
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (move.includes(k)) keys.current[k] = true;
    };
    const up = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  useFrame((_, delta) => {
    const k = keys.current;
    let dx = 0;
    let dz = 0;
    if (k["w"] || k["arrowup"]) dz -= 1;
    if (k["s"] || k["arrowdown"]) dz += 1;
    if (k["a"] || k["arrowleft"]) dx -= 1;
    if (k["d"] || k["arrowright"]) dx += 1;
    const moving = dx !== 0 || dz !== 0;

    if (moving) {
      const len = Math.hypot(dx, dz);
      pos.current.x = THREE.MathUtils.clamp(
        pos.current.x + (dx / len) * SPEED * delta,
        -HALF_W + MARGIN,
        HALF_W - MARGIN,
      );
      pos.current.z = THREE.MathUtils.clamp(
        pos.current.z + (dz / len) * SPEED * delta,
        -HALF_D + MARGIN,
        HALF_D - MARGIN,
      );
      facing.current = Math.atan2(dx, dz);
      phase.current += delta * 9;
    }

    // ease the walk amount in/out
    swing.current += ((moving ? 1 : 0) - swing.current) * Math.min(1, delta * 10);

    if (root.current) {
      root.current.position.copy(pos.current);
      const cur = root.current.rotation.y;
      root.current.rotation.y = cur + (facing.current - cur) * Math.min(1, delta * 12);
    }

    const s = Math.sin(phase.current) * 0.6 * swing.current;
    if (legL.current) legL.current.rotation.x = s;
    if (legR.current) legR.current.rotation.x = -s;
    if (armL.current) armL.current.rotation.x = -s * 0.8;
    if (armR.current) armR.current.rotation.x = s * 0.8;

    if (torso.current) {
      const t = performance.now() / 1000;
      // bob while walking, breathe while idle
      torso.current.position.y = Math.abs(Math.sin(phase.current)) * 0.04 * swing.current;
      const breathe = 1 + Math.sin(t * 2) * 0.015 * (1 - swing.current);
      torso.current.scale.y = breathe;
    }
  });

  return (
    <group ref={root}>
      {/* legs (pivot at hips, y = 0.5) */}
      <group ref={legL} position={[-0.12, 0.5, 0]}>
        <mesh position={[0, -0.25, 0]} castShadow>
          <boxGeometry args={[0.15, 0.5, 0.17]} />
          <meshStandardMaterial color={PANTS} />
        </mesh>
        <mesh position={[0, -0.5, 0.04]} castShadow>
          <boxGeometry args={[0.16, 0.1, 0.26]} />
          <meshStandardMaterial color="#2b2b2b" />
        </mesh>
      </group>
      <group ref={legR} position={[0.12, 0.5, 0]}>
        <mesh position={[0, -0.25, 0]} castShadow>
          <boxGeometry args={[0.15, 0.5, 0.17]} />
          <meshStandardMaterial color={PANTS} />
        </mesh>
        <mesh position={[0, -0.5, 0.04]} castShadow>
          <boxGeometry args={[0.16, 0.1, 0.26]} />
          <meshStandardMaterial color="#2b2b2b" />
        </mesh>
      </group>

      {/* upper body (bobs / breathes) */}
      <group ref={torso}>
        {/* torso */}
        <mesh position={[0, 0.78, 0]} castShadow>
          <capsuleGeometry args={[0.21, 0.32, 6, 14]} />
          <meshStandardMaterial color={SHIRT} />
        </mesh>
        {/* belt */}
        <mesh position={[0, 0.55, 0]} castShadow>
          <boxGeometry args={[0.4, 0.07, 0.28]} />
          <meshStandardMaterial color="#3a2a1c" />
        </mesh>

        {/* arms (pivot at shoulders, y = 0.95) */}
        <group ref={armL} position={[-0.27, 0.95, 0]}>
          <mesh position={[0, -0.2, 0]} castShadow>
            <capsuleGeometry args={[0.065, 0.3, 4, 10]} />
            <meshStandardMaterial color={SHIRT} />
          </mesh>
          <mesh position={[0, -0.4, 0]} castShadow>
            <sphereGeometry args={[0.07, 12, 12]} />
            <meshStandardMaterial color={SKIN} />
          </mesh>
        </group>
        <group ref={armR} position={[0.27, 0.95, 0]}>
          <mesh position={[0, -0.2, 0]} castShadow>
            <capsuleGeometry args={[0.065, 0.3, 4, 10]} />
            <meshStandardMaterial color={SHIRT} />
          </mesh>
          <mesh position={[0, -0.4, 0]} castShadow>
            <sphereGeometry args={[0.07, 12, 12]} />
            <meshStandardMaterial color={SKIN} />
          </mesh>
        </group>

        {/* neck + head */}
        <mesh position={[0, 1.02, 0]} castShadow>
          <cylinderGeometry args={[0.07, 0.08, 0.1, 10]} />
          <meshStandardMaterial color={SKIN} />
        </mesh>
        <mesh position={[0, 1.2, 0]} castShadow>
          <sphereGeometry args={[0.2, 22, 22]} />
          <meshStandardMaterial color={SKIN} />
        </mesh>
        {/* hair cap */}
        <mesh position={[0, 1.26, -0.01]} castShadow>
          <sphereGeometry args={[0.215, 22, 22, 0, Math.PI * 2, 0, Math.PI / 1.8]} />
          <meshStandardMaterial color="#5a3a22" />
        </mesh>
        {/* eyes (front = +Z, the facing direction) */}
        <mesh position={[-0.07, 1.2, 0.18]}>
          <sphereGeometry args={[0.028, 10, 10]} />
          <meshStandardMaterial color="#221a14" />
        </mesh>
        <mesh position={[0.07, 1.2, 0.18]}>
          <sphereGeometry args={[0.028, 10, 10]} />
          <meshStandardMaterial color="#221a14" />
        </mesh>
      </group>
    </group>
  );
}
