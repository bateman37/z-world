import type {
  DiscoveryRecord,
  DomainEventV2,
  FogMaskProjection,
  GameSummaryProjection,
  MapEntitiesProjectionV2,
  MovementProjection,
  OperationalLogEntryProjection,
  PersonCardProjection,
  PersonSheetProjection,
  SaveStatus,
  SimulationStateV2,
  VisibilityState,
  VisiblePlaceProjection,
  WorkerProjectionsV2,
} from "@z-world/contracts";
import { toSimulatedDayTime } from "@z-world/contracts";

/**
 * Construye las proyecciones de solo lectura del runtime V2 (S3 §5.8):
 * cada entidad espacial se filtra por lo que su `DiscoveryRecord` permite
 * mostrar, nunca por la cámara. El terreno se filtra por niebla (igual que
 * V1); lugares/edificios/estancias/aberturas se filtran por descubrimiento
 * (S2 no tenía niebla propia para su geometría interior). Nunca se envía
 * `SimulationStateV2` completo a React: esta función es la única frontera.
 */

const VISIBILITY_BY_CELL_VALUE: readonly VisibilityState[] = ["hidden", "known", "observable"];

function fogStateAt(state: SimulationStateV2, x: number, y: number): VisibilityState {
  const { fog } = state;
  const col = Math.floor((x - fog.originX) / fog.resolutionMeters);
  const row = Math.floor((y - fog.originY) / fog.resolutionMeters);
  if (col < 0 || row < 0 || col >= fog.columns || row >= fog.rows) return "hidden";
  return VISIBILITY_BY_CELL_VALUE[fog.cells[row * fog.columns + col] ?? 0] ?? "hidden";
}

function centroidOf(points: readonly { readonly x: number; readonly y: number }[]): { x: number; y: number } {
  let x = 0;
  let y = 0;
  for (const p of points) {
    x += p.x;
    y += p.y;
  }
  return { x: x / points.length, y: y / points.length };
}

interface DiscoveryIndex {
  readonly byKey: ReadonlyMap<string, DiscoveryRecord["state"]>;
}

function indexDiscoveries(discoveries: readonly DiscoveryRecord[]): DiscoveryIndex {
  const byKey = new Map<string, DiscoveryRecord["state"]>();
  for (const record of discoveries) byKey.set(`${record.entityId}:${record.facet}`, record.state);
  return { byKey };
}

function knowledgeAtLeast(index: DiscoveryIndex, entityId: string, facet: string, minRank: number): boolean {
  const RANK: Record<string, number> = { unknown: 0, sighted: 1, observed: 2, inspected: 3, exploited: 4 };
  const state = index.byKey.get(`${entityId}:${facet}`) ?? "unknown";
  return (RANK[state] ?? 0) >= minRank;
}

function buildFogProjection(state: SimulationStateV2): FogMaskProjection {
  return {
    resolutionMeters: state.fog.resolutionMeters,
    columns: state.fog.columns,
    rows: state.fog.rows,
    originX: state.fog.originX,
    originY: state.fog.originY,
    cells: state.fog.cells.map((value) => VISIBILITY_BY_CELL_VALUE[value] ?? "hidden"),
  };
}

function buildMapEntitiesProjection(state: SimulationStateV2): MapEntitiesProjectionV2 {
  const discovery = indexDiscoveries(state.discoveries);

  const areas = Object.values(state.world.terrainAreas)
    .filter((area) => {
      const c = centroidOf(area.polygon);
      return fogStateAt(state, c.x, c.y) !== "hidden";
    })
    .map((area) => ({ id: area.id, kind: area.kind, polygon: area.polygon }));

  const lines = Object.values(state.world.linearFeatures)
    .filter((line) => {
      const c = centroidOf(line.polyline);
      return fogStateAt(state, c.x, c.y) !== "hidden";
    })
    .map((line) => ({ id: line.id, kind: line.kind, polyline: line.polyline, widthMeters: line.widthMeters }));

  const places: VisiblePlaceProjection[] = [];
  for (const place of Object.values(state.world.places)) {
    if (knowledgeAtLeast(discovery, place.id, "exterior", 2)) {
      places.push({ id: place.id, position: place.position, profileId: place.profileId, buildingId: place.buildingId, knowledge: "observed" });
    } else if (knowledgeAtLeast(discovery, place.id, "exterior", 1)) {
      places.push({ id: place.id, position: place.position, profileId: null, buildingId: place.buildingId, knowledge: "sighted" });
    }
  }

  const buildings = Object.values(state.world.buildings)
    .filter((building) => knowledgeAtLeast(discovery, building.id, "structure", 2))
    .map((building) => ({ id: building.id, placeId: building.placeId, footprint: building.footprint }));

  const rooms = Object.values(state.world.rooms)
    .filter((room) => knowledgeAtLeast(discovery, room.id, "rooms", 2))
    .map((room) => {
      const floor = state.world.floors[room.floorId];
      return { id: room.id, buildingId: floor?.buildingId ?? "", polygon: room.polygon };
    });

  const openings = Object.values(state.world.openings)
    .filter((opening) => knowledgeAtLeast(discovery, opening.id, "accesses", 2))
    .map((opening) => ({ id: opening.id, position: opening.position, connectsToExterior: opening.connectsToExterior }));

  const people = state.peopleOrder
    .map((id) => state.people[id])
    .filter((p): p is NonNullable<typeof p> => p !== undefined)
    .map((p) => ({
      personId: p.public.id,
      position: p.public.position,
      indoors: p.location.kind === "room",
      roomId: p.location.kind === "room" ? p.location.roomId : null,
    }));

  return { areas, lines, places, buildings, rooms, openings, people };
}

function buildMovementsProjection(state: SimulationStateV2): readonly MovementProjection[] {
  const movements: MovementProjection[] = [];
  for (const personId of state.peopleOrder) {
    const order = state.people[personId]?.public.activeMovementOrder;
    if (!order) continue;
    movements.push({
      personId,
      destination: order.destination,
      path: order.path,
      progressRatio: order.totalDistanceMeters === 0 ? 1 : order.travelledDistanceMeters / order.totalDistanceMeters,
      remainingDistanceMeters: Math.max(0, order.totalDistanceMeters - order.travelledDistanceMeters),
    });
  }
  return movements;
}

function buildPersonCards(state: SimulationStateV2): readonly PersonCardProjection[] {
  return state.peopleOrder.map((id) => {
    const person = state.people[id]!.public;
    return { personId: id, firstName: person.firstName, lastName: person.lastName, operationalState: person.operationalState };
  });
}

function buildPersonSheetProjectionV2(state: SimulationStateV2, personId: string): PersonSheetProjection | null {
  const person = state.people[personId];
  if (!person) return null;
  const p = person.public;
  return {
    personId: p.id,
    firstName: p.firstName,
    lastName: p.lastName,
    ageYears: p.ageYears,
    biography: p.biography,
    characteristics: p.characteristics,
    skills: p.skills,
    potentialPhraseByCharacteristic: p.potentialPhraseByCharacteristic,
    potentialPhraseBySkill: p.potentialPhraseBySkill,
    priorities: p.priorities,
    relationships: p.relationships,
    sharedEventInterpretationKey: p.sharedEventInterpretationKey,
    possessions: p.possessions,
    arrivalCondition: p.arrivalCondition,
    operationalState: p.operationalState,
    lastBlockReasonKey: p.lastBlockReasonKey,
  };
}

function buildPersonSheets(state: SimulationStateV2): Readonly<Record<string, PersonSheetProjection>> {
  const sheets: Record<string, PersonSheetProjection> = {};
  for (const id of state.peopleOrder) {
    const sheet = buildPersonSheetProjectionV2(state, id);
    if (sheet) sheets[id] = sheet;
  }
  return sheets;
}

const EVENT_MESSAGE_KEYS: Readonly<Record<DomainEventV2["type"], string>> = {
  game_created: "log.game_created",
  speed_or_pause_changed: "log.speed_or_pause_changed",
  move_order_accepted: "log.move_order_accepted",
  move_order_rejected: "log.move_order_rejected",
  movement_started: "log.movement_started",
  movement_completed: "log.movement_completed",
  movement_blocked: "log.movement_blocked",
  movement_cancelled: "log.movement_cancelled",
  priority_changed: "log.priority_changed",
  room_entered: "log.room_entered",
  room_exited: "log.room_exited",
  discovery_upgraded: "log.discovery_upgraded",
};

export function toOperationalLogEntryV2(event: DomainEventV2): OperationalLogEntryProjection {
  const params: Record<string, string> = {};
  if ("personId" in event) params.personId = event.personId;
  if ("code" in event) params.code = event.code;
  if ("priorityId" in event) params.priorityId = event.priorityId;
  if ("roomId" in event) params.roomId = event.roomId;
  if ("entityId" in event) params.entityId = event.entityId;
  if ("facet" in event) params.facet = event.facet;
  return {
    eventId: event.eventId,
    simSeconds: event.simSeconds,
    messageKey: EVENT_MESSAGE_KEYS[event.type],
    params,
  };
}

export function buildWorkerProjectionsV2(params: {
  readonly state: SimulationStateV2;
  readonly gameSaveId: string;
  readonly revision: number;
  readonly saveStatus: SaveStatus;
  readonly lastSavedSimSeconds: number | null;
  readonly operationalLog: readonly OperationalLogEntryProjection[];
}): WorkerProjectionsV2 {
  const { state } = params;
  const dayTime = toSimulatedDayTime(state.clock.elapsedSimSeconds);

  const gameSummary: GameSummaryProjection = {
    gameSaveId: params.gameSaveId,
    seed: state.seed,
    title: state.scenario.title,
  };

  return {
    gameSummary,
    clock: { day: dayTime.day, hour: dayTime.hour, minute: dayTime.minute, speed: state.clock.speed },
    saveStatus: { status: params.saveStatus, lastSavedSimSeconds: params.lastSavedSimSeconds },
    personCards: buildPersonCards(state),
    personSheets: buildPersonSheets(state),
    mapEntities: buildMapEntitiesProjection(state),
    fog: buildFogProjection(state),
    movements: buildMovementsProjection(state),
    operationalLog: params.operationalLog,
    revision: params.revision,
  };
}
