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
              emissiveIntensity={0.9}
              side={2}
            />
          </mesh>
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

    case "sofa":
      return (
        <group>
          <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.8, 0.28, 0.8]} />
            <meshStandardMaterial color="#7c6f9c" />
          </mesh>
          <mesh position={[0, 0.5, -0.32]} castShadow>
            <boxGeometry args={[1.8, 0.5, 0.18]} />
            <meshStandardMaterial color="#6b5e8a" />
          </mesh>
          {[-0.86, 0.86].map((x, i) => (
            <mesh key={i} position={[x, 0.4, 0]} castShadow>
              <boxGeometry args={[0.16, 0.4, 0.8]} />
              <meshStandardMaterial color="#6b5e8a" />
            </mesh>
          ))}
          {[-0.45, 0.45].map((x, i) => (
            <mesh key={`c${i}`} position={[x, 0.42, 0.03]} castShadow>
              <boxGeometry args={[0.8, 0.12, 0.66]} />
              <meshStandardMaterial color="#8a7cad" />
            </mesh>
          ))}
        </group>
      );

    case "coffeetable":
      return (
        <group>
          <mesh position={[0, 0.36, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.9, 0.07, 0.6]} />
            <meshStandardMaterial color="#a07f52" />
          </mesh>
          {[
            [-0.38, -0.24],
            [0.38, -0.24],
            [-0.38, 0.24],
            [0.38, 0.24],
          ].map(([x, z], i) => (
            <mesh key={i} position={[x, 0.18, z]} castShadow>
              <boxGeometry args={[0.06, 0.36, 0.06]} />
              <meshStandardMaterial color="#6b5230" />
            </mesh>
          ))}
        </group>
      );

    case "floorlamp":
      return (
        <group>
          <mesh position={[0, 0.04, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.24, 0.08, 16]} />
            <meshStandardMaterial color="#3a3a3a" />
          </mesh>
          <mesh position={[0, 0.9, 0]} castShadow>
            <cylinderGeometry args={[0.025, 0.025, 1.7, 8]} />
            <meshStandardMaterial color="#5a5a5a" />
          </mesh>
          <mesh position={[0, 1.8, 0]} castShadow>
            <cylinderGeometry args={[0.22, 0.28, 0.3, 16, 1, true]} />
            <meshStandardMaterial color="#f0d98a" emissive="#f0d98a" emissiveIntensity={0.9} side={2} />
          </mesh>
        </group>
      );

    case "tallshelf":
      return (
        <group>
          <mesh position={[0, 1.0, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.9, 2.0, 0.4]} />
            <meshStandardMaterial color="#5a4a78" />
          </mesh>
          {[0.4, 0.85, 1.3, 1.75].map((y, row) =>
            [-0.3, -0.1, 0.12, 0.32].map((x, i) => (
              <mesh key={`${row}-${i}`} position={[x, y, 0.08]} castShadow>
                <boxGeometry args={[0.13, 0.3, 0.18]} />
                <meshStandardMaterial
                  color={["#d4564b", "#e8c15a", "#4d7d9c", "#3f8a4d", "#c77dd0"][(row + i) % 5]}
                />
              </mesh>
            )),
          )}
        </group>
      );

    case "clock":
      return (
        <group>
          <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.4, 1.8, 0.28]} />
            <meshStandardMaterial color="#7a5d3c" />
          </mesh>
          <mesh position={[0, 1.5, 0.16]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.15, 0.15, 0.03, 20]} />
            <meshStandardMaterial color="#f5f0e6" />
          </mesh>
          <mesh position={[0, 0.75, 0.15]}>
            <boxGeometry args={[0.18, 0.7, 0.02]} />
            <meshStandardMaterial color="#2b2b2b" />
          </mesh>
          <mesh position={[0, 0.55, 0.17]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 0.02, 16]} />
            <meshStandardMaterial color="#e8c15a" metalness={0.5} roughness={0.4} />
          </mesh>
        </group>
      );

    case "roundrug":
      return (
        <mesh position={[0, 0.02, 0]} receiveShadow>
          <cylinderGeometry args={[0.95, 0.95, 0.04, 32]} />
          <meshStandardMaterial color="#c77dd0" />
        </mesh>
      );

    case "cabinet":
      return (
        <group>
          <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.7, 1.1, 0.5]} />
            <meshStandardMaterial color="#7f929c" />
          </mesh>
          {[0.3, 0.62, 0.94].map((y, i) => (
            <group key={i}>
              <mesh position={[0, y, 0.26]}>
                <boxGeometry args={[0.6, 0.26, 0.02]} />
                <meshStandardMaterial color="#6d7f88" />
              </mesh>
              <mesh position={[0, y, 0.28]}>
                <boxGeometry args={[0.16, 0.03, 0.03]} />
                <meshStandardMaterial color="#3a4149" />
              </mesh>
            </group>
          ))}
        </group>
      );

    case "abacus":
      return (
        <group>
          <mesh position={[0, 0.02, 0]}>
            <boxGeometry args={[0.7, 0.04, 0.3]} />
            <meshStandardMaterial color="#6b4a2e" />
          </mesh>
          <mesh position={[0, 0.4, 0]} castShadow>
            <boxGeometry args={[0.7, 0.6, 0.06]} />
            <meshStandardMaterial color="#8a5a34" />
          </mesh>
          {[0.22, 0.37, 0.52].map((y, row) =>
            [-0.22, -0.07, 0.08, 0.23].map((x, i) => (
              <mesh key={`${row}-${i}`} position={[x, y, 0.06]}>
                <sphereGeometry args={[0.045, 10, 10]} />
                <meshStandardMaterial color={["#d4564b", "#e8c15a", "#2b2b2b"][row % 3]} />
              </mesh>
            )),
          )}
        </group>
      );

    case "ledger":
      return (
        <group>
          {[
            { c: "#4d7d9c", y: 0.1 },
            { c: "#b3473d", y: 0.24 },
            { c: "#3f8a4d", y: 0.38 },
          ].map((b, i) => (
            <mesh key={i} position={[-0.16, b.y, 0]} castShadow>
              <boxGeometry args={[0.4, 0.12, 0.5]} />
              <meshStandardMaterial color={b.c} />
            </mesh>
          ))}
          <mesh position={[0.28, 0.4, 0]} castShadow>
            <boxGeometry args={[0.5, 0.6, 0.03]} />
            <meshStandardMaterial color="#f5f0e6" />
          </mesh>
          <mesh position={[0.28, 0.34, 0.02]}>
            <boxGeometry args={[0.4, 0.03, 0.01]} />
            <meshStandardMaterial color="#d4564b" />
          </mesh>
          <mesh position={[0.28, 0.46, 0.02]}>
            <boxGeometry args={[0.3, 0.03, 0.01]} />
            <meshStandardMaterial color="#4d7d9c" />
          </mesh>
        </group>
      );

    case "bust":
      return (
        <group>
          <mesh position={[0, 0.3, 0]} castShadow>
            <boxGeometry args={[0.4, 0.6, 0.4]} />
            <meshStandardMaterial color="#b8ad98" />
          </mesh>
          <mesh position={[0, 0.72, 0]} castShadow>
            <cylinderGeometry args={[0.16, 0.22, 0.2, 16]} />
            <meshStandardMaterial color="#cfc6b6" />
          </mesh>
          <mesh position={[0, 0.95, 0]} castShadow>
            <sphereGeometry args={[0.18, 20, 20]} />
            <meshStandardMaterial color="#cfc6b6" />
          </mesh>
        </group>
      );

    case "scroll":
      return (
        <group>
          <mesh position={[0, 0.3, 0]} castShadow>
            <boxGeometry args={[0.6, 0.06, 0.4]} />
            <meshStandardMaterial color="#8a6d3b" />
          </mesh>
          {[
            [-0.25, -0.15],
            [0.25, -0.15],
            [-0.25, 0.15],
            [0.25, 0.15],
          ].map(([x, z], i) => (
            <mesh key={i} position={[x, 0.15, z]}>
              <boxGeometry args={[0.05, 0.3, 0.05]} />
              <meshStandardMaterial color="#6b5230" />
            </mesh>
          ))}
          <mesh position={[0, 0.4, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.08, 0.08, 0.5, 16]} />
            <meshStandardMaterial color="#d8c79a" />
          </mesh>
        </group>
      );

    case "cat":
      return (
        <group>
          <mesh position={[0, 0.16, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <capsuleGeometry args={[0.12, 0.24, 4, 8]} />
            <meshStandardMaterial color="#d69a5c" />
          </mesh>
          <mesh position={[0.22, 0.26, 0]} castShadow>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial color="#d69a5c" />
          </mesh>
          {[-0.06, 0.06].map((z, i) => (
            <mesh key={i} position={[0.26, 0.36, z]} castShadow>
              <coneGeometry args={[0.05, 0.1, 4]} />
              <meshStandardMaterial color="#c98a4c" />
            </mesh>
          ))}
          <mesh position={[-0.24, 0.24, 0]} rotation={[0, 0, 0.6]} castShadow>
            <capsuleGeometry args={[0.03, 0.22, 4, 8]} />
            <meshStandardMaterial color="#c98a4c" />
          </mesh>
        </group>
      );

    case "aquarium":
      return (
        <group>
          <mesh position={[0, 0.25, 0]} castShadow>
            <boxGeometry args={[1.5, 0.5, 0.6]} />
            <meshStandardMaterial color="#6b5230" />
          </mesh>
          <mesh position={[0, 0.85, 0]}>
            <boxGeometry args={[1.4, 0.6, 0.55]} />
            <meshStandardMaterial color="#9fd4e6" transparent opacity={0.3} />
          </mesh>
          <mesh position={[0, 0.8, 0]}>
            <boxGeometry args={[1.36, 0.48, 0.5]} />
            <meshStandardMaterial color="#4fa0c0" transparent opacity={0.55} />
          </mesh>
          {[
            { x: -0.3, y: 0.85, z: 0.1, c: "#e8894a" },
            { x: 0.25, y: 0.78, z: -0.1, c: "#e8c15a" },
          ].map((f, i) => (
            <mesh key={i} position={[f.x, f.y, f.z]}>
              <sphereGeometry args={[0.06, 10, 10]} />
              <meshStandardMaterial color={f.c} />
            </mesh>
          ))}
        </group>
      );

    case "bigplant":
      return (
        <group>
          <mesh position={[0, 0.28, 0]} castShadow>
            <cylinderGeometry args={[0.26, 0.32, 0.56, 16]} />
            <meshStandardMaterial color="#c97b4a" />
          </mesh>
          <mesh position={[0, 0.95, 0]} castShadow>
            <icosahedronGeometry args={[0.42, 0]} />
            <meshStandardMaterial color="#357031" flatShading />
          </mesh>
          <mesh position={[0.2, 1.25, 0.1]} castShadow>
            <icosahedronGeometry args={[0.3, 0]} />
            <meshStandardMaterial color="#3f8a4d" flatShading />
          </mesh>
          <mesh position={[-0.18, 1.35, -0.05]} castShadow>
            <icosahedronGeometry args={[0.26, 0]} />
            <meshStandardMaterial color="#2f6a2c" flatShading />
          </mesh>
        </group>
      );

    case "trophy":
      return (
        <group>
          <mesh position={[0, 0.1, 0]} castShadow>
            <boxGeometry args={[0.34, 0.2, 0.34]} />
            <meshStandardMaterial color="#5a4a34" />
          </mesh>
          <mesh position={[0, 0.32, 0]} castShadow>
            <cylinderGeometry args={[0.04, 0.07, 0.18, 12]} />
            <meshStandardMaterial color="#e8c15a" metalness={0.6} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.5, 0]} castShadow>
            <cylinderGeometry args={[0.16, 0.1, 0.22, 16]} />
            <meshStandardMaterial color="#f0d060" metalness={0.6} roughness={0.3} />
          </mesh>
          {[-0.16, 0.16].map((x, i) => (
            <mesh key={i} position={[x, 0.5, 0]}>
              <torusGeometry args={[0.06, 0.015, 8, 16]} />
              <meshStandardMaterial color="#e8c15a" metalness={0.6} roughness={0.3} />
            </mesh>
          ))}
        </group>
      );

    case "medalshelf":
      return (
        <group>
          <mesh position={[0, 0.7, 0]} castShadow>
            <boxGeometry args={[0.7, 0.5, 0.06]} />
            <meshStandardMaterial color="#5a4a34" />
          </mesh>
          {[-0.2, 0, 0.2].map((x, i) => (
            <group key={i} position={[x, 0.75, 0.05]}>
              <mesh position={[0, 0.12, 0]}>
                <boxGeometry args={[0.06, 0.16, 0.02]} />
                <meshStandardMaterial color={["#d4564b", "#4d7d9c", "#3f8a4d"][i]} />
              </mesh>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.08, 0.08, 0.02, 16]} />
                <meshStandardMaterial color="#e8c15a" metalness={0.5} roughness={0.4} />
              </mesh>
            </group>
          ))}
        </group>
      );

    default:
      return null;
  }
}
