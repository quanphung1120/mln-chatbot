"use client";

import { CATALOG_BY_TYPE } from "../catalog";
import { footprintCenter, tileCenter } from "../geometry";
import { canPlace, tilesFor, useGameStore } from "../store";
import { FurnitureModel } from "./furniture-models";

// ---------------------------------------------------------------------------
// Renders every placed item, plus (in build mode) a ghost preview of the
// selected item under the cursor, tinted green/red for valid/invalid.
// ---------------------------------------------------------------------------

export function Furniture({ ghost }: { ghost: { gridX: number; gridZ: number } | null }) {
  const placements = useGameStore((s) => s.placements);
  const buildMode = useGameStore((s) => s.buildMode);
  const selectedType = useGameStore((s) => s.selectedType);
  const ghostRot = useGameStore((s) => s.ghostRot);
  const coins = useGameStore((s) => s.coins);
  const removePlacement = useGameStore((s) => s.removePlacement);

  // Validity of the current ghost placement.
  let ghostValid = false;
  let ghostTiles: { x: number; z: number }[] = [];
  if (buildMode && selectedType && ghost) {
    const affordable = coins >= CATALOG_BY_TYPE[selectedType].price;
    ghostValid =
      affordable && canPlace(placements, selectedType, ghost.gridX, ghost.gridZ, ghostRot);
    ghostTiles = tilesFor(selectedType, ghost.gridX, ghost.gridZ, ghostRot);
  }

  return (
    <group>
      {placements.map((p) => {
        const [cx, cz] = footprintCenter(p.type, p.gridX, p.gridZ, p.rot);
        return (
          <group
            key={p.id}
            position={[cx, 0, cz]}
            rotation={[0, (p.rot * Math.PI) / 2, 0]}
            onClick={(e) => {
              if (!buildMode) return;
              e.stopPropagation();
              removePlacement(p.id);
            }}
          >
            <FurnitureModel type={p.type} />
          </group>
        );
      })}

      {/* ghost preview */}
      {buildMode && selectedType && ghost && (
        <group>
          {ghostTiles.map((t, i) => {
            const [wx, wz] = tileCenter(t.x, t.z);
            return (
              <mesh key={i} position={[wx, 0.03, wz]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.96, 0.96]} />
                <meshStandardMaterial
                  color={ghostValid ? "#4ade80" : "#ef4444"}
                  transparent
                  opacity={0.5}
                />
              </mesh>
            );
          })}
          <group
            position={[
              footprintCenter(selectedType, ghost.gridX, ghost.gridZ, ghostRot)[0],
              0.04,
              footprintCenter(selectedType, ghost.gridX, ghost.gridZ, ghostRot)[1],
            ]}
            rotation={[0, (ghostRot * Math.PI) / 2, 0]}
          >
            <FurnitureModel type={selectedType} />
          </group>
        </group>
      )}
    </group>
  );
}
