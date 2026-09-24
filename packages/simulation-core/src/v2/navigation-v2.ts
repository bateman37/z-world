import { valuesById } from "./ordered.js";
import { effectiveTerrainCoverage, type SemanticWorldV2, type WorldPoint } from "@z-world/contracts";

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

/** Códigos de `WalkabilityGridV2.surface`: tierra (por defecto), carretera firme, vegetación densa/bosque, otro (agua/obstáculo) y escombros de una demolición (S9). */
export const SURFACE_CODE = { open_ground: 0, road: 1, dense_vegetation: 2, other: 3, rubble: 4 } as const;

export type ExteriorSurfaceKind = "road" | "open_ground" | "dense_vegetation" | "rubble";

export function surfaceKindAt(grid: WalkabilityGridV2, index: number): ExteriorSurfaceKind {
  const code = grid.surface[index] ?? SURFACE_CODE.open_ground;
  if (code === SURFACE_CODE.road) return "road";
  if (code === SURFACE_CODE.dense_vegetation) return "dense_vegetation";
  if (code === SURFACE_CODE.rubble) return "rubble";
  return "open_ground";
}

/**
 * Coste de caminar sobre la huella de un edificio que ya no existe como
 * tal (S9): los escombros de una demolición son transitables pero lentos;
 * un solar desmantelado queda como terreno despejado.
 */
export const RUBBLE_COST_MULTIPLIER = 2.2;
export const CLEARED_SITE_COST_MULTIPLIER = 1.2;
/** Coste añadido de una zona de fondo con escombros ligeros sin despejar (S10, WLD-010 §3.5): más lento que tierra despejada, muy por debajo de un obstáculo real. */
export const DEBRIS_COVERAGE_COST_MULTIPLIER = 1.4;
/**
 * Coste de un tramo de carretera obstruido (S10, WLD-010 §3.7): "restringe
 * o encarece el paso" sin eliminarlo — una aproximación conservadora
 * documentada, ya que el modelo actual no distingue todavía obstáculos
 * parciales de un bloqueo total. Reutiliza el código de superficie de
 * vegetación densa (ninguna superficie dedicada existe aún para vías
 * obstruidas): el tránsito es posible pero penalizado, nunca gratuito.
 */
export const OBSTRUCTED_ROAD_COST_MULTIPLIER = 2.0;

/** Punto de intersección entre el segmento `a`-`b` y una polilínea, o `null` si no se cruzan (S10, cruce de barrera con vía). */
function segmentIntersection(a: WorldPoint, b: WorldPoint, polyline: readonly WorldPoint[] | undefined): WorldPoint | null {
  if (!polyline) return null;
  for (let i = 1; i < polyline.length; i++) {
    const c = polyline[i - 1]!;
    const d = polyline[i]!;
    const denom = (b.x - a.x) * (d.y - c.y) - (b.y - a.y) * (d.x - c.x);
    if (Math.abs(denom) < 1e-9) continue;
    const t = ((c.x - a.x) * (d.y - c.y) - (c.y - a.y) * (d.x - c.x)) / denom;
    const u = ((c.x - a.x) * (b.y - a.y) - (c.y - a.y) * (b.x - a.x)) / denom;
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) return { x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y) };
  }
  return null;
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

/** Región rectangular de celdas `[colStart..colEnd] × [rowStart..rowEnd]` (inclusiva). */
export interface GridCellRegion {
  readonly colStart: number;
  readonly colEnd: number;
  readonly rowStart: number;
  readonly rowEnd: number;
}

function intersectRegion(a: GridCellRegion, b: GridCellRegion | null): GridCellRegion | null {
  if (!b) return a;
  const region = { colStart: Math.max(a.colStart, b.colStart), colEnd: Math.min(a.colEnd, b.colEnd), rowStart: Math.max(a.rowStart, b.rowStart), rowEnd: Math.min(a.rowEnd, b.rowEnd) };
  return region.colStart > region.colEnd || region.rowStart > region.rowEnd ? null : region;
}

/** Estado estructural terminal de un edificio (S9) visto desde la rejilla: la huella deja de bloquear. */
function terminalFootprintState(world: SemanticWorldV2, buildingId: string): "demolished" | "dismantled" | null {
  const state = world.buildingFabrics?.[buildingId]?.structureState;
  return state === "demolished" || state === "dismantled" ? state : null;
}

/**
 * Rasteriza el mundo sobre `grid` (terreno → vías → huellas), limitado a
 * `region` si se indica. Las mismas entidades en el mismo orden estable
 * escriben las mismas celdas, así que rasterizar solo una región produce
 * exactamente lo mismo que reconstruir la rejilla entera (invalidación
 * dirigida de S9, verificada por prueba de equivalencia).
 */
function rasterizeWorld(world: SemanticWorldV2, grid: WalkabilityGridV2, region: GridCellRegion | null): void {
  const { columns, resolutionMeters } = grid;
  const { walkable, costMultiplier, surface } = grid;
  if (region) {
    for (let row = region.rowStart; row <= region.rowEnd; row++) {
      for (let col = region.colStart; col <= region.colEnd; col++) {
        const index = row * columns + col;
        walkable[index] = 0;
        costMultiplier[index] = 1;
        surface[index] = SURFACE_CODE.open_ground;
      }
    }
  }

  for (const area of valuesById(world.terrainAreas)) {
    const range = intersectRegion(cellRangeForBounds(boundsOf(area.polygon), grid), region);
    if (!range) continue;
    for (let row = range.rowStart; row <= range.rowEnd; row++) {
      for (let col = range.colStart; col <= range.colEnd; col++) {
        const cellCenter: WorldPoint = {
          x: grid.originX + (col + 0.5) * resolutionMeters,
          y: grid.originY + (row + 0.5) * resolutionMeters,
        };
        if (!pointInPolygon(cellCenter, area.polygon)) continue;
        const index = row * columns + col;
        walkable[index] = area.transitable ? 1 : 0;
        // S10: un fondo con escombros ligeros sin despejar cuesta más transitar, aunque su `kind` de base siga siendo transitable.
        const debrisPenalty = effectiveTerrainCoverage(area) === "debris" ? DEBRIS_COVERAGE_COST_MULTIPLIER : 1;
        costMultiplier[index] = area.traversalCostMultiplier * debrisPenalty;
        surface[index] = area.kind === "open_ground" ? SURFACE_CODE.open_ground : area.kind === "dense_vegetation" ? SURFACE_CODE.dense_vegetation : SURFACE_CODE.other;
      }
    }
  }

  for (const line of valuesById(world.linearFeatures)) {
    const halfWidth = Math.max(1, line.widthMeters / 2);
    const linePoints = line.polyline;
    // S10 (WLD-010 §3.7): despejar una vía conserva su ventaja de circulación normal; obstruida, restringe y encarece el
    // paso sin cerrarlo; con la función retirada, deja de pintarse como vía y el fondo debajo manda (terreno despejado).
    const isFunctionRemoved = line.kind === "road" && line.wayState === "function_removed";
    const isObstructed = line.kind === "road" && line.wayState === "obstructed";
    const isRoad = line.kind === "road" && !isFunctionRemoved;
    const isWater = line.kind === "watercourse";
    if (!isRoad && !isWater) continue;
    const range = intersectRegion(cellRangeForBounds(boundsOf(linePoints), grid, halfWidth), region);
    if (!range) continue;

    for (let row = range.rowStart; row <= range.rowEnd; row++) {
      for (let col = range.colStart; col <= range.colEnd; col++) {
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
          costMultiplier[index] = Math.min(costMultiplier[index] ?? 1, isObstructed ? OBSTRUCTED_ROAD_COST_MULTIPLIER : ROAD_COST_MULTIPLIER);
          surface[index] = SURFACE_CODE.road;
        }
      }
    }
  }

  // S10 (WLD-010 §3.6): una barrera construida bloquea el paso a lo ancho de su trazado, salvo en el hueco de cruce que su
  // modo elija. Un `pedestrian_gap`/`handcart_gate` deja transitable un tramo corto en torno al cruce con la vía; un
  // `full_block` no deja hueco. La restricción por modalidad de transporte (carretilla/carro no caben por un hueco
  // peatonal) vive en la capa logística de S8 (`transport/route.ts`), no en esta rejilla de paso a pie.
  const BARRIER_HALF_WIDTH_METERS = 0.4;
  const CROSSING_GAP_RADIUS_METERS = 2.5;
  for (const segment of valuesById(world.barrierSegments)) {
    if (!segment.built) continue;
    const from = world.anchors[segment.fromAnchorId];
    const to = world.anchors[segment.toAnchorId];
    if (!from || !to) continue;
    const crossingPoint = segment.crossesWayId ? segmentIntersection(from.position, to.position, world.linearFeatures[segment.crossesWayId]?.polyline) : null;
    const range = intersectRegion(cellRangeForBounds(boundsOf([from.position, to.position]), grid, BARRIER_HALF_WIDTH_METERS), region);
    if (!range) continue;
    for (let row = range.rowStart; row <= range.rowEnd; row++) {
      for (let col = range.colStart; col <= range.colEnd; col++) {
        const cellCenter: WorldPoint = { x: grid.originX + (col + 0.5) * resolutionMeters, y: grid.originY + (row + 0.5) * resolutionMeters };
        if (distanceToSegment(cellCenter, from.position, to.position) > BARRIER_HALF_WIDTH_METERS) continue;
        if (crossingPoint && segment.wayCrossingMode !== "full_block" && Math.hypot(cellCenter.x - crossingPoint.x, cellCenter.y - crossingPoint.y) <= CROSSING_GAP_RADIUS_METERS) continue;
        walkable[row * columns + col] = 0;
      }
    }
  }

  for (const building of valuesById(world.buildings)) {
    const range = intersectRegion(cellRangeForBounds(boundsOf(building.footprint), grid), region);
    if (!range) continue;
    const terminal = terminalFootprintState(world, building.id);
    for (let row = range.rowStart; row <= range.rowEnd; row++) {
      for (let col = range.colStart; col <= range.colEnd; col++) {
        const cellCenter: WorldPoint = {
          x: grid.originX + (col + 0.5) * resolutionMeters,
          y: grid.originY + (row + 0.5) * resolutionMeters,
        };
        if (!pointInPolygon(cellCenter, building.footprint)) continue;
        const index = row * columns + col;
        if (terminal === null) {
          walkable[index] = 0;
        } else {
          // S9: una huella demolida queda cubierta de escombros transitables; una desmantelada, como solar despejado.
          walkable[index] = 1;
          costMultiplier[index] = terminal === "demolished" ? RUBBLE_COST_MULTIPLIER : CLEARED_SITE_COST_MULTIPLIER;
          surface[index] = terminal === "demolished" ? SURFACE_CODE.rubble : SURFACE_CODE.open_ground;
        }
      }
    }
  }
}

/**
 * Construye la rejilla de transitabilidad exterior a partir del mundo
 * semántico V2: terreno con su propio `transitable`/`traversalCostMultiplier`,
 * vías (carreteras transitables con coste reducido, cursos de agua
 * infranqueables) y las huellas de los edificios (siempre bloquean; la
 * entrada real ocurre por el grafo de accesos, no por la rejilla). Desde S9,
 * la huella de un edificio demolido (escombros) o desmantelado (solar) es
 * transitable.
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
  rasterizeWorld(world, grid, null);
  return grid;
}

/** Celdas que cubre la huella de un edificio (más un margen), para invalidar solo esa región. */
export function footprintCellRegion(grid: WalkabilityGridV2, footprint: readonly WorldPoint[], paddingMeters = 0): GridCellRegion {
  return cellRangeForBounds(boundsOf(footprint), grid, paddingMeters);
}

/**
 * Copia de la rejilla con las regiones indicadas re-rasterizadas desde el
 * mundo actual (S9): invalidación dirigida cuando un edificio se desmantela
 * o se demuele. Nunca muta la rejilla original (puede estar compartida).
 */
export function patchWalkabilityGridV2(world: SemanticWorldV2, grid: WalkabilityGridV2, regions: readonly GridCellRegion[]): WalkabilityGridV2 {
  if (regions.length === 0) return grid;
  const patched: WalkabilityGridV2 = {
    ...grid,
    walkable: new Uint8Array(grid.walkable),
    costMultiplier: new Float32Array(grid.costMultiplier),
    surface: new Uint8Array(grid.surface),
  };
  for (const region of regions) rasterizeWorld(world, patched, region);
  return patched;
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
