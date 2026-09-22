import type { FogGrid, LocalSectorFixture, WorldPoint } from "@z-world/contracts";
import { fogCellIndex } from "@z-world/contracts";

/**
 * Radio de observación provisional, común a todos los protagonistas
 * (§14 de WEB-001). Valor técnico centralizado, registrado en DEC-0014.
 */
export const OBSERVATION_RADIUS_METERS = 25;
export const FOG_RESOLUTION_METERS = 5;

export function createInitialFogGrid(fixture: LocalSectorFixture, resolutionMeters: number = FOG_RESOLUTION_METERS): FogGrid {
  const { bounds } = fixture;
  const columns = Math.max(1, Math.ceil((bounds.maxX - bounds.minX) / resolutionMeters));
  const rows = Math.max(1, Math.ceil((bounds.maxY - bounds.minY) / resolutionMeters));
  return {
    resolutionMeters,
    columns,
    rows,
    originX: bounds.minX,
    originY: bounds.minY,
    cells: new Array(columns * rows).fill(0),
  };
}

/**
 * Recalcula la niebla a partir de las posiciones actuales de observación.
 * Determinista: mismas posiciones y radio producen la misma máscara.
 * Celdas antes `observable` que dejan de estarlo pasan a `known` (nunca
 * retroceden a `hidden`).
 */
export function revealAroundObservers(
  grid: FogGrid,
  observerPositions: readonly WorldPoint[],
  radiusMeters: number = OBSERVATION_RADIUS_METERS,
): FogGrid {
  const cells = grid.cells.slice();
  const radiusInCells = Math.ceil(radiusMeters / grid.resolutionMeters);

  for (let i = 0; i < cells.length; i++) {
    if (cells[i] === 2) cells[i] = 1;
  }

  for (const observer of observerPositions) {
    const observerCol = Math.floor((observer.x - grid.originX) / grid.resolutionMeters);
    const observerRow = Math.floor((observer.y - grid.originY) / grid.resolutionMeters);

    for (let dRow = -radiusInCells; dRow <= radiusInCells; dRow++) {
      const row = observerRow + dRow;
      if (row < 0 || row >= grid.rows) continue;
      for (let dCol = -radiusInCells; dCol <= radiusInCells; dCol++) {
        const col = observerCol + dCol;
        if (col < 0 || col >= grid.columns) continue;

        const cellCenterX = grid.originX + (col + 0.5) * grid.resolutionMeters;
        const cellCenterY = grid.originY + (row + 0.5) * grid.resolutionMeters;
        const distance = Math.hypot(cellCenterX - observer.x, cellCenterY - observer.y);
        if (distance <= radiusMeters) {
          cells[fogCellIndex(grid, col, row)] = 2;
        }
      }
    }
  }

  return { ...grid, cells };
}
