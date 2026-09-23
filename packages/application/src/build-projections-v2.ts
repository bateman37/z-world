import type {
  ContextualActionOptionProjection,
  ContextualActionTargetProjection,
  DesignationProjection,
  DiscoveryRecord,
  DomainEventV2,
  FogMaskProjection,
  GameSummaryProjection,
  JobProjection,
  JobTarget,
  MapEntitiesProjectionV2,
  MovementProjection,
  OperationalLogEntryProjection,
  PersonCardProjection,
  PersonNeedProjection,
  PersonSheetProjection,
  SaveStatus,
  SimulationStateV2,
  VisibilityState,
  VisiblePlaceProjection,
  WorkerProjectionsV2,
  ZoneProjection,
} from "@z-world/contracts";
import { toSimulatedDayTime, furnitureLocation } from "@z-world/contracts";
import { ACTION_METHODS_BY_KEY } from "@z-world/catalogs";

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
  job_created: "log.job_created",
  job_state_changed: "log.job_state_changed",
  job_phase_changed: "log.job_phase_changed",
  job_assignment_changed: "log.job_assignment_changed",
  reservation_created: "log.reservation_created",
  reservation_released: "log.reservation_released",
  work_episode_created: "log.work_episode_created",
  need_changed: "log.need_changed",
  consumption_happened: "log.consumption_happened",
  rest_progressed: "log.rest_progressed",
  systemic_intention_created: "log.systemic_intention_created",
  work_interrupted: "log.work_interrupted",
  zone_changed: "log.zone_changed",
  designation_changed: "log.designation_changed",
  object_collected: "log.object_collected",
  object_stored: "log.object_stored",
  object_retrieved: "log.object_retrieved",
  object_repaired: "log.object_repaired",
  object_disassembled: "log.object_disassembled",
  resource_lot_consumed: "log.resource_lot_consumed",
  resource_lot_split: "log.resource_lot_split",
  resource_lot_merged: "log.resource_lot_merged",
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

function buildNeedsProjection(state: SimulationStateV2): Readonly<Record<string, readonly PersonNeedProjection[]>> {
  const result: Record<string, readonly PersonNeedProjection[]> = {};
  for (const id of state.peopleOrder) {
    const person = state.people[id];
    if (!person) continue;
    result[id] = person.needs.map((n) => ({ dimension: n.dimension, band: n.band }));
  }
  return result;
}

function buildJobsProjection(state: SimulationStateV2): readonly JobProjection[] {
  const def = ACTION_METHODS_BY_KEY;
  return Object.values(state.jobs)
    .sort((a, b) => (a.createdAtSimSeconds - b.createdAtSimSeconds) || (a.id < b.id ? -1 : 1))
    .map((job) => ({
      id: job.id,
      actionKey: job.actionKey,
      labelKey: def.get(job.actionKey)?.labelKey ?? job.actionKey,
      effectivePriority: job.effectivePriority,
      state: job.state,
      phaseKind: job.phases[job.currentPhaseIndex]?.kind ?? null,
      progressRatio: job.progressRatio,
      assignedPersonIds: job.assignments.map((a) => a.personId),
      blockReasonKey: job.blockReasonKey,
      directOrder: job.directOrder,
      target: job.target,
    }));
}

function buildZonesProjection(state: SimulationStateV2): readonly ZoneProjection[] {
  return Object.values(state.workZones).map((z) => ({ id: z.id, policy: z.policy, polygon: z.polygon }));
}

function buildDesignationsProjection(state: SimulationStateV2): readonly DesignationProjection[] {
  return Object.values(state.designations).map((d) => ({ id: d.id, kind: d.kind, cancelled: d.cancelled, generatedJobCount: d.generatedJobIds.length }));
}

/**
 * Acciones contextuales legítimamente disponibles (§10.3 de WEB-002): una
 * acción conocida pero bloqueada aparece con motivo causal; una no
 * reconocida simplemente no aparece en la lista de blancos. Filtrado
 * conservador y honesto para este alcance: no expone contenido, riesgo ni
 * dificultad — solo qué blanco existe y si hoy es viable.
 */
function buildContextualActionsProjection(state: SimulationStateV2): readonly ContextualActionOptionProjection[] {
  const discoveryByEntity = new Map<string, DiscoveryRecord[]>();
  for (const record of state.discoveries) {
    const list = discoveryByEntity.get(record.entityId) ?? [];
    list.push(record);
    discoveryByEntity.set(record.entityId, list);
  }
  const hasFacetAtLeast = (entityId: string, facet: DiscoveryRecord["facet"], rankOf: Record<string, number>, minRank: number): boolean => {
    const record = (discoveryByEntity.get(entityId) ?? []).find((r) => r.facet === facet);
    return record !== undefined && (rankOf[record.state] ?? 0) >= minRank;
  };
  const RANK: Record<string, number> = { unknown: 0, sighted: 1, observed: 2, inspected: 3, exploited: 4 };

  const options: ContextualActionOptionProjection[] = [];

  // El perfil (`place.RES-10`, etc.) nunca se muestra en `recognize`/`observe`:
  // ambos actúan precisamente antes de que el perfil se considere observado
  // (§5.5/§10.3 de WEB-002 — el visor ya oculta `profileId` hasta entonces,
  // ver `VisiblePlaceProjection`), así que el blanco se etiqueta de forma
  // genérica por posición hasta que la propia acción lo revele.
  const recognizeTargets: ContextualActionTargetProjection[] = Object.values(state.world.places)
    .filter((p) => hasFacetAtLeast(p.id, "exterior", RANK, 1) && !hasFacetAtLeast(p.id, "exterior", RANK, 2))
    .map((p) => ({ target: { kind: "place", placeId: p.id } as JobTarget, labelKey: "target.unidentified_place", blockedReasonKey: null }));
  if (recognizeTargets.length > 0) options.push({ actionKey: "recognize", labelKey: "action.recognize.label", targets: recognizeTargets });

  const observeTargets: ContextualActionTargetProjection[] = Object.values(state.world.places)
    .filter((p) => hasFacetAtLeast(p.id, "exterior", RANK, 1) && !hasFacetAtLeast(p.id, "exterior", RANK, 2))
    .map((p) => ({ target: { kind: "place", placeId: p.id } as JobTarget, labelKey: "target.unidentified_place", blockedReasonKey: null }));
  if (observeTargets.length > 0) options.push({ actionKey: "observe", labelKey: "action.observe.label", targets: observeTargets });

  const inspectTargets: ContextualActionTargetProjection[] = Object.values(state.world.rooms)
    .filter((r) => hasFacetAtLeast(r.id, "rooms", RANK, 2))
    .map((r) => ({ target: { kind: "room", roomId: r.id } as JobTarget, labelKey: "target.room", blockedReasonKey: null }));
  if (inspectTargets.length > 0) options.push({ actionKey: "inspect", labelKey: "action.inspect.label", targets: inspectTargets });

  const registerTargets: ContextualActionTargetProjection[] = Object.values(state.world.rooms)
    .filter((r) => hasFacetAtLeast(r.id, "rooms", RANK, 2))
    .map((r) => ({ target: { kind: "room", roomId: r.id } as JobTarget, labelKey: "target.room", blockedReasonKey: null }));
  if (registerTargets.length > 0) options.push({ actionKey: "register", labelKey: "action.register.label", targets: registerTargets });

  const knownRoomIds = new Set(Object.values(state.world.rooms).filter((r) => discoveryByEntity.has(r.id)).map((r) => r.id));
  const lotTargets = (family: "water" | "fresh_food" | "preserved_food"): ContextualActionTargetProjection[] =>
    Object.values(state.resourceLots)
      .filter((lot) => lot.family === family && lot.quantity > 0)
      .filter((lot) => lot.location.kind === "carried_by_person" || resourceLotRoomKnown(state, lot, knownRoomIds))
      .map((lot) => ({ target: { kind: "resource_lot", resourceLotId: lot.id } as JobTarget, labelKey: `resource.${lot.family}`, blockedReasonKey: lot.reservedByJobId ? "block.resource_reserved" : null }));

  const drinkTargets = lotTargets("water");
  if (drinkTargets.length > 0) options.push({ actionKey: "drink", labelKey: "action.drink.label", targets: drinkTargets });
  const eatTargets = [...lotTargets("fresh_food"), ...lotTargets("preserved_food")];
  if (eatTargets.length > 0) options.push({ actionKey: "eat", labelKey: "action.eat.label", targets: eatTargets });

  const restTargets: ContextualActionTargetProjection[] = Object.values(state.world.rooms)
    .filter((r) => discoveryByEntity.has(r.id))
    .map((r) => ({ target: { kind: "room", roomId: r.id } as JobTarget, labelKey: "target.room_rest", blockedReasonKey: null }));
  if (restTargets.length > 0) options.push({ actionKey: "rest", labelKey: "action.rest.label", targets: restTargets });

  // Objetos y mobiliario reconocidos (S7, §15.7/§16 del prompt S7-S9): la
  // sala que los contiene debe tener el facet `content` al menos
  // `inspected` (revelado por `register`), igual que exige
  // `ACTION_METHODS_BY_KEY.get("collect").requiredKnowledge`.
  const roomOf = (location: { kind: string; roomId?: string }): string | null => (location.kind === "room" && location.roomId ? location.roomId : null);
  const knownContentRoomIds = new Set(Object.values(state.world.rooms).filter((r) => hasFacetAtLeast(r.id, "content", RANK, 3)).map((r) => r.id));

  const collectTargets: ContextualActionTargetProjection[] = Object.values(state.worldObjects)
    .filter((o) => {
      const roomId = roomOf(o.location);
      return roomId !== null && knownContentRoomIds.has(roomId);
    })
    .map((o) => ({ target: { kind: "world_object", worldObjectId: o.id } as JobTarget, labelKey: `object.${o.variant}`, blockedReasonKey: o.ownerOrReservedByJobId ? "block.object_reserved" : null }));
  if (collectTargets.length > 0) options.push({ actionKey: "collect", labelKey: "action.collect.label", targets: collectTargets });

  const transformableTargets = (profileField: "repairProfileId" | "disassemblyProfileId"): ContextualActionTargetProjection[] => {
    const fromObjects: ContextualActionTargetProjection[] = Object.values(state.worldObjects)
      .filter((o) => o[profileField] !== null && (() => { const r = roomOf(o.location); return r !== null && knownContentRoomIds.has(r); })())
      .map((o) => ({ target: { kind: "world_object", worldObjectId: o.id } as JobTarget, labelKey: `object.${o.variant}`, blockedReasonKey: null }));
    const fromFurniture: ContextualActionTargetProjection[] = Object.values(state.furniture)
      .filter((f) => f[profileField] !== null && (() => { const r = roomOf(furnitureLocation(f)); return r !== null && knownContentRoomIds.has(r); })())
      .map((f) => ({ target: { kind: "furniture", furnitureId: f.id } as JobTarget, labelKey: `object.${f.variant || f.kind}`, blockedReasonKey: null }));
    return [...fromObjects, ...fromFurniture];
  };

  const repairTargets = transformableTargets("repairProfileId");
  if (repairTargets.length > 0) options.push({ actionKey: "repair", labelKey: "action.repair.label", targets: repairTargets });

  const disassemblyTargets = transformableTargets("disassemblyProfileId");
  if (disassemblyTargets.length > 0) {
    options.push({ actionKey: "disassemble_selective", labelKey: "action.disassemble_selective.label", targets: disassemblyTargets });
    options.push({ actionKey: "disassemble_destructive", labelKey: "action.disassemble_destructive.label", targets: disassemblyTargets });
  }

  return options;
}

function resourceLotRoomKnown(state: SimulationStateV2, lot: { readonly location: { readonly kind: string; readonly containerId?: string; readonly roomId?: string } }, knownRoomIds: ReadonlySet<string>): boolean {
  if (lot.location.kind === "room" && lot.location.roomId) return knownRoomIds.has(lot.location.roomId);
  if (lot.location.kind === "container" && lot.location.containerId) {
    const container = state.containers[lot.location.containerId];
    if (container && container.location.kind === "room") return knownRoomIds.has(container.location.roomId);
  }
  return false;
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
    needsByPerson: buildNeedsProjection(state),
    jobs: buildJobsProjection(state),
    zones: buildZonesProjection(state),
    designations: buildDesignationsProjection(state),
    contextualActions: buildContextualActionsProjection(state),
    revision: params.revision,
  };
}
