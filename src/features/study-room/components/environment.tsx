"use client";

// ---------------------------------------------------------------------------
// The cozy garden surroundings (inspired by the reference image): a grass field
// with scattered trees, bushes, a flower bed and a little wooden fence, framing
// the open side of the room. Everything is low-poly primitives.
// ---------------------------------------------------------------------------

function Tree({
  position,
  scale = 1,
}: {
  position: [number, number, number];
  scale?: number;
}) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.24, 1.2, 8]} />
        <meshStandardMaterial color="#6b4a2e" />
      </mesh>
      <mesh position={[0, 1.5, 0]} castShadow>
        <icosahedronGeometry args={[0.9, 0]} />
        <meshStandardMaterial color="#3f7d3a" flatShading />
      </mesh>
      <mesh position={[0.45, 1.9, 0.2]} castShadow>
        <icosahedronGeometry args={[0.6, 0]} />
        <meshStandardMaterial color="#4c9145" flatShading />
      </mesh>
      <mesh position={[-0.4, 2.0, -0.1]} castShadow>
        <icosahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial color="#357031" flatShading />
      </mesh>
    </group>
  );
}

function Bush({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position} castShadow>
      <icosahedronGeometry args={[0.45, 0]} />
      <meshStandardMaterial color="#447a3b" flatShading />
    </mesh>
  );
}

function Flower({
  position,
  color,
}: {
  position: [number, number, number];
  color: string;
}) {
  return (
    <group position={position}>
      <mesh position={[0, 0.13, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.26, 5]} />
        <meshStandardMaterial color="#3f8a4d" />
      </mesh>
      <mesh position={[0, 0.28, 0]} castShadow>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

// Deterministic placements so the scene is stable between renders.
const TREES: [number, number, number][] = [
  [-7.5, 0, -7], [8.5, 0, -6.5], [-6.5, 0, 8.5], [9.5, 0, 9],
  [7.5, 0, 2.5], [2, 0, 9], [-8.5, 0, 3], [11, 0, -2.5],
];
const TREE_SCALES = [1, 0.85, 1.1, 0.9, 0.8, 1.05, 0.95, 1.15];

const BUSHES: [number, number, number][] = [
  [6.2, 0.3, -2], [6.5, 0.3, 5.5], [-2, 0.3, 6.4], [4.5, 0.3, 7.2],
  [-5.5, 0.3, 6.5], [7.8, 0.3, -4], [-6.6, 0.3, -2.5],
];

const FLOWER_COLORS = ["#5b8dd6", "#e8c15a", "#d4564b", "#c77dd0", "#5b8dd6"];
const FLOWERS: [number, number, number][] = [];
for (let i = 0; i < 7; i++) {
  for (let j = 0; j < 4; j++) {
    // flower bed in the open +X / +Z garden corner
    FLOWERS.push([6 + i * 0.7 + (j % 2) * 0.3, 0, 6 + j * 0.7 + (i % 2) * 0.25]);
  }
}

function Fence() {
  const posts: React.ReactElement[] = [];
  // run along the far garden edges
  for (let i = 0; i <= 14; i++) {
    const t = -6 + i;
    posts.push(
      <mesh key={`x${i}`} position={[t, 0.4, 12]} castShadow>
        <boxGeometry args={[0.12, 0.8, 0.12]} />
        <meshStandardMaterial color="#8a6a44" />
      </mesh>,
    );
    posts.push(
      <mesh key={`z${i}`} position={[12, 0.4, t]} castShadow>
        <boxGeometry args={[0.12, 0.8, 0.12]} />
        <meshStandardMaterial color="#8a6a44" />
      </mesh>,
    );
  }
  return (
    <group>
      {posts}
      {/* rails */}
      <mesh position={[5, 0.55, 12]}>
        <boxGeometry args={[14, 0.08, 0.06]} />
        <meshStandardMaterial color="#7a5d3c" />
      </mesh>
      <mesh position={[12, 0.55, 5]}>
        <boxGeometry args={[0.06, 0.08, 14]} />
        <meshStandardMaterial color="#7a5d3c" />
      </mesh>
    </group>
  );
}

export function Environment() {
  return (
    <group>
      {/* grass field beneath and around the room */}
      <mesh position={[2.5, -0.03, 2.5]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#6aa84f" />
      </mesh>
      {/* a darker grass patch for variation */}
      <mesh position={[9, -0.02, 9]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[10, 32]} />
        <meshStandardMaterial color="#5e9a45" />
      </mesh>

      {TREES.map((p, i) => (
        <Tree key={i} position={p} scale={TREE_SCALES[i]} />
      ))}
      {BUSHES.map((p, i) => (
        <Bush key={i} position={p} />
      ))}
      {FLOWERS.map((p, i) => (
        <Flower key={i} position={p} color={FLOWER_COLORS[i % FLOWER_COLORS.length]} />
      ))}
      <Fence />
    </group>
  );
}
