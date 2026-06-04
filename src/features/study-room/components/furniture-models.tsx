"use client";

import type { ItemType } from "../catalog";

// ---------------------------------------------------------------------------
// Stylised low-poly furniture, built entirely from primitives so the game
// needs no downloaded 3D assets. Each model is centred on the origin of its
// (un-rotated) footprint, with its base sitting on y = 0.
// ---------------------------------------------------------------------------

export function FurnitureModel({ type }: { type: ItemType }) {
  switch (type) {
    case "rug":
      return (
        <mesh position={[0, 0.02, 0]} receiveShadow>
          <boxGeometry args={[1.9, 0.04, 1.9]} />
          <meshStandardMaterial color="#b45f52" />
        </mesh>
      );

    case "plant":
      return (
        <group>
          <mesh position={[0, 0.18, 0]} castShadow>
            <cylinderGeometry args={[0.16, 0.22, 0.36, 12]} />
            <meshStandardMaterial color="#c97b4a" />
          </mesh>
          <mesh position={[0, 0.55, 0]} castShadow>
            <icosahedronGeometry args={[0.3, 0]} />
            <meshStandardMaterial color="#3f8a4d" flatShading />
          </mesh>
          <mesh position={[0.12, 0.72, 0.05]} castShadow>
            <icosahedronGeometry args={[0.18, 0]} />
            <meshStandardMaterial color="#4fa05c" flatShading />
          </mesh>
        </group>
      );

    case "chair":
      return (
        <group>
          <mesh position={[0, 0.32, 0]} castShadow>
            <boxGeometry args={[0.5, 0.08, 0.5]} />
            <meshStandardMaterial color="#8a6d3b" />
          </mesh>
          <mesh position={[0, 0.58, -0.21]} castShadow>
            <boxGeometry args={[0.5, 0.5, 0.08]} />
            <meshStandardMaterial color="#9c7a4d" />
          </mesh>
          {[
            [-0.2, -0.2],
            [0.2, -0.2],
            [-0.2, 0.2],
            [0.2, 0.2],
          ].map(([x, z], i) => (
            <mesh key={i} position={[x, 0.14, z]} castShadow>
              <boxGeometry args={[0.06, 0.28, 0.06]} />
              <meshStandardMaterial color="#6b5230" />
            </mesh>
          ))}
        </group>
      );

    case "lamp":
      return (
        <group>
          <mesh position={[0, 0.04, 0]} castShadow>
            <cylinderGeometry args={[0.22, 0.26, 0.08, 16]} />
            <meshStandardMaterial color="#3a3a3a" />
          </mesh>
          <mesh position={[0, 0.6, 0]} castShadow>
            <cylinderGeometry args={[0.03, 0.03, 1.1, 8]} />
            <meshStandardMaterial color="#5a5a5a" />
          </mesh>
          <mesh position={[0, 1.18, 0]} castShadow>
            <coneGeometry args={[0.28, 0.32, 16, 1, true]} />
            <meshStandardMaterial
              color="#e8c15a"
              emissive="#e8c15a"
              emissiveIntensity={0.6}
              side={2}
            />
          </mesh>
          <pointLight position={[0, 1.05, 0]} intensity={6} distance={4} color="#ffe6a8" />
        </group>
      );

    case "desk":
      return (
        <group>
          <mesh position={[0, 0.74, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.85, 0.08, 0.85]} />
            <meshStandardMaterial color="#9c7a4d" />
          </mesh>
          {[
            [-0.85, -0.35],
            [0.85, -0.35],
            [-0.85, 0.35],
            [0.85, 0.35],
          ].map(([x, z], i) => (
            <mesh key={i} position={[x, 0.36, z]} castShadow>
              <boxGeometry args={[0.08, 0.72, 0.08]} />
              <meshStandardMaterial color="#6b5230" />
            </mesh>
          ))}
          {/* a couple of books + a mug on top */}
          <mesh position={[-0.55, 0.83, 0]} castShadow>
            <boxGeometry args={[0.3, 0.1, 0.4]} />
            <meshStandardMaterial color="#b3473d" />
          </mesh>
          <mesh position={[0.5, 0.84, 0.1]} castShadow>
            <cylinderGeometry args={[0.07, 0.07, 0.12, 12]} />
            <meshStandardMaterial color="#dddddd" />
          </mesh>
        </group>
      );

    case "bookshelf":
      return (
        <group>
          <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.85, 1.4, 0.4]} />
            <meshStandardMaterial color="#6b4f8a" />
          </mesh>
          {[0.35, 0.75, 1.15].map((y, row) =>
            [-0.28, -0.08, 0.12, 0.3].map((x, i) => (
              <mesh key={`${row}-${i}`} position={[x, y, 0.08]} castShadow>
                <boxGeometry args={[0.12, 0.28, 0.18]} />
                <meshStandardMaterial
                  color={["#d4564b", "#e8c15a", "#4d7d9c", "#3f8a4d"][(row + i) % 4]}
                />
              </mesh>
            )),
          )}
        </group>
      );

    case "globe":
      return (
        <group>
          <mesh position={[0, 0.18, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.12, 0.36, 10]} />
            <meshStandardMaterial color="#6b5230" />
          </mesh>
          <mesh position={[0, 0.52, 0]} castShadow rotation={[0.4, 0, 0.2]}>
            <sphereGeometry args={[0.26, 20, 20]} />
            <meshStandardMaterial color="#4d7d9c" />
          </mesh>
        </group>
      );

    case "bed":
      return (
        <group>
          {/* frame: 2 wide x 3 deep */}
          <mesh position={[0, 0.18, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.9, 0.3, 2.9]} />
            <meshStandardMaterial color="#6b5230" />
          </mesh>
          {/* mattress */}
          <mesh position={[0, 0.42, 0.1]} castShadow>
            <boxGeometry args={[1.74, 0.2, 2.5]} />
            <meshStandardMaterial color="#5a7da8" />
          </mesh>
          {/* pillow */}
          <mesh position={[0, 0.56, -1.0]} castShadow>
            <boxGeometry args={[1.5, 0.16, 0.5]} />
            <meshStandardMaterial color="#eef2f7" />
          </mesh>
          {/* headboard */}
          <mesh position={[0, 0.6, -1.4]} castShadow>
            <boxGeometry args={[1.9, 0.7, 0.12]} />
            <meshStandardMaterial color="#574326" />
          </mesh>
        </group>
      );

    default:
      return null;
  }
}
