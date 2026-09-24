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
import { toSimulatedDayTime, effectiveTerrainCoverage } from "@z-world/contracts";
import { ACTION_METHODS_BY_KEY } from "@z-world/catalogs";
import { buildInventoryProjection, buildObjectActionOptions, buildObjectKnowledge, buildTransportActionOption, buildTransportJobProjection, derivePossessions, knownConsumableLots } from "./build-object-projections-v2.js";
import { buildBuildingInspectTargets, buildBuildingsProjection, buildExploitationActionOptions, buildInstallDestinations } from "./build-exploitation-projections-v2.js";
import { isBuildingTerminal, isOpeningPassable } from "@z-world/simulation-core";

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
    .map((area) => ({ id: area.id, kind: area.kind, polygon: area.polygon, coverage: effectiveTerrainCoverage(area) }));

  const lines = Object.values(state.world.linearFeatures)
    .filter((line) => {
      const c = centroidOf(line.polyline);
      return fogStateAt(state, c.x, c.y) !== "hidden";
    })
    .map((line) => ({ id: line.id, kind: line.kind, polyline: line.polyline, widthMeters: line.widthMeters, wayState: line.wayState }));

  // S10: parcelas de cultivo y tramos de barrera son terreno de primera clase, visibles como el resto en cuanto la
  // niebla los alcanza (sin omnisciencia de contenido: el panel contextual filtra qué acciones se ofrecen).
  const cultivationPlots = Object.values(state.cultivationPlots)
    .map((plot) => ({ plot, parcel: state.world.parcels[plot.parcelId] }))
    .filter((entry): entry is { plot: (typeof entry)["plot"]; parcel: NonNullable<(typeof entry)["parcel"]> } => entry.parcel !== undefined)
    .filter((entry) => fogStateAt(state, centroidOf(entry.parcel.polygon).x, centroidOf(entry.parcel.polygon).y) !== "hidden")
    .map((entry) => ({ id: entry.plot.id, polygon: entry.parcel.polygon, state: entry.plot.state }));

  const barrierSegments = Object.values(state.world.barrierSegments)
    .map((segment) => ({ segment, from: state.world.anchors[segment.fromAnchorId], to: state.world.anchors[segment.toAnchorId] }))
    .filter((entry): entry is { segment: (typeof entry)["segment"]; from: NonNullable<(typeof entry)["from"]>; to: NonNullable<(typeof entry)["to"]> } => entry.from !== undefined && entry.to !== undefined)
    .map((entry) => ({
      id: entry.segment.id,
      from: entry.from.position,
      to: entry.to.position,
      built: entry.segment.built,
      crossesWay: entry.segment.crossesWayId !== null,
      wayCrossingMode: entry.segment.wayCrossingMode,
    }));

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
    .map((building) => {
      // S9: un edificio desmantelado o demolido se dibuja como solar/escombros, nunca como edificio en pie.
      const structureState = state.world.buildingFabrics?.[building.id]?.structureState;
      const terminal = structureState === "demolished" || structureState === "dismantled" ? structureState : null;
      return { id: building.id, placeId: building.placeId, footprint: building.footprint, terminal };
    });

  const rooms = Object.values(state.world.rooms)
    .filter((room) => knowledgeAtLeast(discovery, room.id, "rooms", 2))
    .map((room) => {
      const floor = state.world.floors[room.floorId];
      return { id: room.id, buildingId: floor?.buildingId ?? "", polygon: room.polygon };
    })
    .filter((room) => !isBuildingTerminal(state.world, room.buildingId || null));

  const openings = Object.values(state.world.openings)
    .filter((opening) => knowledgeAtLeast(discovery, opening.id, "accesses", 2))
    .filter((opening) => {
      const floor = opening.connectsRoomId ? state.world.floors[state.world.rooms[opening.connectsRoomId]?.floorId ?? ""] : undefined;
      return !isBuildingTerminal(state.world, floor?.buildingId ?? null);
    })
    .map((opening) => ({ id: opening.id, position: opening.position, connectsToExterior: opening.connectsToExterior, passable: isOpeningPassable(opening.id, state.world) }));

  const people = state.peopleOrder
    .map((id) => state.people[id])
    .filter((p): p is NonNullable<typeof p> => p !== undefined)
    .map((p) => ({
      personId: p.public.id,
      position: p.public.position,
      indoors: p.location.kind === "room",
      roomId: p.location.kind === "room" ? p.location.roomId : null,
    }));

  return { areas, lines, places, buildings, rooms, openings, people, cultivationPlots, barrierSegments };
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
    possessions: derivePossessions(state, personId),
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
  object_broke_down: "log.object_broke_down",
  installation_tested: "log.installation_tested",
  water_drawn: "log.water_drawn",
  resource_lot_deteriorated: "log.resource_lot_deteriorated",
  transport_planned: "log.transport_planned",
  transport_means_retrieved: "log.transport_means_retrieved",
  load_prepared: "log.load_prepared",
  access_traversed: "log.access_traversed",
  transport_route_blocked: "log.transport_route_blocked",
  transport_noise_emitted: "log.transport_noise_emitted",
  load_delivered: "log.load_delivered",
  load_transferred: "log.load_transferred",
  load_deposited: "log.load_deposited",
  transport_means_parked: "log.transport_means_parked",
  access_changed: "log.access_changed",
  installation_surveyed: "log.installation_surveyed",
  installation_disconnected: "log.installation_disconnected",
  installation_dismantled: "log.installation_dismantled",
  finish_recovered: "log.finish_recovered",
  structure_dismantled: "log.structure_dismantled",
  building_demolished: "log.building_demolished",
  building_life_stage_changed: "log.building_life_stage_changed",
  building_layer_exhausted: "log.building_layer_exhausted",
  object_uninstalled: "log.object_uninstalled",
  object_installed: "log.object_installed",
  way_state_changed: "log.way_state_changed",
  barrier_segment_built: "log.barrier_segment_built",
  terrain_coverage_cleared: "log.terrain_coverage_cleared",
  cultivation_plot_state_changed: "log.cultivation_plot_state_changed",
  crop_sown: "log.crop_sown",
  crop_tended: "log.crop_tended",
  crop_harvested: "log.crop_harvested",
  crop_lost: "log.crop_lost",
};

export function toOperationalLogEntryV2(event: DomainEventV2): OperationalLogEntryProjection {
  const params: Record<string, string> = {};
  if ("personId" in event) params.personId = event.personId;
  if ("code" in event) params.code = event.code;
  if ("priorityId" in event) params.priorityId = event.priorityId;
  if ("roomId" in event) params.roomId = event.roomId;
  if ("entityId" in event) params.entityId = event.entityId;
  if ("facet" in event) params.facet = event.facet;
  if (event.type === "access_changed") params.change = event.change;
  if (event.type === "building_layer_exhausted") params.layer = event.layer;
  if (event.type === "building_life_stage_changed") params.lifeStage = event.lifeStage;
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
      ...(job.transport ? { transport: buildTransportJobProjection(state, job) } : {}),
    }));
}

function buildZonesProjection(state: SimulationStateV2): readonly ZoneProjection[] {
  return Object.values(state.workZones).map((z) => ({ id: z.id, policy: z.policy, polygon: z.polygon }));
}

function buildDesignationsProjection(state: SimulationStateV2): readonly DesignationProjection[] {
  return Object.values(state.designations).map((d) => ({ id: d.id, kind: d.kind, cancelled: d.cancelled, generatedJobCount: d.generatedJobIds.length }));
}

/** Etiqueta de una estancia ya observada por su función visible (S7: distinguir el dormitorio de la cocina al registrar), o genérica si no tiene programa. */
function roomLabelKey(room: { readonly programRoleKey: string | null }): string {
  return room.programRoleKey ? `room_role.${room.programRoleKey}` : "target.room";
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

  const inspectTargets: ContextualActionTargetProjection[] = [
    ...Object.values(state.world.rooms)
      .filter((r) => hasFacetAtLeast(r.id, "rooms", RANK, 2) && !isBuildingTerminal(state.world, state.world.floors[r.floorId]?.buildingId ?? null))
      .map((r) => ({ target: { kind: "room", roomId: r.id } as JobTarget, labelKey: roomLabelKey(r), blockedReasonKey: null })),
    // S9: inspeccionar un edificio revela su estructura (época, materiales, etapas), requisito para desmantelarlo o demolerlo.
    ...buildBuildingInspectTargets(state),
  ];
  if (inspectTargets.length > 0) options.push({ actionKey: "inspect", labelKey: "action.inspect.label", targets: inspectTargets });

  const registerTargets: ContextualActionTargetProjection[] = Object.values(state.world.rooms)
    .filter((r) => hasFacetAtLeast(r.id, "rooms", RANK, 2) && !isBuildingTerminal(state.world, state.world.floors[r.floorId]?.buildingId ?? null))
    .map((r) => ({ target: { kind: "room", roomId: r.id } as JobTarget, labelKey: roomLabelKey(r), blockedReasonKey: null }));
  if (registerTargets.length > 0) options.push({ actionKey: "register", labelKey: "action.register.label", targets: registerTargets });

  // Consumibles conocidos (S6, ampliado en S7): los que lleva alguien —también dentro de su mochila o su
  // cantimplora—, los de estancias con contenido registrado y los de un exterior a la vista.
  const knowledge = buildObjectKnowledge(state);
  const drinkTargets = knownConsumableLots(state, knowledge, ["water"]);
  if (drinkTargets.length > 0) options.push({ actionKey: "drink", labelKey: "action.drink.label", targets: drinkTargets });
  const eatTargets = knownConsumableLots(state, knowledge, ["fresh_food", "preserved_food"]);
  if (eatTargets.length > 0) options.push({ actionKey: "eat", labelKey: "action.eat.label", targets: eatTargets });

  const restTargets: ContextualActionTargetProjection[] = Object.values(state.world.rooms)
    .filter((r) => discoveryByEntity.has(r.id) && !isBuildingTerminal(state.world, state.world.floors[r.floorId]?.buildingId ?? null))
    .map((r) => ({ target: { kind: "room", roomId: r.id } as JobTarget, labelKey: "target.room_rest", blockedReasonKey: null }));
  if (restTargets.length > 0) options.push({ actionKey: "rest", labelKey: "action.rest.label", targets: restTargets });

  // Objetos, contenedores e instalaciones de S7 (recoger, almacenar, retirar, reparar, desmontar,
  // probar instalación, extraer agua): misma regla de conocimiento que el inventario localizado.
  options.push(...buildObjectActionOptions(state, knowledge));

  // Traslados (S8): carga conocida, destinos con capacidad real, medios conocidos y selector Auto/método.
  const transportOption = buildTransportActionOption(state, knowledge);
  if (transportOption) {
    // S9: «instalar» como destino real del traslado (puerta hacia una abertura sin cierre, bomba hacia una fuente sin bomba).
    const transport = transportOption.transport ? { ...transportOption.transport, destinations: [...transportOption.transport.destinations, ...buildInstallDestinations(state)] } : transportOption.transport;
    options.push({ ...transportOption, ...(transport ? { transport } : {}) });
  }

  // S9: accesos, instalaciones, acabados y estructura (explotación progresiva por capas).
  options.push(...buildExploitationActionOptions(state, knowledge));

  // S10: ciclo agrícola (preparar/sembrar/cuidar/cosechar sobre una parcela ya existente) y carreteras mutables. La
  // limpieza de cobertura y la construcción de barrera se disparan por designación de área/línea (§6.2 del prompt de
  // subhito: "las designaciones deben generar trabajos... no ejecutar transformaciones instantáneas"), no aquí.
  options.push(...buildAgricultureActionOptions(state));
  options.push(...buildRoadActionOptions(state));

  return options;
}

function cultivationPlotLabelKey(plotState: string): string {
  return `cultivation_state.${plotState}`;
}

function buildAgricultureActionOptions(state: SimulationStateV2): ContextualActionOptionProjection[] {
  const options: ContextualActionOptionProjection[] = [];
  const byState: Record<string, ContextualActionTargetProjection[]> = { unprepared: [], cleared: [], prepared: [], sown: [], growing: [], harvestable: [] };
  for (const plot of Object.values(state.cultivationPlots)) {
    const bucket = byState[plot.state];
    if (!bucket) continue;
    bucket.push({ target: { kind: "cultivation_plot", cultivationPlotId: plot.id }, labelKey: cultivationPlotLabelKey(plot.state), blockedReasonKey: null });
  }
  const prepareTargets = [...byState.unprepared!, ...byState.cleared!];
  if (prepareTargets.length > 0) options.push({ actionKey: "prepare_soil", labelKey: "action.prepare_soil.label", targets: prepareTargets });
  if (byState.prepared!.length > 0) options.push({ actionKey: "sow", labelKey: "action.sow.label", targets: byState.prepared! });
  const tendTargets = [...byState.sown!, ...byState.growing!];
  if (tendTargets.length > 0) options.push({ actionKey: "tend_crop", labelKey: "action.tend_crop.label", targets: tendTargets });
  if (byState.harvestable!.length > 0) options.push({ actionKey: "harvest", labelKey: "action.harvest.label", targets: byState.harvestable! });
  return options;
}

function buildRoadActionOptions(state: SimulationStateV2): ContextualActionOptionProjection[] {
  const options: ContextualActionOptionProjection[] = [];
  const obstructed: ContextualActionTargetProjection[] = [];
  const removable: ContextualActionTargetProjection[] = [];
  for (const line of Object.values(state.world.linearFeatures)) {
    if (line.kind !== "road" || !line.wayState) continue;
    const target: JobTarget = { kind: "linear_feature", linearFeatureId: line.id };
    if (line.wayState === "obstructed") obstructed.push({ target, labelKey: `way_state.${line.wayState}`, blockedReasonKey: null });
    if (line.wayState !== "function_removed") removable.push({ target, labelKey: `way_state.${line.wayState}`, blockedReasonKey: null });
  }
  if (obstructed.length > 0) options.push({ actionKey: "clear_road", labelKey: "action.clear_road.label", targets: obstructed });
  if (removable.length > 0) options.push({ actionKey: "remove_way_function", labelKey: "action.remove_way_function.label", targets: removable, irreversible: true });
  return options;
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
    inventory: buildInventoryProjection(state, buildObjectKnowledge(state)),
    buildings: buildBuildingsProjection(state),
    revision: params.revision,
  };
}
