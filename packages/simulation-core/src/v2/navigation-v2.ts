import { valuesById } from "./ordered.js";
import type { SemanticWorldV2, WorldPoint } from "@z-world/contracts";

/**
 * Rejilla técnica de navegación exterior sobre el mundo semántico V2 (S3 de
 * WEB-002 §5.4). Misma resolución provisional que V1 (DEC-0014); a
 * diferencia de la rejilla V1, esta se acelera con cajas alineadas a ejes
 * por entidad (el mundo semántico cubre ~9 km², no ~0,09 km²) para evitar
 * una regresión de rendimiento evidente.
 */
export const NAVIGATION_RESOLUTION_METERS_V2 = 5;
export const ROAD_COST_MULTIPLIER = 0.6;

export interface WalkabilityGridV2 {
  readonly resolutionMeters: number;
  readonly columns: number;
  readonly rows: number;
  readonly originX: number;
  readonly originY: number;
  readonly walkable: Uint8Array;
  readonly costMultiplier: Float32Array;
  /**
   * Superficie de cada celda (S8, derivada y nunca persistida): permite que
   * carretilla y carro reaccionen al terreno real (SET-010 §3.6). Ver
   * `SURFACE_CODE`.
   */
  readonly surface: Uint8Array;
}

/** Códigos de `WalkabilityGridV2.surface`: tierra (por defecto), carretera firme, vegetación densa/bosque, otro (agua/obstáculo). */
export const SURFACE_CODE = { open_ground: 0, road: 1, dense_vegetation: 2, other: 3 } as const;

export function surfaceKindAt(grid: WalkabilityGridV2, index: number): "road" | "open_ground" | "dense_vegetation" {
  const code = grid.surface[index] ?? SURFACE_CODE.open_ground;
  if (code === SURFACE_CODE.road) return "road";
  if (code === SURFACE_CODE.dense_vegetation) return "dense_vegetation";
  return "open_ground";
}

function pointInPolygon(point: WorldPoint, polygon: readonly WorldPoint[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const pi = polygon[i]!;
    const pj = polygon[j]!;
    const intersects =
      pi.y > point.y !== pj.y > point.y && point.x < ((pj.x - pi.x) * (point.y - pi.y)) / (pj.y - pi.y) + pi.x;
    if (intersects) inside = !inside;
  }
  return inside;
}

function boundsOf(polygon: readonly WorldPoint[]): { minX: number; minY: number; maxX: number; maxY: number } {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of polygon) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  return { minX, minY, maxX, maxY };
}

function cellRangeForBounds(
  bounds: { minX: number; minY: number; maxX: number; maxY: number },
  grid: Pick<WalkabilityGridV2, "originX" | "originY" | "resolutionMeters" | "columns" | "rows">,
  paddingMeters = 0,
): { colStart: number; colEnd: number; rowStart: number; rowEnd: number } {
  const colStart = Math.max(0, Math.floor((bounds.minX - paddingMeters - grid.originX) / grid.resolutionMeters));
  const colEnd = Math.min(
    grid.columns - 1,
    Math.ceil((bounds.maxX + paddingMeters - grid.originX) / grid.resolutionMeters),
  );
  const rowStart = Math.max(0, Math.floor((bounds.minY - paddingMeters - grid.originY) / grid.resolutionMeters));
  const rowEnd = Math.min(
    grid.rows - 1,
    Math.ceil((bounds.maxY + paddingMeters - grid.originY) / grid.resolutionMeters),
  );
  return { colStart, colEnd, rowStart, rowEnd };
}

function distanceToSegment(p: WorldPoint, a: WorldPoint, b: WorldPoint): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared === 0) return Math.hypot(p.x - a.x, p.y - a.y);
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lengthSquared;
  t = Math.max(0, Math.min(1, t));
  const projX = a.x + t * dx;
  const projY = a.y + t * dy;
  return Math.hypot(p.x - projX, p.y - projY);
}

/**
 * Construye la rejilla de transitabilidad exterior a partir del mundo
 * semántico V2: terreno con su propio `transitable`/`traversalCostMultiplier`,
 * vías (carreteras transitables con coste reducido, cursos de agua
 * infranqueables) y las huellas de los edificios (siempre bloquean; la
 * entrada real ocurre por el grafo de accesos, no por la rejilla).
 */
export function buildWalkabilityGridV2(
  world: SemanticWorldV2,
  resolutionMeters: number = NAVIGATION_RESOLUTION_METERS_V2,
): WalkabilityGridV2 {
  const { bounds } = world;
  const columns = Math.max(1, Math.ceil((bounds.maxX - bounds.minX) / resolutionMeters));
  const rows = Math.max(1, Math.ceil((bounds.maxY - bounds.minY) / resolutionMeters));
  const walkable = new Uint8Array(columns * rows);
  const costMultiplier = new Float32Array(columns * rows).fill(1);
  const surface = new Uint8Array(columns * rows);
  const grid: WalkabilityGridV2 = { resolutionMeters, columns, rows, originX: bounds.minX, originY: bounds.minY, walkable, costMultiplier, surface };

  for (const area of valuesById(world.terrainAreas)) {
    const areaBounds = boundsOf(area.polygon);
    const { colStart, colEnd, rowStart, rowEnd } = cellRangeForBounds(areaBounds, grid);
    for (let row = rowStart; row <= rowEnd; row++) {
      for (let col = colStart; col <= colEnd; col++) {
        const cellCenter: WorldPoint = {
          x: grid.originX + (col + 0.5) * resolutionMeters,
          y: grid.originY + (row + 0.5) * resolutionMeters,
        };
        if (!pointInPolygon(cellCenter, area.polygon)) continue;
        const index = row * columns + col;
        walkable[index] = area.transitable ? 1 : 0;
        costMultiplier[index] = area.traversalCostMultiplier;
        surface[index] = area.kind === "open_ground" ? SURFACE_CODE.open_ground : area.kind === "dense_vegetation" ? SURFACE_CODE.dense_vegetation : SURFACE_CODE.other;
      }
    }
  }

  for (const line of valuesById(world.linearFeatures)) {
    const halfWidth = Math.max(1, line.widthMeters / 2);
    const linePoints = line.polyline;
    let lineMinX = Infinity;
    let lineMinY = Infinity;
    let lineMaxX = -Infinity;
    let lineMaxY = -Infinity;
    for (const p of linePoints) {
      lineMinX = Math.min(lineMinX, p.x);
      lineMinY = Math.min(lineMinY, p.y);
      lineMaxX = Math.max(lineMaxX, p.x);
      lineMaxY = Math.max(lineMaxY, p.y);
    }
    const { colStart, colEnd, rowStart, rowEnd } = cellRangeForBounds(
      { minX: lineMinX, minY: lineMinY, maxX: lineMaxX, maxY: lineMaxY },
      grid,
      halfWidth,
    );

    const isRoad = line.kind === "road" && line.wayState !== "obstructed";
    const isWater = line.kind === "watercourse";
    if (!isRoad && !isWater) continue;

    for (let row = rowStart; row <= rowEnd; row++) {
      for (let col = colStart; col <= colEnd; col++) {
        const cellCenter: WorldPoint = {
          x: grid.originX + (col + 0.5) * resolutionMeters,
          y: grid.originY + (row + 0.5) * resolutionMeters,
        };
        let onLine = false;
        for (let i = 1; i < linePoints.length; i++) {
          if (distanceToSegment(cellCenter, linePoints[i - 1]!, linePoints[i]!) <= halfWidth) {
            onLine = true;
            break;
          }
        }
        if (!onLine) continue;
        const index = row * columns + col;
        if (isWater) {
          walkable[index] = 0;
        } else {
          walkable[index] = 1;
          costMultiplier[index] = Math.min(costMultiplier[index] ?? 1, ROAD_COST_MULTIPLIER);
          surface[index] = SURFACE_CODE.road;
        }
      }
    }
  }

  for (const building of valuesById(world.buildings)) {
    const buildingBounds = boundsOf(building.footprint);
    const { colStart, colEnd, rowStart, rowEnd } = cellRangeForBounds(buildingBounds, grid);
    for (let row = rowStart; row <= rowEnd; row++) {
      for (let col = colStart; col <= colEnd; col++) {
        const cellCenter: WorldPoint = {
          x: grid.originX + (col + 0.5) * resolutionMeters,
          y: grid.originY + (row + 0.5) * resolutionMeters,
        };
        if (!pointInPolygon(cellCenter, building.footprint)) continue;
        walkable[row * columns + col] = 0;
      }
    }
  }

  return grid;
}

export function worldToCellV2(
  grid: Pick<WalkabilityGridV2, "originX" | "originY" | "resolutionMeters" | "columns" | "rows">,
  point: WorldPoint,
): { col: number; row: number } | null {
  const col = Math.floor((point.x - grid.originX) / grid.resolutionMeters);
  const row = Math.floor((point.y - grid.originY) / grid.resolutionMeters);
  if (col < 0 || row < 0 || col >= grid.columns || row >= grid.rows) return null;
  return { col, row };
}

export function cellToWorldCenterV2(
  grid: Pick<WalkabilityGridV2, "originX" | "originY" | "resolutionMeters">,
  col: number,
  row: number,
): WorldPoint {
  return {
    x: grid.originX + (col + 0.5) * grid.resolutionMeters,
    y: grid.originY + (row + 0.5) * grid.resolutionMeters,
  };
}

export function isCellWalkableV2(grid: WalkabilityGridV2, col: number, row: number): boolean {
  if (col < 0 || row < 0 || col >= grid.columns || row >= grid.rows) return false;
  return grid.walkable[row * grid.columns + col] === 1;
}

/** Busca la celda transitable más próxima a un punto (radios crecientes), para anclar un punto exterior cercano a una entidad (p. ej. una abertura) a la rejilla. */
export function nearestWalkableCellV2(grid: WalkabilityGridV2, point: WorldPoint, maxRadiusCells = 6): { col: number; row: number } | null {
  const origin = worldToCellV2(grid, point);
  if (!origin) return null;
  if (isCellWalkableV2(grid, origin.col, origin.row)) return origin;
  for (let radius = 1; radius <= maxRadiusCells; radius++) {
    for (let dRow = -radius; dRow <= radius; dRow++) {
      for (let dCol = -radius; dCol <= radius; dCol++) {
        if (Math.max(Math.abs(dRow), Math.abs(dCol)) !== radius) continue;
        const col = origin.col + dCol;
        const row = origin.row + dRow;
        if (isCellWalkableV2(grid, col, row)) return { col, row };
      }
    }
  }
  return null;
}
