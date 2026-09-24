import type { EntityLocation, SimulationStateV2, TransportSurfaceMeters, WorldPoint } from "@z-world/contracts";
import { OPENING_WIDTH_RANK, type OpeningWidthClass, type SurfaceKind, type TransportMethodDefinition } from "@z-world/catalogs";
import type { NavigationIndexV2 } from "../room-graph.js";
import { findPathV2, resolveNavAnchor, type PathResultV2, type RouteOptionsV2 } from "../pathfinding-v2.js";
import { surfaceKindAt, worldToCellV2 } from "../navigation-v2.js";
import { valuesById } from "../ordered.js";
import { resolveRoomId } from "../jobs/location-utils.js";
import { resolveHolderPersonId, locationWorldPoint } from "../objects/storage.js";

/**
 * Rutas logísticas compatibles (S8, SET-010 §3.6, §7.5 del prompt S7-S9).
 * Reutiliza exactamente el pathfinding híbrido de S3 (A* exterior + grafo
 * de accesos interior) con restricciones opcionales: anchura mínima de
 * abertura para el método y la carga, superficie intransitable para el
 * método, celdas ocultas por la niebla (no hay pathfinding omnisciente:
 * solo terreno ya conocido por la comunidad) y zonas prohibidas (una zona
 * prohibida nunca se atraviesa en silencio; la de precaución encarece la
 * ruta).
 */

export interface RouteSpec {
  /** Método con el que se recorre (su superficie y su anchura). `null` = una persona a pie sin carga. */
  readonly method: TransportMethodDefinition | null;
  /** Anchura mínima de acceso exigida por la carga y el método. */
  readonly minOpeningClass: OpeningWidthClass;
  /** Solo terreno exterior conocido (niebla ya levantada). */
  readonly knownTerrainOnly: boolean;
  /** Ignorar zonas (solo para explicar que la única ruta atraviesa una zona prohibida; nunca para moverse). */
  readonly ignoreZones?: boolean;
}

export interface TransportRoute {
  readonly path: PathResultV2;
  readonly accesses: readonly { readonly openingId: string; readonly atMeters: number }[];
  readonly surfaceMeters: TransportSurfaceMeters;
  readonly narrowestOpening: OpeningWidthClass | null;
}

const round3 = (value: number): number => Math.round(value * 1000) / 1000;

function pointInPolygon(point: WorldPoint, polygon: readonly WorldPoint[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const pi = polygon[i]!;
    const pj = polygon[j]!;
    const intersects = pi.y > point.y !== pj.y > point.y && point.x < ((pj.x - pi.x) * (point.y - pi.y)) / (pj.y - pi.y) + pi.x;
    if (intersects) inside = !inside;
  }
  return inside;
}

export function fogHiddenAtPoint(state: SimulationStateV2, point: WorldPoint): boolean {
  const { fog } = state;
  const col = Math.floor((point.x - fog.originX) / fog.resolutionMeters);
  const row = Math.floor((point.y - fog.originY) / fog.resolutionMeters);
  if (col < 0 || row < 0 || col >= fog.columns || row >= fog.rows) return true;
  return (fog.cells[row * fog.columns + col] ?? 0) === 0;
}

/** Política de zona en un punto (la primera zona que lo contiene, en orden estable). */
export function zonePolicyAtPoint(state: SimulationStateV2, point: WorldPoint): "habitual" | "precaution" | "forbidden" | null {
  for (const zone of valuesById(state.workZones)) {
    if (pointInPolygon(point, zone.polygon)) return zone.policy;
  }
  return null;
}

/** Opciones de ruta de S3 con las restricciones del método (ver cabecera). */
export function buildRouteOptions(state: SimulationStateV2, nav: NavigationIndexV2, spec: RouteSpec): RouteOptionsV2 {
  const grid = nav.grid;
  const zones = valuesById(state.workZones)
    .filter((z) => z.policy !== "habitual" && !spec.ignoreZones)
    .map((z) => {
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      for (const p of z.polygon) {
        minX = Math.min(minX, p.x);
        minY = Math.min(minY, p.y);
        maxX = Math.max(maxX, p.x);
        maxY = Math.max(maxY, p.y);
      }
      return { zone: z, minX, minY, maxX, maxY };
    });
  const minRank = OPENING_WIDTH_RANK[spec.minOpeningClass];
  const surfaces = spec.method?.surfaces ?? null;
  return {
    openingAllowed: (openingId) => {
      const opening = state.world.openings[openingId];
      return opening !== undefined && OPENING_WIDTH_RANK[opening.widthClass] >= minRank;
    },
    cellCost: (index) => {
      const col = index % grid.columns;
      const row = Math.floor(index / grid.columns);
      const center = { x: grid.originX + (col + 0.5) * grid.resolutionMeters, y: grid.originY + (row + 0.5) * grid.resolutionMeters };
      if (spec.knownTerrainOnly && fogHiddenAtPoint(state, center)) return null;
      let multiplier = 1;
      for (const z of zones) {
        if (center.x < z.minX || center.x > z.maxX || center.y < z.minY || center.y > z.maxY) continue;
        if (!pointInPolygon(center, z.zone.polygon)) continue;
        if (z.zone.policy === "forbidden") return null;
        multiplier *= 1.5;
      }
      if (surfaces) {
        const behaviour = surfaces[surfaceKindAt(grid, index)];
        if (!behaviour) return null;
        multiplier *= 1 / Math.max(0.1, behaviour.speed);
      }
      return multiplier;
    },
  };
}

function segmentSurface(nav: NavigationIndexV2, a: WorldPoint, b: WorldPoint, roomA: string | null, roomB: string | null): SurfaceKind {
  if (roomA !== null || roomB !== null) return "interior";
  const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  const cell = worldToCellV2(nav.grid, mid);
  if (!cell) return "open_ground";
  return surfaceKindAt(nav.grid, cell.row * nav.grid.columns + cell.col);
}

/** Metros de cada superficie a lo largo de la ruta (§7.3: carro y carretilla reaccionan al terreno). */
export function surfaceBreakdown(nav: NavigationIndexV2, path: PathResultV2): TransportSurfaceMeters {
  const totals: Record<SurfaceKind, number> = { road: 0, open_ground: 0, dense_vegetation: 0, interior: 0, rubble: 0 };
  for (let i = 1; i < path.waypoints.length; i++) {
    const a = path.waypoints[i - 1]!;
    const b = path.waypoints[i]!;
    totals[segmentSurface(nav, a, b, path.waypointRoomIds[i - 1] ?? null, path.waypointRoomIds[i] ?? null)] += Math.hypot(b.x - a.x, b.y - a.y);
  }
  return { road: round3(totals.road), open_ground: round3(totals.open_ground), dense_vegetation: round3(totals.dense_vegetation), interior: round3(totals.interior), rubble: round3(totals.rubble) };
}

/** Distancia acumulada a la que la ruta pasa más cerca de cada abertura, en orden y hacia delante. */
function accessDistances(state: SimulationStateV2, path: PathResultV2): { openingId: string; atMeters: number }[] {
  const result: { openingId: string; atMeters: number }[] = [];
  const cumulative: number[] = [0];
  for (let i = 1; i < path.waypoints.length; i++) {
    const a = path.waypoints[i - 1]!;
    const b = path.waypoints[i]!;
    cumulative.push(cumulative[i - 1]! + Math.hypot(b.x - a.x, b.y - a.y));
  }
  let fromSegment = 1;
  for (const openingId of path.openingIds) {
    const opening = state.world.openings[openingId];
    if (!opening) continue;
    let best = { distance: Infinity, atMeters: cumulative[Math.min(fromSegment, cumulative.length - 1)] ?? 0, segment: fromSegment };
    for (let i = Math.max(1, fromSegment); i < path.waypoints.length; i++) {
      const a = path.waypoints[i - 1]!;
      const b = path.waypoints[i]!;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len2 = dx * dx + dy * dy;
      const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((opening.position.x - a.x) * dx + (opening.position.y - a.y) * dy) / len2));
      const px = a.x + dx * t;
      const py = a.y + dy * t;
      const d = Math.hypot(opening.position.x - px, opening.position.y - py);
      if (d < best.distance - 1e-9) best = { distance: d, atMeters: cumulative[i - 1]! + Math.sqrt(len2) * t, segment: i };
    }
    fromSegment = best.segment;
    result.push({ openingId, atMeters: round3(best.atMeters) });
  }
  return result;
}

export function narrowestOpeningOf(state: SimulationStateV2, openingIds: readonly string[]): OpeningWidthClass | null {
  let narrowest: OpeningWidthClass | null = null;
  for (const id of openingIds) {
    const opening = state.world.openings[id];
    if (!opening) continue;
    if (narrowest === null || OPENING_WIDTH_RANK[opening.widthClass] < OPENING_WIDTH_RANK[narrowest]) narrowest = opening.widthClass;
  }
  return narrowest;
}

/** Ruta real entre dos puntos con las restricciones del método, o `null` si no existe con lo que se conoce. */
export function planRoute(state: SimulationStateV2, nav: NavigationIndexV2, from: WorldPoint, to: WorldPoint, spec: RouteSpec): TransportRoute | null {
  const start = resolveNavAnchor(nav, state.world, from);
  const goal = resolveNavAnchor(nav, state.world, to);
  const path = findPathV2(nav, state.world, start, goal, buildRouteOptions(state, nav, spec));
  if (!path) return null;
  return { path, accesses: accessDistances(state, path), surfaceMeters: surfaceBreakdown(nav, path), narrowestOpening: narrowestOpeningOf(state, path.openingIds) };
}

const KNOWLEDGE_RANK: Readonly<Record<string, number>> = { unknown: 0, sighted: 1, observed: 2, inspected: 3, exploited: 4 };

/**
 * Regla de conocimiento de ubicaciones de S7 (misma que la proyección de
 * inventario): lo que lleva alguien es conocido; lo de una estancia, si su
 * contenido está registrado; lo exterior, si su punto ya no está oculto por
 * la niebla. `Auto` solo valora medios y destinos conocidos (§7.9).
 */
export function isLocationKnown(state: SimulationStateV2, location: EntityLocation): boolean {
  if (resolveHolderPersonId(state, location)) return true;
  const roomId = resolveRoomId(state, location);
  if (roomId) return state.discoveries.some((d) => d.entityId === roomId && d.facet === "content" && (KNOWLEDGE_RANK[d.state] ?? 0) >= 3);
  const point = locationWorldPoint(state, location);
  return point !== null && !fogHiddenAtPoint(state, point);
}

/** Una estancia es conocida como destino si alguien la ha visto por dentro (faceta `rooms` observada). */
export function isRoomKnown(state: SimulationStateV2, roomId: string): boolean {
  return state.discoveries.some((d) => d.entityId === roomId && (KNOWLEDGE_RANK[d.state] ?? 0) >= 2);
}
