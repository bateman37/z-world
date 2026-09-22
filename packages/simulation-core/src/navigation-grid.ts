import type { LocalSectorFixture, WorldPoint } from "@z-world/contracts";

/**
 * Rejilla técnica de navegación derivada de la geometría semántica del
 * fixture (§15.1 de WEB-001): estructura invisible, no la ontología del
 * mundo. Resolución provisional registrada en DEC-0014.
 */
export const NAVIGATION_RESOLUTION_METERS = 5;

export interface WalkabilityGrid {
  readonly resolutionMeters: number;
  readonly columns: number;
  readonly rows: number;
  readonly originX: number;
  readonly originY: number;
  readonly walkable: Uint8Array;
  readonly costMultiplier: Float32Array;
}

function pointInPolygon(point: WorldPoint, polygon: readonly WorldPoint[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const pi = polygon[i]!;
    const pj = polygon[j]!;
    const intersects =
      pi.y > point.y !== pj.y > point.y &&
      point.x < ((pj.x - pi.x) * (point.y - pi.y)) / (pj.y - pi.y) + pi.x;
    if (intersects) inside = !inside;
  }
  return inside;
}

/** Construye la rejilla de transitabilidad determinista a partir del fixture. */
export function buildWalkabilityGrid(
  fixture: LocalSectorFixture,
  resolutionMeters: number = NAVIGATION_RESOLUTION_METERS,
): WalkabilityGrid {
  const { bounds } = fixture;
  const columns = Math.max(1, Math.ceil((bounds.maxX - bounds.minX) / resolutionMeters));
  const rows = Math.max(1, Math.ceil((bounds.maxY - bounds.minY) / resolutionMeters));
  const walkable = new Uint8Array(columns * rows);
  const costMultiplier = new Float32Array(columns * rows).fill(1);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      const cellCenter: WorldPoint = {
        x: bounds.minX + (col + 0.5) * resolutionMeters,
        y: bounds.minY + (row + 0.5) * resolutionMeters,
      };
      const index = row * columns + col;

      let transitable = false;
      let cost = 1;
      for (const area of fixture.areas) {
        if (pointInPolygon(cellCenter, area.polygon)) {
          transitable = area.transitable;
          cost = area.traversalCostMultiplier;
        }
      }
      for (const structure of fixture.structures) {
        if (pointInPolygon(cellCenter, structure.footprint)) {
          transitable = false;
        }
      }

      walkable[index] = transitable ? 1 : 0;
      costMultiplier[index] = cost;
    }
  }

  return { resolutionMeters, columns, rows, originX: bounds.minX, originY: bounds.minY, walkable, costMultiplier };
}

export function worldToCell(
  grid: Pick<WalkabilityGrid, "originX" | "originY" | "resolutionMeters" | "columns" | "rows">,
  point: WorldPoint,
): { col: number; row: number } | null {
  const col = Math.floor((point.x - grid.originX) / grid.resolutionMeters);
  const row = Math.floor((point.y - grid.originY) / grid.resolutionMeters);
  if (col < 0 || row < 0 || col >= grid.columns || row >= grid.rows) return null;
  return { col, row };
}

export function cellToWorldCenter(
  grid: Pick<WalkabilityGrid, "originX" | "originY" | "resolutionMeters">,
  col: number,
  row: number,
): WorldPoint {
  return {
    x: grid.originX + (col + 0.5) * grid.resolutionMeters,
    y: grid.originY + (row + 0.5) * grid.resolutionMeters,
  };
}

export function isCellWalkable(grid: WalkabilityGrid, col: number, row: number): boolean {
  if (col < 0 || row < 0 || col >= grid.columns || row >= grid.rows) return false;
  return grid.walkable[row * grid.columns + col] === 1;
}
