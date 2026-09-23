import type { SemanticWorldV2, WorldPoint } from "@z-world/contracts";
import { buildWalkabilityGridV2, nearestWalkableCellV2, cellToWorldCenterV2, type WalkabilityGridV2 } from "./navigation-v2.js";

/**
 * Grafo de accesos por edificio (S3 de WEB-002 §5.4): estrategia elegida
 * para evitar una rejilla de alta resolución sobre los interiores de las
 * 55-85 construcciones generadas. Cada edificio con planta activa se
 * representa como un pequeño grafo de nodos (centroide de cada estancia) y
 * aristas (aberturas interiores que conectan dos estancias, o puentes hacia
 * la rejilla exterior en las aberturas con `connectsToExterior`). El coste
 * de cada arista es una aproximación de línea recta entre centroides,
 * provisional y documentada — no un pathfinding geométrico completo dentro
 * de la estancia, innecesario para el alcance de S3 (§5.4, §7 de WEB-002).
 */

function centroidOf(polygon: readonly WorldPoint[]): WorldPoint {
  let x = 0;
  let y = 0;
  for (const p of polygon) {
    x += p.x;
    y += p.y;
  }
  return { x: x / polygon.length, y: y / polygon.length };
}

function distance(a: WorldPoint, b: WorldPoint): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/**
 * Una abertura es transitable si no tiene obstrucción registrada y, cuando
 * tiene cierre instalado, ese cierre no está en estado `locked` (§5.4: un
 * cierre bloqueado impide el paso; abierto o destruido se interpreta según
 * su realidad física; S3 no implementa forzar/abrir/reparar, así que un
 * cierre `closed` sin llave se trata como una acción pasiva de empujar la
 * puerta al caminar, no como un trabajo).
 */
export function isOpeningPassable(openingId: string, world: SemanticWorldV2): boolean {
  const opening = world.openings[openingId];
  if (!opening) return false;
  for (const obstruction of Object.values(world.obstructions)) {
    if (obstruction.openingId === openingId) return false;
  }
  if (!opening.installedClosureId) return true;
  const closure = world.installedClosures[opening.installedClosureId];
  if (!closure) return true;
  return closure.state !== "locked";
}

export interface RoomGraphEdge {
  readonly toRoomId: string;
  readonly viaOpeningId: string;
  readonly costMeters: number;
}

export interface ExteriorBridge {
  readonly openingId: string;
  readonly interiorRoomId: string;
  readonly exteriorAnchor: WorldPoint;
  readonly openingPosition: WorldPoint;
  readonly costMeters: number;
}

export interface BuildingNavIndex {
  readonly buildingId: string;
  readonly placeId: string | null;
  readonly activeFloorId: string | null;
  readonly rooms: Readonly<Record<string, { readonly centroid: WorldPoint; readonly edges: readonly RoomGraphEdge[] }>>;
  readonly exteriorBridges: readonly ExteriorBridge[];
}

export interface NavigationIndexV2 {
  readonly grid: WalkabilityGridV2;
  readonly buildings: Readonly<Record<string, BuildingNavIndex>>;
  readonly roomToBuilding: Readonly<Record<string, string>>;
}

/** Construye el grafo de accesos de un único edificio con planta activa generada. */
function buildBuildingNavIndex(buildingId: string, world: SemanticWorldV2, grid: WalkabilityGridV2): BuildingNavIndex | null {
  const building = world.buildings[buildingId];
  if (!building || !building.interiorGenerated) return null;

  // El generador de S2 marca la planta activa con `Floor.active`, pero no
  // rellena siempre `Building.activeFloorId` con esa misma referencia
  // (campo todavía sin escribir por el generador en la práctica): se busca
  // la planta activa real del edificio por `buildingId`, nunca solo por el
  // puntero de `Building`, para no dejar ningún edificio con interior
  // generado inaccesible por una desincronización entre ambos campos.
  const floor =
    (building.activeFloorId ? world.floors[building.activeFloorId] : undefined) ??
    Object.values(world.floors).find((f) => f.buildingId === buildingId && f.active);
  if (!floor || !floor.active) return null;

  const roomsOnFloor = Object.values(world.rooms).filter((room) => room.floorId === floor.id);
  const rooms: Record<string, { centroid: WorldPoint; edges: RoomGraphEdge[] }> = {};
  for (const room of roomsOnFloor) {
    rooms[room.id] = { centroid: centroidOf(room.polygon), edges: [] };
  }

  const exteriorBridges: ExteriorBridge[] = [];

  for (const opening of Object.values(world.openings)) {
    const roomA = opening.connectsRoomId ? rooms[opening.connectsRoomId] : undefined;
    if (!roomA) continue;
    if (!isOpeningPassable(opening.id, world)) continue;

    if (opening.connectsOtherRoomId) {
      const roomB = rooms[opening.connectsOtherRoomId];
      if (!roomB) continue;
      const costMeters = Math.max(1, distance(roomA.centroid, roomB.centroid));
      rooms[opening.connectsRoomId!]!.edges.push({ toRoomId: opening.connectsOtherRoomId, viaOpeningId: opening.id, costMeters });
      rooms[opening.connectsOtherRoomId]!.edges.push({ toRoomId: opening.connectsRoomId!, viaOpeningId: opening.id, costMeters });
    }

    if (opening.connectsToExterior) {
      const anchorCell = nearestWalkableCellV2(grid, opening.position);
      if (!anchorCell) continue;
      const exteriorAnchor = cellToWorldCenterV2(grid, anchorCell.col, anchorCell.row);
      const costMeters = Math.max(1, distance(exteriorAnchor, opening.position) + distance(opening.position, roomA.centroid));
      exteriorBridges.push({
        openingId: opening.id,
        interiorRoomId: opening.connectsRoomId!,
        exteriorAnchor,
        openingPosition: opening.position,
        costMeters,
      });
    }
  }

  return { buildingId, placeId: building.placeId, activeFloorId: floor.id, rooms, exteriorBridges };
}

/** Construye el índice de navegación completo (rejilla exterior + grafo de accesos por edificio) para una carga de partida V2. Se calcula una vez al cargar, no en cada comando. */
export function buildNavigationIndexV2(world: SemanticWorldV2, grid: WalkabilityGridV2): NavigationIndexV2 {
  const buildings: Record<string, BuildingNavIndex> = {};
  const roomToBuilding: Record<string, string> = {};

  for (const buildingId of Object.keys(world.buildings)) {
    const index = buildBuildingNavIndex(buildingId, world, grid);
    if (!index) continue;
    buildings[buildingId] = index;
    for (const roomId of Object.keys(index.rooms)) {
      roomToBuilding[roomId] = buildingId;
    }
  }

  return { grid, buildings, roomToBuilding };
}

/**
 * Punto de entrada único: construye la rejilla exterior y el grafo de
 * accesos por edificio de una sola vez, a partir del mundo semántico ya
 * cargado. Se llama una vez al cargar la partida en el Worker, nunca por
 * comando (ver `WorkerSessionV2`); el resultado nunca se persiste.
 */
export function buildFullNavigationIndexV2(world: SemanticWorldV2): NavigationIndexV2 {
  const grid = buildWalkabilityGridV2(world);
  return buildNavigationIndexV2(world, grid);
}

/** Estancia (si existe) cuyo polígono contiene un punto, restringida a las plantas activas ya indexadas. */
export function findRoomContainingPoint(nav: NavigationIndexV2, world: SemanticWorldV2, point: WorldPoint): string | null {
  for (const [roomId, buildingId] of Object.entries(nav.roomToBuilding)) {
    const room = world.rooms[roomId];
    const building = world.buildings[buildingId];
    if (!room || !building) continue;
    if (pointInPolygon(point, room.polygon)) return roomId;
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
