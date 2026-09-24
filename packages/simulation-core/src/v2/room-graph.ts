import type { SemanticWorldV2, WorldPoint } from "@z-world/contracts";
import { isFabricTerminal } from "@z-world/contracts";
import { valuesById } from "./ordered.js";
import {
  buildWalkabilityGridV2,
  cellToWorldCenterV2,
  footprintCellRegion,
  nearestWalkableCellV2,
  patchWalkabilityGridV2,
  type GridCellRegion,
  type WalkabilityGridV2,
} from "./navigation-v2.js";

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
  // S9: una obstrucción (barricada, tapiado, escombros, mueble) bloquea el paso sin eliminar la abertura.
  for (const obstruction of Object.values(world.obstructions)) {
    if (obstruction.openingId === openingId) return false;
  }
  // S9: la abertura de un edificio desmantelado o demolido ya no forma parte de ningún grafo de circulación.
  const buildingId = opening.connectsRoomId ? buildingIdOfRoomInWorld(world, opening.connectsRoomId) : null;
  if (buildingId && isFabricTerminal(world.buildingFabrics?.[buildingId])) return false;
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
  /** Revisión global de accesos/estructura del mundo con la que se derivó este índice (S9). */
  readonly revision: number;
  /** Revisión por edificio con la que se derivó cada entrada (S9: invalidación dirigida). */
  readonly buildingRevisions: Readonly<Record<string, number>>;
}

/** Edificio al que pertenece una estancia (vía su planta), o `null`. */
export function buildingIdOfRoomInWorld(world: SemanticWorldV2, roomId: string): string | null {
  const room = world.rooms[roomId];
  if (!room) return null;
  return world.floors[room.floorId]?.buildingId ?? null;
}

/** Construye el grafo de accesos de un único edificio con planta activa generada. */
function buildBuildingNavIndex(buildingId: string, world: SemanticWorldV2, grid: WalkabilityGridV2): BuildingNavIndex | null {
  const building = world.buildings[buildingId];
  if (!building || !building.interiorGenerated) return null;
  // S9: un edificio desmantelado del todo o demolido deja de tener estancias transitables.
  if (isFabricTerminal(world.buildingFabrics?.[buildingId])) return null;

  // El generador de S2 marca la planta activa con `Floor.active`, pero no
  // rellena siempre `Building.activeFloorId` con esa misma referencia
  // (campo todavía sin escribir por el generador en la práctica): se busca
  // la planta activa real del edificio por `buildingId`, nunca solo por el
  // puntero de `Building`, para no dejar ningún edificio con interior
  // generado inaccesible por una desincronización entre ambos campos.
  const floor =
    (building.activeFloorId ? world.floors[building.activeFloorId] : undefined) ??
    valuesById(world.floors).find((f) => f.buildingId === buildingId && f.active);
  if (!floor || !floor.active) return null;

  const roomsOnFloor = valuesById(world.rooms).filter((room) => room.floorId === floor.id);
  const rooms: Record<string, { centroid: WorldPoint; edges: RoomGraphEdge[] }> = {};
  for (const room of roomsOnFloor) {
    rooms[room.id] = { centroid: centroidOf(room.polygon), edges: [] };
  }

  const exteriorBridges: ExteriorBridge[] = [];

  for (const opening of valuesById(world.openings)) {
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

  for (const buildingId of Object.keys(world.buildings).sort()) {
    const index = buildBuildingNavIndex(buildingId, world, grid);
    if (!index) continue;
    buildings[buildingId] = index;
    for (const roomId of Object.keys(index.rooms)) {
      roomToBuilding[roomId] = buildingId;
    }
  }

  const revision = world.navigationRevision?.global ?? 0;
  return { grid, buildings, roomToBuilding, revision, buildingRevisions: { ...(world.navigationRevision?.byBuilding ?? {}) } };
}

/** Radio (m) dentro del cual un cambio de rejilla puede alterar el anclaje exterior de una abertura (`nearestWalkableCellV2`, 6 celdas). */
function anchorInfluenceMeters(grid: WalkabilityGridV2): number {
  return (6 + 1) * grid.resolutionMeters;
}

const refreshCache = new WeakMap<NavigationIndexV2, { readonly revisionRef: unknown; readonly nav: NavigationIndexV2 }>();

/**
 * Invalidación dirigida del índice de navegación derivado (S9, §8.7 del
 * prompt S7-S9). Si la revisión de accesos del mundo coincide con la del
 * índice, lo devuelve tal cual (coste O(1)). Si no, reconstruye solo los
 * edificios cuya revisión cambió; si alguno quedó desmantelado o demolido,
 * re-rasteriza únicamente la rejilla de su huella y los edificios cuyas
 * aberturas exteriores podrían anclarse de otra forma. El resultado es
 * idéntico a reconstruirlo todo desde cero (prueba de equivalencia), nunca
 * se persiste y nunca muta el índice recibido (puede estar compartido).
 */
export function ensureNavigationCurrent(nav: NavigationIndexV2, world: SemanticWorldV2): NavigationIndexV2 {
  const revisionRef = world.navigationRevision;
  const revision = revisionRef?.global ?? 0;
  if (nav.revision === revision && revisionRef === undefined) return nav;
  if (nav.revision === revision) {
    const byBuilding = revisionRef?.byBuilding ?? {};
    let same = true;
    for (const [id, value] of Object.entries(byBuilding)) {
      if ((nav.buildingRevisions[id] ?? 0) !== value) {
        same = false;
        break;
      }
    }
    if (same) return nav;
  }
  const cached = refreshCache.get(nav);
  if (cached && cached.revisionRef === revisionRef) return cached.nav;

  const byBuilding = revisionRef?.byBuilding ?? {};
  const changed = Object.keys(byBuilding)
    .filter((id) => (nav.buildingRevisions[id] ?? 0) !== byBuilding[id])
    .sort();

  // Rejilla: solo la huella de los edificios que dejaron de existir como tales (o, por coherencia, cualquier cambio de estado terminal).
  const regions: GridCellRegion[] = [];
  const influence: { minX: number; minY: number; maxX: number; maxY: number }[] = [];
  for (const id of changed) {
    const building = world.buildings[id];
    if (!building) continue;
    const wasIndexed = nav.buildings[id] !== undefined;
    const terminal = isFabricTerminal(world.buildingFabrics?.[id]);
    if (!terminal && wasIndexed) continue;
    regions.push(footprintCellRegion(nav.grid, building.footprint));
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const p of building.footprint) {
      minX = Math.min(minX, p.x);
      minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x);
      maxY = Math.max(maxY, p.y);
    }
    const pad = anchorInfluenceMeters(nav.grid);
    influence.push({ minX: minX - pad, minY: minY - pad, maxX: maxX + pad, maxY: maxY + pad });
  }
  const grid = patchWalkabilityGridV2(world, nav.grid, regions);

  const rebuild = new Set(changed);
  if (influence.length > 0) {
    for (const opening of valuesById(world.openings)) {
      if (!opening.connectsToExterior || !opening.connectsRoomId) continue;
      const p = opening.position;
      if (!influence.some((b) => p.x >= b.minX && p.x <= b.maxX && p.y >= b.minY && p.y <= b.maxY)) continue;
      const buildingId = buildingIdOfRoomInWorld(world, opening.connectsRoomId);
      if (buildingId) rebuild.add(buildingId);
    }
  }

  const buildings: Record<string, BuildingNavIndex> = { ...nav.buildings };
  for (const id of [...rebuild].sort()) {
    delete buildings[id];
    const index = buildBuildingNavIndex(id, world, grid);
    if (!index) continue;
    buildings[id] = index;
  }
  // Mismo orden de claves que una reconstrucción completa (ordenada por ID): la iteración posterior es determinista.
  const orderedBuildings: Record<string, BuildingNavIndex> = {};
  for (const id of Object.keys(buildings).sort()) orderedBuildings[id] = buildings[id]!;
  const orderedRooms: Record<string, string> = {};
  for (const id of Object.keys(orderedBuildings)) for (const roomId of Object.keys(orderedBuildings[id]!.rooms)) orderedRooms[roomId] = id;

  const refreshed: NavigationIndexV2 = { grid, buildings: orderedBuildings, roomToBuilding: orderedRooms, revision, buildingRevisions: { ...byBuilding } };
  refreshCache.set(nav, { revisionRef, nav: refreshed });
  return refreshed;
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
