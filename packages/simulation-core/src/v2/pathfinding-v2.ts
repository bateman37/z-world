import type { SemanticWorldV2, WorldPoint } from "@z-world/contracts";
import type { MovementLocationCheckpoint } from "@z-world/contracts";
import {
  cellToWorldCenterV2,
  isCellWalkableV2,
  worldToCellV2,
  type WalkabilityGridV2,
} from "./navigation-v2.js";
import { findRoomContainingPoint, type NavigationIndexV2 } from "./room-graph.js";

/**
 * Pathfinding híbrido exterior/interior (S3 de WEB-002 §5.4): A* con montículo
 * binario sobre la rejilla exterior (necesario a esta escala: ~600×600
 * celdas frente a las ~60×60 de V1) combinado con el grafo de accesos por
 * edificio de `room-graph.ts` para tramos interiores. Determinista: la
 * misma rejilla/grafo y los mismos extremos producen siempre la misma ruta.
 */

export type NavAnchor =
  | { readonly kind: "exterior"; readonly point: WorldPoint }
  | { readonly kind: "room"; readonly roomId: string; readonly point: WorldPoint };

export function resolveNavAnchor(nav: NavigationIndexV2, world: SemanticWorldV2, point: WorldPoint): NavAnchor {
  const roomId = findRoomContainingPoint(nav, world, point);
  if (roomId) return { kind: "room", roomId, point };
  return { kind: "exterior", point };
}

export interface PathResultV2 {
  readonly waypoints: readonly WorldPoint[];
  readonly locationCheckpoints: readonly MovementLocationCheckpoint[];
  readonly totalDistanceMeters: number;
  /** Estancia de cada `waypoint` (`null` = exterior). Derivado, nunca persistido (S8: superficie interior/exterior de la ruta). */
  readonly waypointRoomIds: readonly (string | null)[];
  /** Aberturas atravesadas, en orden de recorrido (S8: compatibilidad de accesos y eventos al atravesarlos). */
  readonly openingIds: readonly string[];
}

/**
 * Restricciones opcionales de una ruta (S8, SET-010 §3.6): anchura mínima
 * de abertura para el método/carga, y coste o veto por celda exterior
 * (superficie intransitable para el método, niebla no conocida, zona
 * prohibida). Sin opciones, la ruta es exactamente la de S3.
 */
export interface RouteOptionsV2 {
  readonly openingAllowed?: (openingId: string) => boolean;
  /** Multiplicador adicional de coste de una celda exterior por índice, o `null` si no se puede pisar. */
  readonly cellCost?: (index: number) => number | null;
}

function distance(a: WorldPoint, b: WorldPoint): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

// --- A* con montículo binario sobre la rejilla exterior --------------------

interface HeapEntry {
  readonly col: number;
  readonly row: number;
  readonly f: number;
}

class MinHeap {
  private items: HeapEntry[] = [];

  get size(): number {
    return this.items.length;
  }

  push(entry: HeapEntry): void {
    this.items.push(entry);
    let i = this.items.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.items[parent]!.f <= this.items[i]!.f) break;
      [this.items[parent], this.items[i]] = [this.items[i]!, this.items[parent]!];
      i = parent;
    }
  }

  pop(): HeapEntry | undefined {
    const top = this.items[0];
    const last = this.items.pop();
    if (this.items.length > 0 && last !== undefined) {
      this.items[0] = last;
      let i = 0;
      for (;;) {
        const left = i * 2 + 1;
        const right = i * 2 + 2;
        let smallest = i;
        if (left < this.items.length && this.items[left]!.f < this.items[smallest]!.f) smallest = left;
        if (right < this.items.length && this.items[right]!.f < this.items[smallest]!.f) smallest = right;
        if (smallest === i) break;
        [this.items[smallest], this.items[i]] = [this.items[i]!, this.items[smallest]!];
        i = smallest;
      }
    }
    return top;
  }
}

const NEIGHBOR_OFFSETS: readonly [number, number][] = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
];

/** A* determinista sobre la rejilla exterior V2. `null` si no hay ruta transitable. */
export function findGridPathV2(grid: WalkabilityGridV2, start: WorldPoint, goal: WorldPoint, cellCost?: (index: number) => number | null): WorldPoint[] | null {
  const startCell = worldToCellV2(grid, start);
  const goalCell = worldToCellV2(grid, goal);
  if (!startCell || !goalCell) return null;
  if (!isCellWalkableV2(grid, goalCell.col, goalCell.row)) return null;
  if (cellCost && cellCost(goalCell.row * grid.columns + goalCell.col) === null) return null;

  const key = (col: number, row: number) => row * grid.columns + col;
  const gScore = new Float64Array(grid.columns * grid.rows).fill(Infinity);
  const parent = new Int32Array(grid.columns * grid.rows).fill(-1);
  const closed = new Uint8Array(grid.columns * grid.rows);

  const heuristic = (col: number, row: number) => Math.hypot(goalCell.col - col, goalCell.row - row) * grid.resolutionMeters;

  const startKey = key(startCell.col, startCell.row);
  gScore[startKey] = 0;
  const heap = new MinHeap();
  heap.push({ col: startCell.col, row: startCell.row, f: heuristic(startCell.col, startCell.row) });

  const maxIterations = grid.columns * grid.rows + 1;
  let iterations = 0;

  while (heap.size > 0) {
    iterations += 1;
    if (iterations > maxIterations) return null;

    const current = heap.pop()!;
    const currentKey = key(current.col, current.row);
    if (closed[currentKey]) continue;
    closed[currentKey] = 1;

    if (current.col === goalCell.col && current.row === goalCell.row) {
      return reconstructGridPath(grid, parent, currentKey);
    }

    for (const [dc, dr] of NEIGHBOR_OFFSETS) {
      const nCol = current.col + dc;
      const nRow = current.row + dr;
      if (nCol < 0 || nRow < 0 || nCol >= grid.columns || nRow >= grid.rows) continue;
      const nKey = key(nCol, nRow);
      if (closed[nKey]) continue;
      if (!isCellWalkableV2(grid, nCol, nRow)) continue;
      if (dc !== 0 && dr !== 0) {
        if (!isCellWalkableV2(grid, current.col + dc, current.row) || !isCellWalkableV2(grid, current.col, current.row + dr)) {
          continue;
        }
      }

      const stepCost = Math.hypot(dc, dr) * grid.resolutionMeters;
      let costMultiplier = grid.costMultiplier[nKey] ?? 1;
      if (cellCost) {
        const extra = cellCost(nKey);
        if (extra === null) continue;
        costMultiplier *= extra;
      }
      const tentativeG = gScore[currentKey]! + stepCost * costMultiplier;

      if (tentativeG < gScore[nKey]!) {
        gScore[nKey] = tentativeG;
        parent[nKey] = currentKey;
        heap.push({ col: nCol, row: nRow, f: tentativeG + heuristic(nCol, nRow) });
      }
    }
  }

  return null;
}

function reconstructGridPath(grid: WalkabilityGridV2, parent: Int32Array, endKey: number): WorldPoint[] {
  const cells: number[] = [];
  let cursor: number = endKey;
  while (cursor !== -1) {
    cells.push(cursor);
    cursor = parent[cursor]!;
  }
  cells.reverse();
  return cells.map((k) => cellToWorldCenterV2(grid, k % grid.columns, Math.floor(k / grid.columns)));
}

// --- Grafo de accesos interior (Dijkstra sobre grafos pequeños) -----------

interface RoomDijkstraResult {
  readonly roomOrder: readonly string[];
  readonly openings: readonly string[];
  readonly costMeters: number;
}

function roomGraphDijkstra(nav: NavigationIndexV2, buildingId: string, fromRoomId: string, toRoomId: string, openingAllowed?: (openingId: string) => boolean): RoomDijkstraResult | null {
  const buildingIndex = nav.buildings[buildingId];
  if (!buildingIndex) return null;
  if (fromRoomId === toRoomId) return { roomOrder: [fromRoomId], openings: [], costMeters: 0 };

  const dist = new Map<string, number>();
  const prevRoom = new Map<string, string>();
  const prevOpening = new Map<string, string>();
  const visited = new Set<string>();
  for (const roomId of Object.keys(buildingIndex.rooms)) dist.set(roomId, Infinity);
  dist.set(fromRoomId, 0);

  for (;;) {
    let current: string | null = null;
    let currentDist = Infinity;
    for (const [roomId, d] of dist) {
      if (!visited.has(roomId) && d < currentDist) {
        current = roomId;
        currentDist = d;
      }
    }
    if (current === null) break;
    if (current === toRoomId) break;
    visited.add(current);

    const node = buildingIndex.rooms[current];
    if (!node) continue;
    for (const edge of node.edges) {
      if (visited.has(edge.toRoomId)) continue;
      if (openingAllowed && !openingAllowed(edge.viaOpeningId)) continue;
      const candidate = currentDist + edge.costMeters;
      if (candidate < (dist.get(edge.toRoomId) ?? Infinity)) {
        dist.set(edge.toRoomId, candidate);
        prevRoom.set(edge.toRoomId, current);
        prevOpening.set(edge.toRoomId, edge.viaOpeningId);
      }
    }
  }

  const finalCost = dist.get(toRoomId);
  if (finalCost === undefined || !Number.isFinite(finalCost)) return null;

  const roomOrder: string[] = [];
  const openings: string[] = [];
  let cursor: string | undefined = toRoomId;
  while (cursor !== undefined) {
    roomOrder.push(cursor);
    const opening = prevOpening.get(cursor);
    if (opening) openings.push(opening);
    cursor = prevRoom.get(cursor);
  }
  roomOrder.reverse();
  openings.reverse();
  return { roomOrder, openings, costMeters: finalCost };
}

interface ExitPlan {
  readonly waypoints: WorldPoint[];
  readonly distanceMeters: number;
  readonly exteriorAnchor: WorldPoint;
  readonly openingIds: string[];
}

/** Mejor plan para salir de una estancia hasta la rejilla exterior, atravesando el grafo de accesos del edificio. */
function planExitToExterior(nav: NavigationIndexV2, world: SemanticWorldV2, buildingId: string, roomId: string, openingAllowed?: (openingId: string) => boolean): ExitPlan | null {
  const buildingIndex = nav.buildings[buildingId];
  if (!buildingIndex) return null;
  let best: ExitPlan | null = null;

  for (const bridge of buildingIndex.exteriorBridges) {
    if (openingAllowed && !openingAllowed(bridge.openingId)) continue;
    const route = roomGraphDijkstra(nav, buildingId, roomId, bridge.interiorRoomId, openingAllowed);
    if (!route) continue;
    const waypoints: WorldPoint[] = [];
    for (const roomInPath of route.roomOrder) {
      const centroid = buildingIndex.rooms[roomInPath]?.centroid;
      if (centroid) waypoints.push(centroid);
    }
    waypoints.push(bridge.openingPosition);
    waypoints.push(bridge.exteriorAnchor);
    const distanceMeters = route.costMeters + bridge.costMeters;
    if (!best || distanceMeters < best.distanceMeters) {
      best = { waypoints, distanceMeters, exteriorAnchor: bridge.exteriorAnchor, openingIds: [...route.openings, bridge.openingId] };
    }
  }
  return best;
}

interface EntryPlan {
  readonly waypoints: WorldPoint[];
  readonly distanceMeters: number;
  readonly exteriorAnchor: WorldPoint;
  readonly openingIds: string[];
}

/** Mejor plan para entrar a una estancia objetivo desde la rejilla exterior, eligiendo la abertura más cercana en línea recta al punto exterior de referencia. */
function planEntryFromExterior(
  nav: NavigationIndexV2,
  buildingId: string,
  targetRoomId: string,
  fromExteriorPoint: WorldPoint,
  openingAllowed?: (openingId: string) => boolean,
): EntryPlan | null {
  const buildingIndex = nav.buildings[buildingId];
  if (!buildingIndex) return null;
  let best: EntryPlan | null = null;

  for (const bridge of buildingIndex.exteriorBridges) {
    if (openingAllowed && !openingAllowed(bridge.openingId)) continue;
    const route = roomGraphDijkstra(nav, buildingId, bridge.interiorRoomId, targetRoomId, openingAllowed);
    if (!route) continue;
    const approachCost = distance(fromExteriorPoint, bridge.exteriorAnchor);
    const totalCost = approachCost + bridge.costMeters + route.costMeters;
    const waypoints: WorldPoint[] = [bridge.exteriorAnchor, bridge.openingPosition];
    for (const roomInPath of route.roomOrder) {
      const centroid = buildingIndex.rooms[roomInPath]?.centroid;
      if (centroid) waypoints.push(centroid);
    }
    if (!best || totalCost < best.distanceMeters) {
      best = { waypoints, distanceMeters: totalCost, exteriorAnchor: bridge.exteriorAnchor, openingIds: [bridge.openingId, ...route.openings] };
    }
  }
  return best;
}

function checkpointsFromWaypoints(
  waypoints: readonly WorldPoint[],
  roomAtEachWaypoint: readonly (string | null)[],
): { checkpoints: MovementLocationCheckpoint[]; total: number } {
  const checkpoints: MovementLocationCheckpoint[] = [];
  let cumulative = 0;
  let lastRoom: string | null | undefined;
  for (let i = 0; i < waypoints.length; i++) {
    if (i > 0) cumulative += distance(waypoints[i - 1]!, waypoints[i]!);
    const room = roomAtEachWaypoint[i] ?? null;
    if (room !== lastRoom) {
      checkpoints.push({
        afterDistanceMeters: cumulative,
        location: room ? { kind: "room", roomId: room } : { kind: "exterior" },
      });
      lastRoom = room;
    }
  }
  return { checkpoints, total: cumulative };
}

/**
 * Calcula la ruta híbrida entre dos anclas (exterior o estancia). Devuelve
 * también los puntos donde la ubicación lógica de la persona cambia
 * (`locationCheckpoints`), para que el avance de simulación sincronice
 * `location` sin recalcular geometría en cada paso.
 */
export function findPathV2(nav: NavigationIndexV2, world: SemanticWorldV2, start: NavAnchor, goal: NavAnchor, options?: RouteOptionsV2): PathResultV2 | null {
  const openingAllowed = options?.openingAllowed;
  if (start.kind === "exterior" && goal.kind === "exterior") {
    const gridPath = findGridPathV2(nav.grid, start.point, goal.point, options?.cellCost);
    if (!gridPath) return null;
    const rooms = gridPath.map(() => null);
    const { checkpoints, total } = checkpointsFromWaypoints(gridPath, rooms);
    return { waypoints: gridPath, locationCheckpoints: checkpoints, totalDistanceMeters: total, waypointRoomIds: rooms, openingIds: [] };
  }

  if (start.kind === "room" && goal.kind === "room" && nav.roomToBuilding[start.roomId] === nav.roomToBuilding[goal.roomId]) {
    const buildingId = nav.roomToBuilding[start.roomId]!;
    const route = roomGraphDijkstra(nav, buildingId, start.roomId, goal.roomId, openingAllowed);
    if (!route) return null;
    const buildingIndex = nav.buildings[buildingId]!;
    const waypoints: WorldPoint[] = [start.point];
    const rooms: (string | null)[] = [start.roomId];
    for (const roomId of route.roomOrder.slice(1)) {
      waypoints.push(buildingIndex.rooms[roomId]!.centroid);
      rooms.push(roomId);
    }
    waypoints.push(goal.point);
    rooms.push(goal.roomId);
    const { checkpoints, total } = checkpointsFromWaypoints(waypoints, rooms);
    return { waypoints, locationCheckpoints: checkpoints, totalDistanceMeters: total, waypointRoomIds: rooms, openingIds: [...route.openings] };
  }

  // Al menos un extremo requiere cruzar el límite exterior/interior.
  let exitLeg: { waypoints: WorldPoint[]; rooms: (string | null)[]; openingIds: string[] } | null = null;
  let effectiveStartPoint = start.point;
  let effectiveStartRoom: string | null = null;

  if (start.kind === "room") {
    const buildingId = nav.roomToBuilding[start.roomId];
    if (!buildingId) return null;
    const plan = planExitToExterior(nav, world, buildingId, start.roomId, openingAllowed);
    if (!plan) return null;
    exitLeg = { waypoints: [start.point, ...plan.waypoints], rooms: [start.roomId, ...plan.waypoints.map(() => null)], openingIds: plan.openingIds };
    effectiveStartPoint = plan.exteriorAnchor;
    effectiveStartRoom = start.roomId;
  }

  let entryLeg: { waypoints: WorldPoint[]; rooms: (string | null)[]; openingIds: string[] } | null = null;
  let effectiveGoalPoint = goal.point;

  if (goal.kind === "room") {
    const buildingId = nav.roomToBuilding[goal.roomId];
    if (!buildingId) return null;
    const plan = planEntryFromExterior(nav, buildingId, goal.roomId, effectiveStartPoint, openingAllowed);
    if (!plan) return null;
    entryLeg = { waypoints: [...plan.waypoints, goal.point], rooms: [...plan.waypoints.map(() => null), goal.roomId], openingIds: plan.openingIds };
    effectiveGoalPoint = plan.exteriorAnchor;
  }

  const gridPath = findGridPathV2(nav.grid, effectiveStartPoint, effectiveGoalPoint, options?.cellCost);
  if (!gridPath) return null;

  const waypoints: WorldPoint[] = [];
  const rooms: (string | null)[] = [];

  if (exitLeg) {
    waypoints.push(...exitLeg.waypoints);
    rooms.push(...exitLeg.rooms);
    waypoints.push(...gridPath.slice(1));
    rooms.push(...gridPath.slice(1).map(() => null));
  } else {
    waypoints.push(...gridPath);
    rooms.push(...gridPath.map(() => null));
  }

  if (entryLeg) {
    waypoints.push(...entryLeg.waypoints.slice(1));
    rooms.push(...entryLeg.rooms.slice(1));
  }

  void effectiveStartRoom;
  const { checkpoints, total } = checkpointsFromWaypoints(waypoints, rooms);
  return { waypoints, locationCheckpoints: checkpoints, totalDistanceMeters: total, waypointRoomIds: rooms, openingIds: [...(exitLeg?.openingIds ?? []), ...(entryLeg?.openingIds ?? [])] };
}
