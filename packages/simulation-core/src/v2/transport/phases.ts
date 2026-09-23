import type {
  CargoRef,
  DomainEventV2,
  EntityLocation,
  Job,
  JobPhase,
  LoadBundle,
  PersonStateV2,
  SimulationStateV2,
  TransportJobState,
  TransportMethod,
  TransportRouteAccess,
  WorldPoint,
} from "@z-world/contracts";
import {
  ACTION_METHODS_BY_KEY,
  CAREFUL_LOAD_TIME_MULTIPLIER,
  FRAGILE_WHEELED_ROUGH_LOSS_PER_10M,
  NOISE_BAND_THRESHOLDS,
  NOISE_REPORT_INTERVAL_METERS,
  OBJECT_CATALOG_BY_VARIANT,
  OPENING_WIDTH_RANK,
  TRANSPORT_METHOD_DEFINITIONS_BY_METHOD,
  TRANSPORT_MEANS_VARIANT_BY_METHOD,
  TRANSPORT_PACE_NOISE,
  type TransportMethodDefinition,
} from "@z-world/catalogs";
import { nextEventId } from "../../sequences.js";
import { emit, putJob, round6, setPerson, withNextEventId, type Ctx, type EngineOps } from "../jobs/engine-ctx.js";
import { isPersonCoLocated, locationToNavPoint, resolveRoomId } from "../jobs/location-utils.js";
import { reservePerson } from "../jobs/reservations.js";
import { createJob } from "../jobs/job-factory.js";
import { isOpeningPassable } from "../room-graph.js";
import { surfaceKindAt, worldToCellV2 } from "../navigation-v2.js";
import { moveItem, pruneEmptyLoadBundle, removeFromLoadBundle, resolveHolderPersonId, storageBlockReason } from "../objects/storage.js";
import { applyUseWear } from "../objects/wear.js";
import { cargoLocation, summarizeCargo } from "./cargo.js";
import { transportCapacityOf, teamWorkFactor } from "./capacity.js";
import { cargoOriginPoint, destinationNavPoint, planTransport, requiredOpeningClass, transportTeam } from "./plan.js";
import { planRoute, type TransportRoute } from "./route.js";

/**
 * Fases logísticas reales de un traslado (S8, SET-010 §3.7, §7.6 del prompt
 * S7-S9) dentro de las fases comunes del `Job`:
 *
 * | Fase del `Job` | Paso (`TransportJobState.step`) | SET-010 §3.7 |
 * |---|---|---|
 * | `validate` | `plan` | elegir método/medio/ruta (Auto o impuesto) |
 * | `reserve` | `reserve` | (1) reservar carga, porteadoras y medio |
 * | `prepare` | `retrieve_means`, `go_to_origin` | (2) recuperar el medio, (3) ir al origen |
 * | `collect` | `load` | (4) preparar y cargar |
 * | `transport` | `traverse` | (5) recorrer la ruta, (6) atravesar accesos |
 * | `deliver` | `unload`, `deposit` | (7) descargar, (8) almacenar/entregar/instalar/transferir |
 * | `close` | `park` | (9) estacionar, devolver o abandonar el medio |
 * | `record_result` | `done` | (10) registrar y liberar reservas |
 *
 * Cada límite de fase muta ubicaciones una única vez. Cancelar o
 * interrumpir nunca devuelve carga ni medio a su origen
 * (`settleTransportOnStop`).
 */

const round3 = (value: number): number => Math.round(value * 1000) / 1000;

function transportOf(ctx: Ctx, jobId: string): { job: Job; transport: TransportJobState } | null {
  const job = ctx.state.jobs[jobId];
  if (!job?.transport) return null;
  return { job, transport: job.transport };
}

function putTransport(ctx: Ctx, jobId: string, patch: Partial<TransportJobState>): void {
  const job = ctx.state.jobs[jobId];
  if (!job?.transport) return;
  putJob(ctx, { ...job, transport: { ...job.transport, ...patch } });
}

function methodDef(method: TransportMethod): TransportMethodDefinition {
  return TRANSPORT_METHOD_DEFINITIONS_BY_METHOD.get(method)!;
}

function isWheeled(method: TransportMethod | null): method is "wheelbarrow" | "handcart" {
  return method === "wheelbarrow" || method === "handcart";
}

function primaryOf(job: Job): string | null {
  return job.assignments.find((a) => a.role === "primary_executor")?.personId ?? job.assignments[0]?.personId ?? null;
}

function carriersOf(job: Job): string[] {
  const transport = job.transport;
  if (!transport) return [];
  if (transport.carrierPersonIds.length > 0) return [...transport.carrierPersonIds];
  return job.assignments.slice(0, transport.usefulCarrierLimit).map((a) => a.personId);
}

function personPhysicalLocation(person: PersonStateV2): EntityLocation {
  return person.location.kind === "room" ? { kind: "room", roomId: person.location.roomId } : { kind: "world_point", point: person.public.position };
}

function startMoveAlong(ctx: Ctx, personId: string, jobId: string, route: TransportRoute): void {
  const person = ctx.state.people[personId];
  if (!person) return;
  const start = route.path.waypoints[0];
  const own = person.public.position;
  // Una ayudante que no está exactamente en el mismo punto se une a la ruta desde donde está: nunca se teletransporta.
  const needsPrefix = start && Math.hypot(start.x - own.x, start.y - own.y) > 1e-6;
  const waypoints = needsPrefix ? [own, ...route.path.waypoints] : [...route.path.waypoints];
  const prefix = needsPrefix && start ? Math.hypot(start.x - own.x, start.y - own.y) : 0;
  const checkpoints = route.path.locationCheckpoints.map((c) => ({ ...c, afterDistanceMeters: c.afterDistanceMeters + prefix }));
  if (needsPrefix && checkpoints[0]) checkpoints[0] = { ...checkpoints[0], afterDistanceMeters: 0 };
  setPerson(ctx, personId, {
    ...person,
    public: {
      ...person.public,
      operationalState: "moving",
      activeMovementOrder: {
        commandId: `job:${jobId}`,
        destination: waypoints[waypoints.length - 1]!,
        path: waypoints,
        totalDistanceMeters: round6(route.path.totalDistanceMeters + prefix),
        travelledDistanceMeters: 0,
        startedAtSimSeconds: ctx.state.clock.elapsedSimSeconds,
        locationCheckpoints: checkpoints,
      },
    },
  });
}

function isMovingForJob(person: PersonStateV2 | undefined, jobId: string): boolean {
  return Boolean(person?.public.activeMovementOrder && person.public.activeMovementOrder.commandId === `job:${jobId}`);
}

function coLocatedWithPoint(state: SimulationStateV2, personId: string, point: WorldPoint, roomId: string | null): boolean {
  const location: EntityLocation = roomId ? { kind: "room", roomId } : { kind: "world_point", point };
  return isPersonCoLocated(state, personId, location);
}

// --- validate: plan ---------------------------------------------------------

/**
 * Fase `validate` de un traslado: planifica con `planTransport` (Auto o
 * método impuesto), fija método, medio y parada de etapa, libera a quien no
 * cabe (sin bonificación genérica) y reserva el medio elegido.
 */
export function progressTransportValidate(ctx: Ctx, ops: EngineOps, jobId: string): void {
  const current = transportOf(ctx, jobId);
  if (!current) return;
  const plan = planTransport(ctx.state, ctx.nav, current.job);
  if ("reasonKey" in plan) {
    ops.blockJob(ctx, jobId, plan.reasonKey);
    return;
  }
  const chosen = plan.chosen;
  if (!chosen.ok) {
    ops.blockJob(ctx, jobId, chosen.reasonKey ?? "block.transport_not_viable");
    return;
  }
  putTransport(ctx, jobId, {
    method: chosen.method,
    transportMeansId: chosen.meansId,
    stagedStop: chosen.stagedStop,
    continuationMethod: chosen.continuation?.method ?? null,
    continuationMeansId: chosen.continuation?.meansId ?? null,
    requiredCarriers: Math.max(1, chosen.requiredCarriers),
    usefulCarrierLimit: Math.max(1, chosen.usefulLimit),
    routeDistanceMeters: round3(chosen.route?.path.totalDistanceMeters ?? 0),
    surfaceMeters: chosen.route?.surfaceMeters ?? { road: 0, open_ground: 0, dense_vegetation: 0, interior: 0 },
    routeAccesses: [],
    routeTravelledMeters: 0,
    planNoteKey: plan.chosenBy === "auto" ? `transport_plan.auto.${chosen.method}` : chosen.stagedStop ? "transport_plan.imposed_staged" : "transport_plan.imposed",
    step: "reserve",
    stepRemainingMinutes: 0,
  });

  // Quien no cabe o no hace falta deja el trabajo: añadir personas no concede bonificación genérica (SET-010 §3.10).
  // En un plan por etapas el equipo entero acompaña al medio: lo necesitará la etapa a pulso tras la transferencia.
  if (!chosen.stagedStop) {
    const limit = chosen.method === "hand_carry" ? Math.max(1, new Set(Object.values(chosen.allocation)).size) : Math.max(chosen.requiredCarriers, chosen.usefulLimit);
    releaseSurplusCarriers(ctx, jobId, limit);
  }

  const eventId = withNextEventId(ctx);
  emit(ctx, { type: "transport_planned", eventId, simSeconds: ctx.state.clock.elapsedSimSeconds, causedByCommandId: null, jobId, method: chosen.method, chosenBy: plan.chosenBy, transportMeansId: chosen.meansId, staged: chosen.stagedStop !== null });

  if (chosen.meansId && ops.acquireJobReservations(ctx, jobId)) {
    ops.blockJob(ctx, jobId, "block.means_reserved");
    return;
  }
  ops.completePhase(ctx, jobId);
}

function releaseSurplusCarriers(ctx: Ctx, jobId: string, limit: number): void {
  const job = ctx.state.jobs[jobId];
  if (!job) return;
  const keep = job.assignments.slice(0, Math.max(1, limit));
  const drop = job.assignments.slice(Math.max(1, limit));
  const keepIds = new Set(keep.map((a) => a.personId));
  const requested = job.requestedPersonIds.filter((id, i) => keepIds.has(id) || i < Math.max(1, limit));
  for (const assignment of drop) {
    const person = ctx.state.people[assignment.personId];
    if (person && person.activeJobId === jobId) setPerson(ctx, assignment.personId, { ...person, activeJobId: null });
    const eventId = withNextEventId(ctx);
    emit(ctx, { type: "job_assignment_changed", eventId, simSeconds: ctx.state.clock.elapsedSimSeconds, causedByCommandId: null, jobId, personId: assignment.personId, change: "removed" });
  }
  putJob(ctx, { ...ctx.state.jobs[jobId]!, assignments: keep, requestedPersonIds: requested, desiredTeamSize: Math.min(ctx.state.jobs[jobId]!.desiredTeamSize, Math.max(1, limit, requested.length)) });
}

// --- reserve ---------------------------------------------------------------

/** Fase `reserve` (paso 1): el porte coordinado exige a la vez a todas sus porteadoras; se reserva cada persona en exclusiva. */
export function progressTransportReserve(ctx: Ctx, ops: EngineOps, jobId: string): void {
  const current = transportOf(ctx, jobId);
  if (!current) return;
  const { job, transport } = current;
  const required = transport.requiredCarriers;
  if (job.assignments.length < required) {
    const teamSize = new Set([...job.assignments.map((a) => a.personId), ...job.requestedPersonIds]).size;
    if (teamSize < required) {
      ops.blockJob(ctx, jobId, "block.method_requires_more_carriers");
      return;
    }
    // Esperando a que el resto del equipo quede libre: sin cambio de estado (nada que reservar todavía).
    if (job.blockReasonKey !== "block.waiting_for_carriers") putJob(ctx, { ...job, blockReasonKey: "block.waiting_for_carriers" });
    return;
  }
  const carriers = (transport.stagedStop ? job.assignments : job.assignments.slice(0, Math.max(required, transport.usefulCarrierLimit))).map((a) => a.personId);
  for (const personId of carriers) {
    const already = Object.values(ctx.state.reservations).some((r) => r.targetKind === "person" && r.targetId === personId && r.jobId === jobId);
    if (already) continue;
    const result = reservePerson(ctx.state, ctx.state.jobs[jobId]!, personId, "reserve");
    if (!result) {
      ops.blockJob(ctx, jobId, "block.carriers_unavailable");
      return;
    }
    ctx.state = result.state;
    ctx.events.push(...result.events);
  }
  putJob(ctx, { ...ctx.state.jobs[jobId]!, blockReasonKey: null });
  putTransport(ctx, jobId, { carrierPersonIds: carriers, step: isWheeled(transport.method) ? "retrieve_means" : "go_to_origin", stepRemainingMinutes: isWheeled(transport.method) ? methodDef(transport.method).prepareMinutes : 0 });
  ops.completePhase(ctx, jobId);
}

// --- prepare: recuperar el medio e ir al origen ----------------------------

export function progressTransportPrepare(ctx: Ctx, ops: EngineOps, jobId: string): void {
  const current = transportOf(ctx, jobId);
  if (!current) return;
  const { job, transport } = current;
  const primaryId = primaryOf(job);
  if (!primaryId || !transport.method) return;
  const primary = ctx.state.people[primaryId]!;
  const def = methodDef(transport.method);

  if (transport.step === "retrieve_means" && isWheeled(transport.method) && transport.transportMeansId) {
    const means = ctx.state.transportMeans[transport.transportMeansId];
    if (!means) {
      ops.failJobCausally(ctx, jobId, "block.means_no_longer_exists");
      return;
    }
    if (resolveHolderPersonId(ctx.state, means.location) === primaryId) {
      putTransport(ctx, jobId, { step: "go_to_origin", stepRemainingMinutes: 0 });
      return;
    }
    const meansPoint = locationToNavPoint(ctx.state, means.location);
    if (!meansPoint) {
      ops.blockJob(ctx, jobId, "block.target_unreachable");
      return;
    }
    if (!isPersonCoLocated(ctx.state, primaryId, means.location)) {
      if (isMovingForJob(primary, jobId)) return;
      const route = planRoute(ctx.state, ctx.nav, primary.public.position, meansPoint, { method: null, minOpeningClass: "narrow", knownTerrainOnly: true });
      if (!route) {
        ops.blockJob(ctx, jobId, "block.no_known_route");
        return;
      }
      startMoveAlong(ctx, primaryId, jobId, route);
      return;
    }
    if (isMovingForJob(primary, jobId)) return;
    const remaining = round6(Math.max(0, transport.stepRemainingMinutes - ctx.simSecondsToAdvance / 60));
    if (remaining > 0) {
      putTransport(ctx, jobId, { stepRemainingMinutes: remaining });
      return;
    }
    // Paso 2: el medio pasa a manos de la operadora en un único límite causal.
    ctx.state = { ...ctx.state, transportMeans: { ...ctx.state.transportMeans, [means.id]: { ...means, location: { kind: "carried_by_person", personId: primaryId } } } };
    putTransport(ctx, jobId, { step: "go_to_origin", stepRemainingMinutes: 0, meansOriginLocation: means.location });
    const eventId = withNextEventId(ctx);
    emit(ctx, { type: "transport_means_retrieved", eventId, simSeconds: ctx.state.clock.elapsedSimSeconds, causedByCommandId: null, jobId, transportMeansId: means.id, personId: primaryId });
    return;
  }

  // Paso 3: todas las porteadoras útiles (y el medio con su operadora) al punto real de recogida.
  const origin = cargoOriginPoint(ctx.state, transport.cargo);
  if ("reasonKey" in origin) {
    if (origin.reasonKey === "block.target_no_longer_exists") ops.failJobCausally(ctx, jobId, origin.reasonKey);
    else ops.blockJob(ctx, jobId, origin.reasonKey);
    return;
  }
  let allThere = true;
  for (const personId of carriersOf(job)) {
    const person = ctx.state.people[personId];
    if (!person) continue;
    // Llegar es terminar el desplazamiento: nadie empieza a cargar mientras sigue caminando.
    if (isMovingForJob(person, jobId)) {
      allThere = false;
      continue;
    }
    if (coLocatedWithPoint(ctx.state, personId, origin.point, origin.roomId)) continue;
    allThere = false;
    const pushingMeans = personId === primaryId && isWheeled(transport.method);
    const route = planRoute(ctx.state, ctx.nav, person.public.position, origin.point, pushingMeans ? { method: def, minOpeningClass: def.minOpeningClass, knownTerrainOnly: true } : { method: null, minOpeningClass: "narrow", knownTerrainOnly: true });
    if (!route) {
      ops.blockJob(ctx, jobId, pushingMeans ? "block.route_incompatible_with_method" : "block.no_known_route");
      return;
    }
    startMoveAlong(ctx, personId, jobId, route);
  }
  if (!allThere) return;
  const minutes = loadingMinutes(ctx.state, ctx.state.jobs[jobId]!, def.loadMinutes);
  putTransport(ctx, jobId, { step: "load", stepRemainingMinutes: minutes });
  ops.completePhase(ctx, jobId);
}

/** Minutos de carga/descarga: atención `careful` más lenta; la cooperación real acelera con los topes 100/60/35/20. */
function loadingMinutes(state: SimulationStateV2, job: Job, baseMinutes: number): number {
  const transport = job.transport!;
  const def = methodDef(transport.method!);
  const careful = job.attention === "careful" ? CAREFUL_LOAD_TIME_MULTIPLIER : 1;
  const capacities = carriersOf(job).map((id) => (state.people[id] ? transportCapacityOf(state.people[id]!, def) : 0));
  const factor = teamWorkFactor(capacities, transport.usefulCarrierLimit);
  return round6((baseMinutes * careful) / factor);
}

// --- collect: cargar ---------------------------------------------------------

export function progressTransportLoad(ctx: Ctx, ops: EngineOps, jobId: string): void {
  const current = transportOf(ctx, jobId);
  if (!current) return;
  const { job, transport } = current;
  const primaryId = primaryOf(job);
  if (!primaryId || !transport.method) return;
  const remaining = round6(Math.max(0, transport.stepRemainingMinutes - ctx.simSecondsToAdvance / 60));
  if (remaining > 0) {
    putTransport(ctx, jobId, { stepRemainingMinutes: remaining });
    return;
  }
  const summary = summarizeCargo(ctx.state, transport.cargo);
  if (!summary) {
    ops.failJobCausally(ctx, jobId, "block.target_no_longer_exists");
    return;
  }
  const means = transport.transportMeansId ? ctx.state.transportMeans[transport.transportMeansId] : undefined;
  // Una carga que ya va montada en el medio (trabajo reanudado tras depositarla) no se vuelve a crear.
  const existing = means?.currentLoadBundleId ? ctx.state.loadBundles[means.currentLoadBundleId] : undefined;
  const bundleId = existing?.id ?? `load-bundle-s${ctx.state.sequences.nextDomainEventSequence}`;
  const carriers = carriersOf(job);
  const bundleLocation: EntityLocation = isWheeled(transport.method) && means ? { kind: "mounted_on_transport", transportId: means.id } : { kind: "carried_by_person", personId: primaryId };
  const allocation = transport.method === "hand_carry" ? handCarryAllocation(ctx, job) : {};
  const originLocation = cargoLocation(ctx.state, transport.cargo[0]!);

  let personalContainerId: string | null = null;
  if (transport.method === "personal_container") {
    const plan = planTransport(ctx.state, ctx.nav, job);
    personalContainerId = "reasonKey" in plan ? null : plan.chosen.personalContainerId;
    if (!personalContainerId) {
      ops.blockJob(ctx, jobId, "block.no_personal_container");
      return;
    }
  }

  const bundle: LoadBundle = {
    id: bundleId,
    method: transport.method,
    carriedByPersonIds: isWheeled(transport.method) ? [primaryId] : carriers,
    transportMeansId: means?.id ?? null,
    contentObjectIds: transport.cargo.filter((c) => c.kind === "world_object").map((c) => c.id),
    contentResourceLotIds: transport.cargo.filter((c) => c.kind === "resource_lot").map((c) => c.id),
    contentFurnitureIds: transport.cargo.filter((c) => c.kind === "furniture").map((c) => c.id),
    totalWeightKg: summary.totalWeightKg,
    location: bundleLocation,
    containerId: personalContainerId,
    totalVolumeLiters: summary.totalVolumeLiters,
    bulk: summary.bulk,
    handlingTags: summary.handlingTags,
    minCarriers: summary.minCarriers,
    lowestContentCondition: summary.lowestCondition === null ? null : round6(summary.lowestCondition),
    state: "loaded",
    jobId,
    originLocation: existing?.originLocation ?? originLocation,
    allocation,
  };
  ctx.state = { ...ctx.state, loadBundles: { ...ctx.state.loadBundles, [bundleId]: bundle } };
  for (const ref of transport.cargo) placeCargo(ctx, ref, personalContainerId ? { kind: "container", containerId: personalContainerId } : { kind: "in_load_bundle", loadBundleId: bundleId });
  if (means) ctx.state = { ...ctx.state, transportMeans: { ...ctx.state.transportMeans, [means.id]: { ...ctx.state.transportMeans[means.id]!, currentLoadBundleId: bundleId } } };
  for (const personId of bundle.carriedByPersonIds) {
    const person = ctx.state.people[personId];
    if (person) setPerson(ctx, personId, { ...person, carriedLoadBundleId: bundleId });
  }
  putTransport(ctx, jobId, { loadBundleId: bundleId, step: "traverse", stepRemainingMinutes: 0, routeAccesses: [], routeTravelledMeters: 0 });
  const eventId = withNextEventId(ctx);
  emit(ctx, { type: "load_prepared", eventId, simSeconds: ctx.state.clock.elapsedSimSeconds, causedByCommandId: null, jobId, loadBundleId: bundleId, method: transport.method, totalWeightKg: summary.totalWeightKg, carrierPersonIds: [...bundle.carriedByPersonIds] });
  ops.completePhase(ctx, jobId);
}

function handCarryAllocation(ctx: Ctx, job: Job): Record<string, string> {
  const plan = planTransport(ctx.state, ctx.nav, job);
  if ("reasonKey" in plan) return {};
  return { ...plan.chosen.allocation };
}

/** Mueve un elemento de carga a su nueva ubicación manteniendo contenedores, cargas y mobiliario coherentes. */
function placeCargo(ctx: Ctx, ref: CargoRef, next: EntityLocation): void {
  if (ref.kind === "furniture") {
    const furniture = ctx.state.furniture[ref.id];
    if (!furniture) return;
    let state = ctx.state;
    const previous = furniture.movedToLocation;
    if (previous?.kind === "in_load_bundle" && !(next.kind === "in_load_bundle" && next.loadBundleId === previous.loadBundleId)) {
      state = removeFromLoadBundle(state, previous.loadBundleId, ref.id);
    }
    // El contenedor que materializa el mueble viaja con él (sigue siendo su contenido).
    let containers = state.containers;
    if (furniture.containerId && containers[furniture.containerId]) {
      containers = { ...containers, [furniture.containerId]: { ...containers[furniture.containerId]!, location: { kind: "on_object", objectId: furniture.id } } };
    }
    state = { ...state, containers, furniture: { ...state.furniture, [furniture.id]: { ...furniture, movedToLocation: next } } };
    ctx.state = previous?.kind === "in_load_bundle" ? pruneEmptyLoadBundle(state, previous.loadBundleId) : state;
    return;
  }
  ctx.state = moveItem(ctx.state, { kind: ref.kind, id: ref.id }, next);
}

// --- transport: recorrer la ruta y atravesar accesos ------------------------

function legEnd(state: SimulationStateV2, transport: TransportJobState): { point: WorldPoint; roomId: string | null } | null {
  if (transport.stagedStop) return { point: transport.stagedStop.point, roomId: transport.stagedStop.roomId };
  const point = destinationNavPoint(state, transport.destination);
  if (!point) return null;
  const roomId =
    transport.destination.kind === "container"
      ? resolveRoomId(state, state.containers[transport.destination.containerId]?.location ?? { kind: "world_point", point })
      : transport.destination.kind === "room"
        ? transport.destination.roomId
        : null;
  return { point, roomId };
}

function noiseBandFor(perMeter: number): "quiet" | "audible" | "loud" {
  if (perMeter >= NOISE_BAND_THRESHOLDS.loud) return "loud";
  if (perMeter >= NOISE_BAND_THRESHOLDS.audible) return "audible";
  return "quiet";
}

/** Superficie bajo una persona (interior si está en una estancia). */
export function surfaceUnder(ctx: Pick<Ctx, "state" | "nav">, person: PersonStateV2): "road" | "open_ground" | "dense_vegetation" | "interior" {
  if (person.location.kind === "room") return "interior";
  const cell = worldToCellV2(ctx.nav.grid, person.public.position);
  if (!cell) return "open_ground";
  return surfaceKindAt(ctx.nav.grid, cell.row * ctx.nav.grid.columns + cell.col);
}

export function progressTransportTraverse(ctx: Ctx, ops: EngineOps, jobId: string): void {
  const current = transportOf(ctx, jobId);
  if (!current) return;
  const { job, transport } = current;
  const primaryId = primaryOf(job);
  if (!primaryId || !transport.method) return;
  const primary = ctx.state.people[primaryId]!;
  const def = methodDef(transport.method);
  const end = legEnd(ctx.state, transport);
  if (!end) {
    ops.failJobCausally(ctx, jobId, "block.target_no_longer_exists");
    return;
  }
  const carriers = isWheeled(transport.method) ? [primaryId, ...carriersOf(job).filter((id) => id !== primaryId)] : carriersOf(job);

  // Arranque de la etapa cargada: ruta real con la anchura del método y de la carga, solo por terreno conocido.
  if (transport.routeAccesses.length === 0 && transport.routeTravelledMeters === 0 && !isMovingForJob(primary, jobId) && !coLocatedWithPoint(ctx.state, primaryId, end.point, end.roomId)) {
    const summary = summarizeCargo(ctx.state, transport.cargo);
    const minOpening = summary ? requiredOpeningClass(def, summary) : def.minOpeningClass;
    const route = planRoute(ctx.state, ctx.nav, primary.public.position, end.point, { method: def, minOpeningClass: minOpening, knownTerrainOnly: true });
    if (!route) {
      ops.blockJob(ctx, jobId, "block.route_incompatible_with_method");
      return;
    }
    for (const personId of carriers) startMoveAlong(ctx, personId, jobId, route);
    const accesses: TransportRouteAccess[] = route.accesses.map((a) => ({ openingId: a.openingId, atMeters: a.atMeters, crossed: false }));
    putTransport(ctx, jobId, { routeAccesses: accesses, routeDistanceMeters: round3(route.path.totalDistanceMeters), surfaceMeters: route.surfaceMeters, routeTravelledMeters: 0.000001 });
    const bundleId = transport.loadBundleId;
    if (bundleId && ctx.state.loadBundles[bundleId]) ctx.state = { ...ctx.state, loadBundles: { ...ctx.state.loadBundles, [bundleId]: { ...ctx.state.loadBundles[bundleId]!, state: "in_transit" } } };
    return;
  }

  // Progreso de la porteadora principal sobre la ruta: ruido por tramos y accesos al alcanzarlos.
  const order = ctx.state.people[primaryId]!.public.activeMovementOrder;
  const progress = order && order.commandId === `job:${jobId}` ? order.travelledDistanceMeters : transport.routeDistanceMeters;
  const previous = Math.max(0, transport.routeTravelledMeters);
  const delta = Math.max(0, progress - previous);
  const surface = surfaceUnder(ctx, ctx.state.people[primaryId]!);
  const behaviour = def.surfaces[surface] ?? { speed: 0.3, noisePerMeter: 1.5, effort: 2.5 };
  const noisePerMeter = behaviour.noisePerMeter * TRANSPORT_PACE_NOISE[job.pace];
  let noiseUnits = round6(transport.noiseUnits + delta * noisePerMeter);
  let nextReport = transport.nextNoiseReportAtMeters;
  const travelledLoaded = round6(transport.travelledLoadedMeters + delta);
  // Ruido y exposición a lo largo de la ruta (SET-010 §3.10): un registro por tramo recorrido, no por tick ni solo al final.
  while (travelledLoaded >= nextReport + NOISE_REPORT_INTERVAL_METERS) {
    nextReport = round6(nextReport + NOISE_REPORT_INTERVAL_METERS);
    const eventId = withNextEventId(ctx);
    const p = ctx.state.people[primaryId]!.public.position;
    emit(ctx, { type: "transport_noise_emitted", eventId, simSeconds: ctx.state.clock.elapsedSimSeconds, causedByCommandId: null, jobId, point: { x: round6(p.x), y: round6(p.y) }, band: noiseBandFor(noisePerMeter), metersTravelled: round3(travelledLoaded) });
  }
  noiseUnits = round6(noiseUnits);
  const fatigueUnits = round6(transport.fatigueUnits + (delta * behaviour.effort * carriers.length) / 100);

  const accesses = [...transport.routeAccesses];
  const cargoSummary = summarizeCargo(ctx.state, transport.cargo);
  const minRank = OPENING_WIDTH_RANK[cargoSummary ? requiredOpeningClass(def, cargoSummary) : def.minOpeningClass];
  for (let i = 0; i < accesses.length; i++) {
    const access = accesses[i]!;
    if (access.crossed) continue;
    const opening = ctx.state.world.openings[access.openingId];
    // El movimiento se detiene medio metro antes de un acceso intransitable: alcanzarlo es llegar a ese punto.
    if (access.atMeters > progress + 0.5 + 1e-6) break;
    const passable = opening !== undefined && isOpeningPassable(access.openingId, ctx.state.world) && OPENING_WIDTH_RANK[opening.widthClass] >= minRank;
    if (passable && access.atMeters > progress + 1e-6) break;
    if (!passable) {
      // Obstáculo descubierto durante el recorrido: evento, posiciones conservadas, carga depositada donde está y trabajo a replantear.
      putTransport(ctx, jobId, { noiseUnits, nextNoiseReportAtMeters: nextReport, travelledLoadedMeters: travelledLoaded, routeTravelledMeters: progress, fatigueUnits });
      const eventId = withNextEventId(ctx);
      emit(ctx, { type: "transport_route_blocked", eventId, simSeconds: ctx.state.clock.elapsedSimSeconds, causedByCommandId: null, jobId, openingId: access.openingId, reasonKey: "block.route_obstructed" });
      ops.blockJob(ctx, jobId, "block.route_obstructed");
      return;
    }
    accesses[i] = { ...access, crossed: true };
    const eventId = withNextEventId(ctx);
    emit(ctx, { type: "access_traversed", eventId, simSeconds: ctx.state.clock.elapsedSimSeconds, causedByCommandId: null, jobId, openingId: access.openingId, loadBundleId: transport.loadBundleId });
  }
  putTransport(ctx, jobId, { routeAccesses: accesses, noiseUnits, nextNoiseReportAtMeters: nextReport, travelledLoadedMeters: travelledLoaded, routeTravelledMeters: round6(Math.max(progress, 0.000001)), fatigueUnits });

  const everyoneStopped = carriers.every((id) => !isMovingForJob(ctx.state.people[id], jobId));
  if (!everyoneStopped) return;
  if (!coLocatedWithPoint(ctx.state, primaryId, end.point, end.roomId)) {
    // Se detuvieron antes de llegar sin obstáculo: replantear la ruta desde aquí (nunca teletransportar).
    putTransport(ctx, jobId, { routeAccesses: [], routeTravelledMeters: 0 });
    return;
  }
  applyFragileWear(ctx, jobId);
  const updated = ctx.state.jobs[jobId]!;
  putTransport(ctx, jobId, { step: "unload", stepRemainingMinutes: loadingMinutes(ctx.state, updated, def.unloadMinutes) });
  ops.completePhase(ctx, jobId);
}

/** Conservación de la carga (§7.3): lo frágil en un medio con ruedas sobre terreno irregular pierde condición; con atención `careful`, la mitad. */
function applyFragileWear(ctx: Ctx, jobId: string): void {
  const job = ctx.state.jobs[jobId];
  const transport = job?.transport;
  if (!job || !transport || !isWheeled(transport.method)) return;
  const rough = transport.surfaceMeters.open_ground + transport.surfaceMeters.dense_vegetation;
  if (rough <= 0) return;
  const loss = (rough / 10) * FRAGILE_WHEELED_ROUGH_LOSS_PER_10M * (job.attention === "careful" ? 0.5 : 1);
  for (const ref of transport.cargo) {
    if (ref.kind !== "world_object") continue;
    const obj = ctx.state.worldObjects[ref.id];
    if (!obj || !obj.handlingTags.includes("fragile")) continue;
    ctx.state = { ...ctx.state, worldObjects: { ...ctx.state.worldObjects, [obj.id]: { ...obj, condition: round6(Math.max(0, obj.condition - loss)) } } };
  }
}

// --- deliver: descargar y almacenar/entregar/instalar/transferir -----------

export function progressTransportDeliver(ctx: Ctx, ops: EngineOps, jobId: string): void {
  const current = transportOf(ctx, jobId);
  if (!current) return;
  const { job, transport } = current;
  const primaryId = primaryOf(job);
  if (!primaryId || !transport.method) return;
  const remaining = round6(Math.max(0, transport.stepRemainingMinutes - ctx.simSecondsToAdvance / 60));
  if (remaining > 0) {
    putTransport(ctx, jobId, { stepRemainingMinutes: remaining, step: "unload" });
    return;
  }
  const bundleId = transport.loadBundleId;
  const primary = ctx.state.people[primaryId]!;

  if (transport.stagedStop) {
    deliverToTransferPoint(ctx, jobId, primary);
  } else {
    const destination = transport.destination;
    if (destination.kind === "container") {
      const container = ctx.state.containers[destination.containerId];
      if (!container) {
        ops.failJobCausally(ctx, jobId, "block.target_no_longer_exists");
        return;
      }
      // Capacidad real: si algo no cabe, la carga sigue en manos de quien la lleva (nunca sobrecarga en silencio).
      for (const ref of transport.cargo) {
        if (ref.kind === "furniture") {
          ops.blockJob(ctx, jobId, "block.container_incompatible");
          return;
        }
        const reason = storageBlockReason(ctx.state, container, ref);
        if (reason && reason !== "block.container_full" && reason !== "block.item_already_stored") {
          ops.blockJob(ctx, jobId, reason);
          return;
        }
      }
      for (const ref of transport.cargo) {
        if (ref.kind === "furniture") continue;
        const reason = storageBlockReason(ctx.state, ctx.state.containers[destination.containerId]!, ref);
        if (reason === "block.container_full") {
          ops.blockJob(ctx, jobId, "block.container_full");
          return;
        }
        if (reason === "block.item_already_stored") continue;
        dropFromBundle(ctx, ref, transport.loadBundleId);
        ctx.state = moveItem(ctx.state, { kind: ref.kind, id: ref.id }, { kind: "container", containerId: destination.containerId });
        const eventId = withNextEventId(ctx);
        emit(ctx, { type: "object_stored", eventId, simSeconds: ctx.state.clock.elapsedSimSeconds, causedByCommandId: null, objectId: ref.id, entityKind: ref.kind, containerId: destination.containerId, jobId });
        if (ref.kind === "resource_lot") ops.mergeStoredLotIntoContainer(ctx, ref.id, destination.containerId, jobId);
      }
    } else {
      const location: EntityLocation =
        destination.kind === "room"
          ? { kind: "room", roomId: destination.roomId }
          : destination.kind === "transfer_point"
            ? { kind: "transfer_point", transferPointId: destination.transferPointId }
            : personPhysicalLocation(primary);
      for (const ref of transport.cargo) {
        dropFromBundle(ctx, ref, transport.loadBundleId);
        placeCargo(ctx, ref, location);
      }
    }
    if (bundleId) {
      const eventId = withNextEventId(ctx);
      emit(ctx, {
        type: "load_delivered",
        eventId,
        simSeconds: ctx.state.clock.elapsedSimSeconds,
        causedByCommandId: null,
        jobId,
        loadBundleId: bundleId,
        destinationKind: destination.kind,
        destinationId: destination.kind === "container" ? destination.containerId : destination.kind === "room" ? destination.roomId : destination.kind === "transfer_point" ? destination.transferPointId : null,
      });
    }
  }
  if (bundleId) ctx.state = pruneEmptyLoadBundle(ctx.state, bundleId);
  applyMeansWear(ctx, jobId);
  putTransport(ctx, jobId, { step: "park", stepRemainingMinutes: 0, routeAccesses: ctx.state.jobs[jobId]!.transport!.routeAccesses });
  ops.completePhase(ctx, jobId);
}

/** Saca un elemento de la carga (lista y contenedor personal) sin moverlo todavía de sitio. */
function dropFromBundle(ctx: Ctx, ref: CargoRef, bundleId: string | null): void {
  if (!bundleId) return;
  const bundle = ctx.state.loadBundles[bundleId];
  if (!bundle) return;
  // En el porte con recipiente personal el contenido vive en el contenedor real: la carga solo lo lista.
  if (bundle.containerId) ctx.state = removeFromLoadBundle(ctx.state, bundleId, ref.id);
}

function deliverToTransferPoint(ctx: Ctx, jobId: string, primary: PersonStateV2): void {
  const job = ctx.state.jobs[jobId]!;
  const transport = job.transport!;
  const stop = transport.stagedStop!;
  const transferPointId = `transfer-point-s${ctx.state.sequences.nextDomainEventSequence}`;
  const opening = ctx.state.world.openings[stop.openingId];
  const closure = opening?.installedClosureId ? ctx.state.world.installedClosures[opening.installedClosureId] : undefined;
  const kind = closure?.kind === "gate" || opening?.widthClass === "gate" ? "perimeter_gate" : "building_access";
  ctx.state = {
    ...ctx.state,
    transferPoints: {
      ...ctx.state.transferPoints,
      [transferPointId]: {
        id: transferPointId,
        location: personPhysicalLocation(primary),
        labelKey: kind === "perimeter_gate" ? "transfer_point.gate" : opening?.widthClass === "wide" ? "transfer_point.loading_access" : "transfer_point.building_access",
        kind,
        openingId: stop.openingId,
        createdByJobId: jobId,
        createdAtSimSeconds: ctx.state.clock.elapsedSimSeconds,
      },
    },
  };
  for (const ref of transport.cargo) {
    dropFromBundle(ctx, ref, transport.loadBundleId);
    placeCargo(ctx, ref, { kind: "transfer_point", transferPointId });
  }

  // Descarga física → nueva reserva/porte: la etapa siguiente es un trabajo propio (SET-010 §3.8, §7.8).
  const def = ACTION_METHODS_BY_KEY.get("transport")!;
  const created = createJob(ctx.state, {
    actionKey: "transport",
    def,
    target: cargoTarget(transport.cargo[0]!),
    origin: job.origin,
    causingCommandOrDesignationId: job.causingCommandOrDesignationId,
    directOrder: job.directOrder,
    requestedPersonIds: job.requestedPersonIds.length > 0 ? job.requestedPersonIds : job.assignments.map((a) => a.personId),
    pace: job.pace,
    attention: job.attention,
    urgency: job.urgency,
  });
  let nextJobId: string | null = null;
  if (!("rejectedReasonKey" in created)) {
    const continuation = transport.continuationMethod;
    const nextTransport: TransportJobState = {
      ...emptyTransportState(transport.cargo, transport.destination),
      requestedMethod: continuation ?? "auto",
      requestedMeansId: continuation ? transport.continuationMeansId : null,
      manualOnly: continuation === null,
      meansDisposition: transport.meansDisposition,
      previousJobId: jobId,
    };
    ctx.state = { ...ctx.state, sequences: created.sequences, jobs: { ...ctx.state.jobs, [created.job.id]: { ...created.job, transport: nextTransport } } };
    ctx.events.push(...created.events);
    nextJobId = created.job.id;
  }
  putTransport(ctx, jobId, { transferPointId, nextJobId });
  const eventId = withNextEventId(ctx);
  emit(ctx, { type: "load_transferred", eventId, simSeconds: ctx.state.clock.elapsedSimSeconds, causedByCommandId: null, jobId, transferPointId, nextJobId });
}

export function cargoTarget(ref: CargoRef): Job["target"] {
  if (ref.kind === "world_object") return { kind: "world_object", worldObjectId: ref.id };
  if (ref.kind === "resource_lot") return { kind: "resource_lot", resourceLotId: ref.id };
  return { kind: "furniture", furnitureId: ref.id };
}

/** Estado inicial de un traslado recién ordenado (antes de planificar). */
export function emptyTransportState(cargo: readonly CargoRef[], destination: TransportJobState["destination"]): TransportJobState {
  return {
    requestedMethod: "auto",
    method: null,
    requestedMeansId: null,
    transportMeansId: null,
    cargo: [...cargo],
    destination,
    stagedStop: null,
    transferPointId: null,
    step: "plan",
    stepRemainingMinutes: 0,
    meansDisposition: "park_at_destination",
    meansOriginLocation: null,
    loadBundleId: null,
    carrierPersonIds: [],
    requiredCarriers: 1,
    usefulCarrierLimit: 1,
    routeAccesses: [],
    routeDistanceMeters: 0,
    surfaceMeters: { road: 0, open_ground: 0, dense_vegetation: 0, interior: 0 },
    travelledLoadedMeters: 0,
    routeTravelledMeters: 0,
    noiseUnits: 0,
    nextNoiseReportAtMeters: 0,
    fatigueUnits: 0,
    previousJobId: null,
    nextJobId: null,
    planNoteKey: null,
    manualOnly: false,
    continuationMethod: null,
    continuationMeansId: null,
  };
}

/** Desgaste determinista por uso del medio (S7 `applyUseWear`, catálogo): una avería durante el uso es causal. */
function applyMeansWear(ctx: Ctx, jobId: string): void {
  const transport = ctx.state.jobs[jobId]?.transport;
  if (!transport?.transportMeansId || !isWheeled(transport.method)) return;
  const means = ctx.state.transportMeans[transport.transportMeansId];
  if (!means) return;
  const wear = OBJECT_CATALOG_BY_VARIANT.get(means.variant || TRANSPORT_MEANS_VARIANT_BY_METHOD[means.method])?.wear;
  if (!wear) return;
  const worn = applyUseWear(means, wear);
  const entity = worn.brokeDown ? { ...worn.entity, knownEvidenceIds: [...worn.entity.knownEvidenceIds, `broke_down@${ctx.state.clock.elapsedSimSeconds}`] } : worn.entity;
  ctx.state = { ...ctx.state, transportMeans: { ...ctx.state.transportMeans, [means.id]: entity } };
  if (worn.brokeDown) {
    const eventId = withNextEventId(ctx);
    emit(ctx, { type: "object_broke_down", eventId, simSeconds: ctx.state.clock.elapsedSimSeconds, causedByCommandId: null, objectId: means.id, entityKind: "transport_means", jobId, reasonKey: "worn_out" });
  }
}

// --- close: estacionar, devolver o abandonar el medio ----------------------

export function progressTransportClose(ctx: Ctx, ops: EngineOps, jobId: string): void {
  const current = transportOf(ctx, jobId);
  if (!current) return;
  const { job, transport } = current;
  const primaryId = primaryOf(job);
  if (!primaryId) return;
  const means = transport.transportMeansId ? ctx.state.transportMeans[transport.transportMeansId] : undefined;
  if (!means || resolveHolderPersonId(ctx.state, means.location) !== primaryId) {
    putTransport(ctx, jobId, { step: "done" });
    ops.completePhase(ctx, jobId);
    return;
  }
  const primary = ctx.state.people[primaryId]!;
  const def = methodDef(means.method);
  const origin = transport.meansOriginLocation ? locationToNavPoint(ctx.state, transport.meansOriginLocation) : null;
  const returning = transport.meansDisposition === "return_to_origin" && transport.stagedStop === null && origin !== null;
  if (returning && origin && Math.hypot(primary.public.position.x - origin.x, primary.public.position.y - origin.y) > 3) {
    if (isMovingForJob(primary, jobId)) return;
    const route = planRoute(ctx.state, ctx.nav, primary.public.position, origin, { method: def, minOpeningClass: def.minOpeningClass, knownTerrainOnly: true });
    if (route && transport.stepRemainingMinutes === 0) {
      startMoveAlong(ctx, primaryId, jobId, route);
      putTransport(ctx, jobId, { stepRemainingMinutes: 1 });
      return;
    }
  }
  if (isMovingForJob(primary, jobId)) return;
  ctx.state = { ...ctx.state, transportMeans: { ...ctx.state.transportMeans, [means.id]: { ...ctx.state.transportMeans[means.id]!, location: personPhysicalLocation(ctx.state.people[primaryId]!) } } };
  const eventId = withNextEventId(ctx);
  emit(ctx, { type: "transport_means_parked", eventId, simSeconds: ctx.state.clock.elapsedSimSeconds, causedByCommandId: null, jobId, transportMeansId: means.id, disposition: returning ? "returned" : "parked" });
  putTransport(ctx, jobId, { step: "done", stepRemainingMinutes: 0 });
  ops.completePhase(ctx, jobId);
}

// --- cancelar, interrumpir, bloquear: posiciones causales -------------------

/**
 * Asienta físicamente un traslado que se detiene (SET-010 §3.7: «interrumpir
 * no devuelve mágicamente carga y medio a sus posiciones iniciales»):
 *
 * - las porteadoras se detienen donde están (sin movimiento pendiente);
 * - a pulso, cada porteadora sigue sosteniendo lo que llevaba; en porte
 *   coordinado la carga se deposita de forma segura donde está la
 *   principal; en recipiente personal sigue dentro del recipiente;
 * - en carretilla/carro la carga sigue montada en el medio, y el medio
 *   queda donde lo dejó su operadora (abandonado);
 * - `mode = "block"` o `"interrupt"` devuelven el trabajo a `validate` para
 *   replantearlo desde las posiciones reales; `"cancel"` no.
 *
 * Las reservas las libera el llamador con `releaseJobReservations`.
 */
export function settleTransportOnStop(
  state: SimulationStateV2,
  jobId: string,
  reasonKey: string,
  mode: "cancel" | "interrupt" | "block",
  removedPersonId: string | null = null,
): { state: SimulationStateV2; events: DomainEventV2[] } {
  const job = state.jobs[jobId];
  const transport = job?.transport;
  if (!job || !transport) return { state, events: [] };
  const events: DomainEventV2[] = [];
  let next = state;
  const pushEvent = (build: (eventId: string) => DomainEventV2): void => {
    const { eventId, sequences } = nextEventId(next.sequences);
    next = { ...next, sequences };
    events.push(build(eventId));
  };

  const involved = new Set([...job.assignments.map((a) => a.personId), ...transport.carrierPersonIds]);
  for (const personId of [...involved].sort()) {
    const person = next.people[personId];
    if (!person) continue;
    if (person.public.activeMovementOrder?.commandId === `job:${jobId}`) {
      next = { ...next, people: { ...next.people, [personId]: { ...person, public: { ...person.public, activeMovementOrder: null, operationalState: "awaiting_orders" } } } };
    }
  }

  const primaryId = job.assignments.find((a) => a.role === "primary_executor")?.personId ?? job.assignments[0]?.personId ?? transport.carrierPersonIds[0] ?? null;
  const primary = primaryId ? next.people[primaryId] : undefined;
  const bundle = transport.loadBundleId ? next.loadBundles[transport.loadBundleId] : undefined;
  if (bundle) {
    const onMeans = bundle.location.kind === "mounted_on_transport";
    if (onMeans) {
      next = { ...next, loadBundles: { ...next.loadBundles, [bundle.id]: { ...bundle, state: "deposited", jobId: mode === "cancel" ? null : jobId } } };
    } else if (bundle.containerId) {
      // Recipiente personal: el contenido sigue dentro del recipiente real que la persona lleva.
      let s = next;
      for (const id of [...bundle.contentObjectIds, ...bundle.contentResourceLotIds]) s = removeFromLoadBundle(s, bundle.id, id);
      next = pruneEmptyLoadBundle(s, bundle.id);
    } else {
      const dropLocation: EntityLocation | null = primary ? personPhysicalLocation(primary) : bundle.originLocation;
      let s = next;
      for (const ref of transport.cargo) {
        const holder = bundle.allocation[ref.id] && s.people[bundle.allocation[ref.id]!] && bundle.allocation[ref.id] !== removedPersonId ? bundle.allocation[ref.id]! : null;
        const target: EntityLocation = bundle.method === "hand_carry" && holder ? { kind: "carried_by_person", personId: holder } : (dropLocation ?? { kind: "world_point", point: { x: 0, y: 0 } });
        if (ref.kind === "furniture") {
          const furniture = s.furniture[ref.id];
          if (!furniture) continue;
          s = removeFromLoadBundle(s, bundle.id, ref.id);
          s = { ...s, furniture: { ...s.furniture, [ref.id]: { ...furniture, movedToLocation: target } } };
        } else if ((ref.kind === "world_object" ? s.worldObjects[ref.id] : s.resourceLots[ref.id])?.location.kind === "in_load_bundle") {
          s = moveItem(s, { kind: ref.kind, id: ref.id }, target);
        }
      }
      next = pruneEmptyLoadBundle(s, bundle.id);
    }
    pushEvent((eventId) => ({ type: "load_deposited", eventId, simSeconds: next.clock.elapsedSimSeconds, causedByCommandId: null, jobId, loadBundleId: bundle.id, reasonKey, onTransportMeans: onMeans }));
  }

  const means = transport.transportMeansId ? next.transportMeans[transport.transportMeansId] : undefined;
  if (means && means.location.kind === "carried_by_person") {
    const operator = next.people[means.location.personId];
    const where = operator ? personPhysicalLocation(operator) : (transport.meansOriginLocation ?? means.location);
    next = { ...next, transportMeans: { ...next.transportMeans, [means.id]: { ...means, location: where } } };
    pushEvent((eventId) => ({ type: "transport_means_parked", eventId, simSeconds: next.clock.elapsedSimSeconds, causedByCommandId: null, jobId, transportMeansId: means.id, disposition: "abandoned" }));
  }

  for (const personId of [...involved].sort()) {
    const person = next.people[personId];
    if (person && person.carriedLoadBundleId === transport.loadBundleId && transport.loadBundleId && !next.loadBundles[transport.loadBundleId]) {
      next = { ...next, people: { ...next.people, [personId]: { ...person, carriedLoadBundleId: null } } };
    }
  }

  const current = next.jobs[jobId]!;
  const stillBundled = current.transport?.loadBundleId && next.loadBundles[current.transport.loadBundleId] ? current.transport.loadBundleId : null;
  if (mode === "cancel") {
    next = { ...next, jobs: { ...next.jobs, [jobId]: { ...current, transport: { ...current.transport!, loadBundleId: stillBundled } } } };
  } else {
    // Replantear desde las posiciones reales: vuelta a `validate`, sin tocar lo ya ocurrido.
    const phases: JobPhase[] = current.phases.map((p) => ({ ...p, state: "pending" }));
    phases[0] = { ...phases[0]!, state: "active" };
    next = {
      ...next,
      jobs: {
        ...next.jobs,
        [jobId]: {
          ...current,
          phases,
          currentPhaseIndex: 0,
          transport: { ...current.transport!, step: "plan", loadBundleId: stillBundled, carrierPersonIds: [], routeAccesses: [], routeTravelledMeters: 0, stepRemainingMinutes: 0, stagedStop: null },
        },
      },
    };
  }
  return { state: next, events };
}

/** ¿Sigue vigente el bloqueo de un traslado? Se replantea como mucho una vez por minuto simulado (evita A* por tick). */
export function transportBlockerStillApplies(ctx: Ctx, job: Job): boolean {
  if (!job.transport) return false;
  if (ctx.state.clock.elapsedSimSeconds - job.updatedAtSimSeconds < 60) return true;
  if (job.blockReasonKey === "block.method_requires_more_carriers" || job.blockReasonKey === "block.carriers_unavailable") {
    const team = transportTeam(ctx.state, job);
    return team.length < job.transport.requiredCarriers;
  }
  const plan = planTransport(ctx.state, ctx.nav, job);
  if ("reasonKey" in plan) return true;
  return !plan.chosen.ok;
}

/** Punto (si lo hay) donde una transferencia dejó la carga: útil para proyecciones. */
export function transportLegEndPoint(state: SimulationStateV2, job: Job): WorldPoint | null {
  if (!job.transport) return null;
  return legEnd(state, job.transport)?.point ?? null;
}

export { isWheeled };
