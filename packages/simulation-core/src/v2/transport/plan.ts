import type {
  CargoRef,
  EntityLocation,
  Job,
  PersonStateV2,
  SimulationStateV2,
  TransportDestination,
  TransportMeans,
  TransportMethod,
  TransportStagedStop,
  WorldPoint,
} from "@z-world/contracts";
import {
  AUTO_SCORE_WEIGHTS,
  BULK_RANK,
  OPENING_WIDTH_RANK,
  TRANSPORT_METHOD_DEFINITIONS_BY_METHOD,
  type OpeningWidthClass,
  type SurfaceKind,
  type TransportMethodDefinition,
} from "@z-world/catalogs";
import { TRANSPORT_METHODS } from "@z-world/contracts";
import type { NavigationIndexV2 } from "../room-graph.js";
import { cellToWorldCenterV2, nearestWalkableCellV2 } from "../navigation-v2.js";
import { BASE_WALK_SPEED_METERS_PER_SIM_SECOND_V2 } from "../constants.js";
import { isContainerUsable, resolveHolderPersonId, storageBlockReason, storageUnitsForItem, containerFreeUnits } from "../objects/storage.js";
import { locationToNavPoint, resolveRoomId } from "../jobs/location-utils.js";
import { valuesById } from "../ordered.js";
import { cargoItemBlockReason, cargoLocation, summarizeCargo, type CargoSummary } from "./cargo.js";
import { coordinatedTeamKg, personCarryKg, usefulCarrierLimit } from "./capacity.js";
import { isLocationKnown, isRoomKnown, planRoute, zonePolicyAtPoint, type TransportRoute } from "./route.js";

/**
 * Selección de método y plan de un traslado (S8, SET-010 §3.9, §7.9 del
 * prompt S7-S9). `Auto` compara, con información conocida, tiempo, fatiga,
 * ruido, accesos, terreno, conservación y disponibilidad/condición del
 * medio; nunca usa un medio oculto ni inexistente. Un método impuesto se
 * evalúa igual y, si no es viable, devuelve su motivo causal.
 */

export interface MethodEvaluation {
  readonly method: TransportMethod;
  readonly meansId: string | null;
  readonly ok: boolean;
  readonly reasonKey: string | null;
  readonly score: number;
  readonly estimatedMinutes: number;
  readonly route: TransportRoute | null;
  readonly stagedStop: TransportStagedStop | null;
  readonly continuation: { readonly method: TransportMethod; readonly meansId: string | null } | null;
  readonly requiredCarriers: number;
  readonly usefulLimit: number;
  readonly allocation: Readonly<Record<string, string>>;
  readonly personalContainerId: string | null;
}

export interface TransportPlanContext {
  readonly state: SimulationStateV2;
  readonly nav: NavigationIndexV2;
  readonly cargo: readonly CargoRef[];
  readonly summary: CargoSummary;
  readonly team: readonly PersonStateV2[];
  readonly primary: PersonStateV2;
  readonly origin: WorldPoint;
  readonly destination: TransportDestination;
  readonly destinationPoint: WorldPoint;
}

const round3 = (value: number): number => Math.round(value * 1000) / 1000;

function failed(method: TransportMethod, reasonKey: string, meansId: string | null = null): MethodEvaluation {
  return { method, meansId, ok: false, reasonKey, score: Infinity, estimatedMinutes: Infinity, route: null, stagedStop: null, continuation: null, requiredCarriers: 1, usefulLimit: 1, allocation: {}, personalContainerId: null };
}

/** Punto de navegación de un destino, o `null` si ya no existe. */
export function destinationNavPoint(state: SimulationStateV2, destination: TransportDestination): WorldPoint | null {
  switch (destination.kind) {
    case "container": {
      const container = state.containers[destination.containerId];
      return container ? locationToNavPoint(state, container.location) : null;
    }
    case "room":
      return locationToNavPoint(state, { kind: "room", roomId: destination.roomId });
    case "world_point":
      return destination.point;
    case "transfer_point": {
      const point = state.transferPoints[destination.transferPointId];
      return point ? locationToNavPoint(state, point.location) : null;
    }
    default: {
      const exhaustive: never = destination;
      throw new Error(`Destino no reconocido: ${JSON.stringify(exhaustive)}`);
    }
  }
}

export function destinationLocation(state: SimulationStateV2, destination: TransportDestination): EntityLocation | null {
  switch (destination.kind) {
    case "container": {
      const container = state.containers[destination.containerId];
      return container ? container.location : null;
    }
    case "room":
      return state.world.rooms[destination.roomId] ? { kind: "room", roomId: destination.roomId } : null;
    case "world_point":
      return { kind: "world_point", point: destination.point };
    case "transfer_point":
      return state.transferPoints[destination.transferPointId] ? { kind: "transfer_point", transferPointId: destination.transferPointId } : null;
    default: {
      const exhaustive: never = destination;
      throw new Error(`Destino no reconocido: ${JSON.stringify(exhaustive)}`);
    }
  }
}

/** Motivo por el que el destino no es válido (existe, se conoce, tiene capacidad real), o `null`. */
export function destinationBlockReason(state: SimulationStateV2, destination: TransportDestination, cargo: readonly CargoRef[]): string | null {
  switch (destination.kind) {
    case "container": {
      const container = state.containers[destination.containerId];
      if (!container) return "block.target_no_longer_exists";
      if (!isContainerUsable(state, container)) return "block.container_unusable";
      if (resolveHolderPersonId(state, container.location)) return "block.destination_carried_container";
      if (!isLocationKnown(state, container.location)) return "block.destination_unknown";
      let units = 0;
      for (const ref of cargo) {
        if (ref.kind === "furniture") return "block.container_incompatible";
        const reason = storageBlockReason(state, container, ref);
        if (reason && reason !== "block.container_full") return reason;
        units += storageUnitsForItem(state, ref) ?? 0;
      }
      return containerFreeUnits(state, container) < units ? "block.container_full" : null;
    }
    case "room":
      if (!state.world.rooms[destination.roomId]) return "block.target_no_longer_exists";
      return isRoomKnown(state, destination.roomId) ? null : "block.destination_unknown";
    case "world_point":
      return zonePolicyAtPoint(state, destination.point) === "forbidden" ? "block.target_in_forbidden_zone" : null;
    case "transfer_point":
      return state.transferPoints[destination.transferPointId] ? null : "block.target_no_longer_exists";
    default: {
      const exhaustive: never = destination;
      throw new Error(`Destino no reconocido: ${JSON.stringify(exhaustive)}`);
    }
  }
}

/** Punto de recogida común de la carga: todos los elementos deben estar juntos (misma estancia o a ≤ 6 m). */
export function cargoOriginPoint(state: SimulationStateV2, cargo: readonly CargoRef[]): { point: WorldPoint; roomId: string | null } | { reasonKey: string } {
  let origin: { point: WorldPoint; roomId: string | null } | null = null;
  let heldOrigin: { point: WorldPoint; roomId: string | null } | null = null;
  for (const ref of cargo) {
    const location = cargoLocation(state, ref);
    if (!location) return { reasonKey: "block.target_no_longer_exists" };
    // Lo que ya sostiene alguien viaja con esa persona: no condiciona el punto de recogida del resto.
    const holder = resolveHolderPersonId(state, location);
    if (holder) {
      const person = state.people[holder];
      if (person && !heldOrigin) heldOrigin = { point: person.public.position, roomId: person.location.kind === "room" ? person.location.roomId : null };
      continue;
    }
    const point = locationToNavPoint(state, location);
    if (!point) return { reasonKey: "block.target_unreachable" };
    const roomId = resolveRoomId(state, location);
    if (!origin) {
      origin = { point, roomId };
      continue;
    }
    if (origin.roomId !== roomId) return { reasonKey: "block.cargo_not_together" };
    if (roomId === null && Math.hypot(point.x - origin.point.x, point.y - origin.point.y) > 6) return { reasonKey: "block.cargo_not_together" };
  }
  return origin ?? heldOrigin ?? { reasonKey: "block.no_cargo_selected" };
}

function surfaceSpeed(def: TransportMethodDefinition | null, surface: SurfaceKind): number {
  if (!def) return 1;
  return def.surfaces[surface]?.speed ?? 0.3;
}

/** Minutos, fatiga y ruido estimados de recorrer una ruta (solo datos conocidos del catálogo y del terreno ya visto). */
export function routeCost(route: TransportRoute, def: TransportMethodDefinition | null, carriers: number): { minutes: number; fatigue: number; noise: number; roughMeters: number } {
  let seconds = 0;
  let fatigue = 0;
  let noise = 0;
  for (const surface of ["road", "open_ground", "dense_vegetation", "interior"] as const) {
    const meters = route.surfaceMeters[surface];
    if (meters <= 0) continue;
    seconds += meters / (BASE_WALK_SPEED_METERS_PER_SIM_SECOND_V2 * surfaceSpeed(def, surface));
    const behaviour = def?.surfaces[surface];
    fatigue += (meters * (behaviour?.effort ?? 1) * carriers) / 100;
    noise += meters * (behaviour?.noisePerMeter ?? 0.05);
  }
  return { minutes: seconds / 60, fatigue, noise, roughMeters: route.surfaceMeters.open_ground + route.surfaceMeters.dense_vegetation };
}

/** Anchura mínima de acceso que exigen la carga y el método juntos. */
export function requiredOpeningClass(def: TransportMethodDefinition, summary: CargoSummary): OpeningWidthClass {
  if (def.method === "hand_carry") {
    // Cada porteadora lleva su parte: un bulto «grande» (una caja) ya exige puerta normal; lo pequeño/mediano pasa por una estrecha.
    const anyLarge = summary.items.some((i) => BULK_RANK[i.bulk] >= BULK_RANK.large);
    return anyLarge ? "normal" : "narrow";
  }
  if (def.method === "personal_container") return "narrow";
  return def.minOpeningClass;
}

/** Reparto de un porte a pulso en equipo: cada elemento a una sola porteadora (el más pesado a quien más margen tiene). */
function allocateHandCarry(ctx: TransportPlanContext, def: TransportMethodDefinition): { allocation: Record<string, string>; carriers: number } | { reasonKey: string } {
  const remaining = ctx.team.map((p) => ({ personId: p.public.id, kg: personCarryKg(p, def), liters: def.maxVolumeLiters }));
  const allocation: Record<string, string> = {};
  const items = [...ctx.summary.items].sort((a, b) => b.weightKg - a.weightKg || (a.ref.id < b.ref.id ? -1 : 1));
  for (const item of items) {
    if (BULK_RANK[item.bulk] > BULK_RANK[def.maxBulk]) return { reasonKey: "block.load_too_bulky_for_method" };
    // Lo que ya lleva alguien del equipo sigue con esa persona.
    const holder = resolveHolderPersonId(ctx.state, cargoLocation(ctx.state, item.ref)!);
    const candidates = holder && remaining.some((r) => r.personId === holder) ? remaining.filter((r) => r.personId === holder) : [...remaining].sort((a, b) => b.kg - a.kg || (a.personId < b.personId ? -1 : 1));
    const slot = candidates.find((r) => r.kg + 1e-9 >= item.weightKg && r.liters + 1e-9 >= item.volumeLiters);
    if (!slot) {
      const anyoneCould = ctx.team.some((p) => personCarryKg(p, def) >= item.weightKg);
      if (!anyoneCould) return { reasonKey: "block.load_too_heavy_for_method" };
      if (item.volumeLiters > def.maxVolumeLiters) return { reasonKey: "block.load_too_bulky_for_method" };
      return { reasonKey: "block.load_exceeds_team_capacity" };
    }
    slot.kg -= item.weightKg;
    slot.liters -= item.volumeLiters;
    allocation[item.ref.id] = slot.personId;
  }
  return { allocation, carriers: new Set(Object.values(allocation)).size || 1 };
}

/** Recipiente/equipamiento personal utilizable que lleva la principal (mochila, saco, caja) y en el que cabe toda la carga. */
function personalContainerFor(ctx: TransportPlanContext): { containerId: string } | { reasonKey: string } {
  const carried = valuesById(ctx.state.worldObjects).filter(
    (o) => o.containerId && o.location.kind === "carried_by_person" && o.location.personId === ctx.primary.public.id && o.functionalState !== "parts_only",
  );
  let lastReason = "block.no_personal_container";
  for (const obj of carried) {
    const container = ctx.state.containers[obj.containerId!];
    if (!container || !isContainerUsable(ctx.state, container)) continue;
    let units = 0;
    let reason: string | null = null;
    for (const ref of ctx.cargo) {
      if (ref.kind === "furniture" || (ref.kind === "world_object" && ref.id === obj.id)) {
        reason = "block.container_incompatible";
        break;
      }
      const r = storageBlockReason(ctx.state, container, ref);
      if (r && r !== "block.container_full" && r !== "block.item_already_stored") {
        reason = r;
        break;
      }
      if (r !== "block.item_already_stored") units += storageUnitsForItem(ctx.state, ref) ?? 0;
    }
    if (!reason && containerFreeUnits(ctx.state, container) < units) reason = "block.container_full";
    if (!reason) return { containerId: container.id };
    lastReason = reason;
  }
  return { reasonKey: lastReason };
}

/** Motivo por el que un medio concreto no puede usarse hoy para esta carga, o `null`. */
export function meansBlockReason(state: SimulationStateV2, means: TransportMeans, jobId: string | null, cargo: readonly CargoRef[], summary: CargoSummary | null): string | null {
  if (!isLocationKnown(state, means.location)) return "block.means_unknown";
  if (means.functionalState === "parts_only") return "block.means_not_functional";
  if (!means.functions.includes("hauling") || (means.functionalState !== "functional" && means.functionalState !== "degraded")) return "block.means_not_functional";
  const reservedByOther = Object.values(state.reservations).some((r) => r.targetKind === "transport_means" && r.targetId === means.id && r.jobId !== jobId);
  if (reservedByOther) return "block.means_reserved";
  const holder = resolveHolderPersonId(state, means.location);
  if (holder && (!jobId || state.people[holder]?.activeJobId !== jobId)) return "block.means_in_use";
  if (means.currentLoadBundleId) {
    const bundle = state.loadBundles[means.currentLoadBundleId];
    const cargoIds = new Set(cargo.map((c) => c.id));
    const leftover = bundle ? [...bundle.contentObjectIds, ...bundle.contentResourceLotIds, ...bundle.contentFurnitureIds].some((id) => !cargoIds.has(id)) : false;
    if (leftover) return "block.means_loaded";
  }
  if (summary) {
    const def = TRANSPORT_METHOD_DEFINITIONS_BY_METHOD.get(means.method)!;
    const conditionFactor = means.functionalState === "degraded" ? 0.8 : 1;
    if (summary.totalWeightKg > means.capacityKg * conditionFactor + 1e-9) return "block.load_too_heavy_for_method";
    if (summary.totalVolumeLiters > def.maxVolumeLiters + 1e-9) return "block.load_too_bulky_for_method";
    if (summary.handlingTags.some((t) => def.forbiddenHandlingTags.includes(t))) return "block.handling_incompatible_with_method";
  }
  return null;
}

function walkRoute(ctx: TransportPlanContext, from: WorldPoint, to: WorldPoint): TransportRoute | null {
  return planRoute(ctx.state, ctx.nav, from, to, { method: null, minOpeningClass: "narrow", knownTerrainOnly: true });
}

/** Motivo de que no haya ruta: la única pasaría por una zona prohibida, el método no cabe o no se conoce ninguna. */
function noRouteReason(ctx: TransportPlanContext, from: WorldPoint, to: WorldPoint): string {
  if (walkRoute(ctx, from, to)) return "block.route_incompatible_with_method";
  if (Object.values(ctx.state.workZones).some((z) => z.policy === "forbidden") && planRoute(ctx.state, ctx.nav, from, to, { method: null, minOpeningClass: "narrow", knownTerrainOnly: true, ignoreZones: true })) {
    return "block.route_crosses_forbidden_zone";
  }
  return "block.no_known_route";
}

/** Parada exterior junto a un acceso: la celda transitable más próxima a la abertura (donde se deja el medio). */
function exteriorStopNear(nav: NavigationIndexV2, point: WorldPoint): WorldPoint | null {
  const cell = nearestWalkableCellV2(nav.grid, point);
  return cell ? cellToWorldCenterV2(nav.grid, cell.col, cell.row) : null;
}

/**
 * Regla de etapa (S8, SET-010 §3.8): un medio con ruedas solo entra en un
 * edificio si puede llegar hasta el destino; si no, se detiene ante un
 * acceso exterior del edificio de destino y allí se descarga para seguir a
 * pulso. Entre los accesos exteriores transitables, se prefiere uno por el
 * que el propio medio cabe (el portón o el acceso de carga, «el carro llega
 * hasta el portón»), y a igualdad, el de menor recorrido total conocido
 * (medio hasta el acceso + a pulso hasta el destino).
 */
function destinationStagedStop(ctx: TransportPlanContext, def: TransportMethodDefinition, wheeledMinRank: number): TransportStagedStop | null {
  const destRoomId = resolveRoomId(ctx.state, destinationLocation(ctx.state, ctx.destination) ?? { kind: "world_point", point: ctx.destinationPoint });
  const buildingId = destRoomId ? ctx.nav.roomToBuilding[destRoomId] : undefined;
  const building = buildingId ? ctx.nav.buildings[buildingId] : undefined;
  if (!building) return null;
  const wheeledSpec = { method: def, minOpeningClass: def.minOpeningClass, knownTerrainOnly: true } as const;
  const options: { stop: TransportStagedStop; fits: boolean; cost: number; id: string }[] = [];
  for (const bridge of building.exteriorBridges) {
    const opening = ctx.state.world.openings[bridge.openingId];
    if (!opening) continue;
    const point = exteriorStopNear(ctx.nav, opening.position);
    if (!point) continue;
    const cartLeg = planRoute(ctx.state, ctx.nav, ctx.origin, point, wheeledSpec);
    if (!cartLeg) continue;
    const walkLeg = walkRoute(ctx, point, ctx.destinationPoint);
    if (!walkLeg) continue;
    options.push({ stop: { openingId: opening.id, point, roomId: null }, fits: OPENING_WIDTH_RANK[opening.widthClass] >= wheeledMinRank, cost: cartLeg.path.totalDistanceMeters + walkLeg.path.totalDistanceMeters, id: opening.id });
  }
  options.sort((a, b) => Number(b.fits) - Number(a.fits) || a.cost - b.cost || (a.id < b.id ? -1 : 1));
  return options[0]?.stop ?? null;
}

/** Parada de recogida: el acceso exterior por el que se sale del edificio donde está la carga. */
function originStagedStop(ctx: TransportPlanContext, towards: WorldPoint, wheeledMinRank: number): TransportStagedStop | null {
  const manual = walkRoute(ctx, ctx.origin, towards);
  if (!manual) return null;
  const openings = manual.path.openingIds.map((id) => ctx.state.world.openings[id]).filter((o): o is NonNullable<typeof o> => o !== undefined);
  const exitIndex = openings.findIndex((o) => o.connectsToExterior);
  if (exitIndex < 0) return null;
  const incompatibleBeforeExit = openings.slice(0, exitIndex + 1).some((o) => OPENING_WIDTH_RANK[o.widthClass] < wheeledMinRank);
  if (!incompatibleBeforeExit) return null;
  const access = openings[exitIndex]!;
  const point = exteriorStopNear(ctx.nav, access.position);
  return point ? { openingId: access.id, point, roomId: null } : null;
}

function evaluateManual(ctx: TransportPlanContext, method: TransportMethod, to: WorldPoint): MethodEvaluation {
  const def = TRANSPORT_METHOD_DEFINITIONS_BY_METHOD.get(method)!;
  const summary = ctx.summary;
  if (summary.handlingTags.some((t) => def.forbiddenHandlingTags.includes(t))) return failed(method, "block.handling_incompatible_with_method");
  if (BULK_RANK[summary.bulk] > BULK_RANK[def.maxBulk] && method !== "hand_carry") return failed(method, "block.load_too_bulky_for_method");
  let allocation: Record<string, string> = {};
  let requiredCarriers = Math.max(def.minOperators, summary.minCarriers);
  let personalContainerId: string | null = null;

  if (method === "hand_carry") {
    if (summary.minCarriers > 1) return failed(method, "block.cargo_requires_coordinated_carry");
    const result = allocateHandCarry(ctx, def);
    if ("reasonKey" in result) return failed(method, result.reasonKey);
    allocation = result.allocation;
    requiredCarriers = result.carriers;
  } else if (method === "personal_container") {
    if (summary.minCarriers > 1) return failed(method, "block.cargo_requires_coordinated_carry");
    const found = personalContainerFor(ctx);
    if ("reasonKey" in found) return failed(method, found.reasonKey);
    personalContainerId = found.containerId;
    if (summary.totalWeightKg > personCarryKg(ctx.primary, def) + 1e-9) return failed(method, "block.load_too_heavy_for_method");
    requiredCarriers = 1;
  } else {
    if (summary.totalVolumeLiters > def.maxVolumeLiters) return failed(method, "block.load_too_bulky_for_method");
    if (ctx.team.length < requiredCarriers) return failed(method, "block.method_requires_more_carriers");
  }

  const route = planRoute(ctx.state, ctx.nav, ctx.origin, to, { method: def, minOpeningClass: requiredOpeningClass(def, summary), knownTerrainOnly: true });
  if (!route) return failed(method, noRouteReason(ctx, ctx.origin, to));
  const usefulLimit = usefulCarrierLimit(def, summary.bulk, route.narrowestOpening);
  if (method === "coordinated_carry") {
    if (usefulLimit < requiredCarriers) return failed(method, "block.route_incompatible_with_method");
    const carriers = ctx.team.slice(0, usefulLimit);
    if (coordinatedTeamKg(carriers, def) + 1e-9 < summary.totalWeightKg) return failed(method, carriers.length < def.maxOperators && ctx.team.length <= carriers.length ? "block.method_requires_more_carriers" : "block.load_too_heavy_for_method");
    requiredCarriers = Math.max(requiredCarriers, minimalCoordinatedCarriers(carriers, def, summary.totalWeightKg));
  }
  const cost = routeCost(route, def, requiredCarriers);
  const minutes = cost.minutes + def.prepareMinutes + def.loadMinutes + def.unloadMinutes;
  return {
    method,
    meansId: null,
    ok: true,
    reasonKey: null,
    score: minutes * AUTO_SCORE_WEIGHTS.minutes + cost.fatigue * AUTO_SCORE_WEIGHTS.fatigue + cost.noise * AUTO_SCORE_WEIGHTS.noise,
    estimatedMinutes: round3(minutes),
    route,
    stagedStop: null,
    continuation: null,
    requiredCarriers,
    usefulLimit: Math.max(requiredCarriers, Math.min(usefulLimit, ctx.team.length)),
    allocation,
    personalContainerId,
  };
}

function minimalCoordinatedCarriers(carriers: readonly PersonStateV2[], def: TransportMethodDefinition, weightKg: number): number {
  for (let n = def.minOperators; n <= carriers.length; n++) {
    if (coordinatedTeamKg(carriers.slice(0, n), def) + 1e-9 >= weightKg) return n;
  }
  return carriers.length;
}

/** Mejor método manual para una etapa (tras un punto de transferencia o hasta el medio). */
function bestManual(ctx: TransportPlanContext, to: WorldPoint): MethodEvaluation {
  const evaluations = (["hand_carry", "personal_container", "coordinated_carry"] as const).map((m) => evaluateManual(ctx, m, to));
  return pickBest(evaluations);
}

function pickBest(evaluations: readonly MethodEvaluation[]): MethodEvaluation {
  const ok = evaluations.filter((e) => e.ok).sort((a, b) => a.score - b.score || TRANSPORT_METHODS.indexOf(a.method) - TRANSPORT_METHODS.indexOf(b.method));
  if (ok[0]) return ok[0];
  // Sin ninguno viable: el motivo del método «más cercano a funcionar» en el orden canónico, nunca oculto.
  return evaluations.find((e) => e.reasonKey !== "block.handling_incompatible_with_method") ?? evaluations[0]!;
}

function evaluateWheeled(ctx: TransportPlanContext, method: "wheelbarrow" | "handcart", requestedMeansId: string | null, jobId: string | null): MethodEvaluation {
  const def = TRANSPORT_METHOD_DEFINITIONS_BY_METHOD.get(method)!;
  const minRank = OPENING_WIDTH_RANK[def.minOpeningClass];
  const candidates = valuesById(ctx.state.transportMeans)
    .filter((m) => m.method === method && (!requestedMeansId || m.id === requestedMeansId))
    .map((m) => ({ means: m, point: locationToNavPoint(ctx.state, m.location) }))
    .filter((c): c is { means: TransportMeans; point: WorldPoint } => c.point !== null)
    .sort((a, b) => Math.hypot(a.point.x - ctx.primary.public.position.x, a.point.y - ctx.primary.public.position.y) - Math.hypot(b.point.x - ctx.primary.public.position.x, b.point.y - ctx.primary.public.position.y) || (a.means.id < b.means.id ? -1 : 1));
  const known = candidates.filter((c) => isLocationKnown(ctx.state, c.means.location));
  if (known.length === 0) return failed(method, "block.no_known_means");
  let firstFailure: MethodEvaluation | null = null;
  for (const { means, point } of known) {
    const reason = meansBlockReason(ctx.state, means, jobId, ctx.cargo, ctx.summary);
    if (reason) {
      firstFailure ??= failed(method, reason, means.id);
      continue;
    }
    const evaluation = evaluateWithMeans(ctx, def, means, point, minRank);
    if (evaluation.ok) return evaluation;
    firstFailure ??= evaluation;
  }
  return firstFailure ?? failed(method, "block.no_known_means");
}

function evaluateWithMeans(ctx: TransportPlanContext, def: TransportMethodDefinition, means: TransportMeans, meansPoint: WorldPoint, minRank: number): MethodEvaluation {
  const method = def.method;
  const wheeledSpec = { method: def, minOpeningClass: def.minOpeningClass, knownTerrainOnly: true } as const;
  const meansHolder = resolveHolderPersonId(ctx.state, means.location);
  const toMeans = meansHolder === ctx.primary.public.id ? null : walkRoute(ctx, ctx.primary.public.position, meansPoint);
  if (meansHolder !== ctx.primary.public.id && !toMeans) return failed(method, noRouteReason(ctx, ctx.primary.public.position, meansPoint), means.id);

  // ¿Llega el medio hasta la carga? Si no, primera etapa a pulso hasta el acceso de salida (recogida por etapas).
  const pickup = planRoute(ctx.state, ctx.nav, meansPoint, ctx.origin, wheeledSpec);
  if (!pickup) {
    const stop = originStagedStop(ctx, meansPoint, minRank);
    if (!stop) return failed(method, "block.route_incompatible_with_method", means.id);
    if (!planRoute(ctx.state, ctx.nav, meansPoint, stop.point, wheeledSpec)) return failed(method, "block.route_incompatible_with_method", means.id);
    const manual = bestManual(ctx, stop.point);
    if (!manual.ok) return { ...manual, method, meansId: means.id, ok: false };
    // La etapa de este trabajo es la recogida a pulso; la del medio la hará el trabajo siguiente.
    return { ...manual, stagedStop: stop, continuation: { method, meansId: means.id }, score: manual.score + 5, method: manual.method, meansId: null };
  }

  let loaded = planRoute(ctx.state, ctx.nav, ctx.origin, ctx.destinationPoint, wheeledSpec);
  let stagedStop: TransportStagedStop | null = null;
  let secondLeg: MethodEvaluation | null = null;
  if (!loaded) {
    stagedStop = destinationStagedStop(ctx, def, minRank);
    if (!stagedStop) return failed(method, noRouteReason(ctx, ctx.origin, ctx.destinationPoint), means.id);
    loaded = planRoute(ctx.state, ctx.nav, ctx.origin, stagedStop.point, wheeledSpec);
    if (!loaded) return failed(method, "block.route_incompatible_with_method", means.id);
    // La etapa a pulso posterior debe ser viable con el equipo (si no, el plan entero no lo es).
    secondLeg = bestManual({ ...ctx, origin: stagedStop.point }, ctx.destinationPoint);
    if (!secondLeg.ok) return failed(method, secondLeg.reasonKey ?? "block.route_incompatible_with_method", means.id);
  }

  const fetchMinutes = (toMeans ? routeCost(toMeans, null, 1).minutes : 0) + routeCost(pickup, def, 1).minutes / def.emptySpeed;
  const loadedCost = routeCost(loaded, def, 1);
  const fragileRisk = ctx.summary.handlingTags.includes("fragile") ? (loadedCost.roughMeters / 100) * AUTO_SCORE_WEIGHTS.fragileRisk : 0;
  let minutes = fetchMinutes + loadedCost.minutes + def.prepareMinutes + def.loadMinutes + def.unloadMinutes;
  let fatigue = loadedCost.fatigue;
  let noise = loadedCost.noise;
  if (secondLeg) {
    minutes += secondLeg.estimatedMinutes;
    fatigue += secondLeg.route ? routeCost(secondLeg.route, TRANSPORT_METHOD_DEFINITIONS_BY_METHOD.get(secondLeg.method)!, secondLeg.requiredCarriers).fatigue : 0;
    noise += secondLeg.route ? routeCost(secondLeg.route, TRANSPORT_METHOD_DEFINITIONS_BY_METHOD.get(secondLeg.method)!, 1).noise : 0;
  }
  return {
    method,
    meansId: means.id,
    ok: true,
    reasonKey: null,
    score: minutes * AUTO_SCORE_WEIGHTS.minutes + fatigue * AUTO_SCORE_WEIGHTS.fatigue + noise * AUTO_SCORE_WEIGHTS.noise + fragileRisk,
    estimatedMinutes: round3(minutes),
    route: loaded,
    stagedStop,
    continuation: null,
    requiredCarriers: 1,
    usefulLimit: Math.min(def.maxOperators, Math.max(1, ctx.team.length)),
    allocation: {},
    personalContainerId: null,
  };
}

export interface TransportPlanResult {
  readonly chosen: MethodEvaluation;
  readonly chosenBy: "auto" | "imposed";
  readonly evaluations: readonly MethodEvaluation[];
}

/** Equipo del traslado: asignadas primero (la principal delante), después las solicitadas todavía sin asignar. */
export function transportTeam(state: SimulationStateV2, job: Job): PersonStateV2[] {
  const ids: string[] = [];
  const primary = job.assignments.find((a) => a.role === "primary_executor")?.personId ?? job.assignments[0]?.personId ?? job.requestedPersonIds[0];
  if (primary) ids.push(primary);
  for (const a of job.assignments) if (!ids.includes(a.personId)) ids.push(a.personId);
  for (const id of job.requestedPersonIds) if (!ids.includes(id)) ids.push(id);
  return ids.map((id) => state.people[id]).filter((p): p is PersonStateV2 => p !== undefined);
}

/**
 * Plan completo de un traslado: evalúa el método impuesto o, con `Auto`,
 * los cinco métodos (los manuales si la etapa es a pulso tras una
 * transferencia) y elige el mejor viable. Devuelve siempre las
 * evaluaciones, para explicar el bloqueo si ninguno es viable.
 */
export function planTransport(state: SimulationStateV2, nav: NavigationIndexV2, job: Job): TransportPlanResult | { readonly reasonKey: string } {
  const transport = job.transport;
  if (!transport) return { reasonKey: "block.no_transport_plan" };
  for (const ref of transport.cargo) {
    const reason = cargoItemBlockReason(state, ref);
    if (reason) return { reasonKey: reason };
    const location = cargoLocation(state, ref)!;
    const holder = resolveHolderPersonId(state, location);
    if (holder && !job.requestedPersonIds.includes(holder) && !job.assignments.some((a) => a.personId === holder)) return { reasonKey: "block.cargo_held_by_other_person" };
  }
  const summary = summarizeCargo(state, transport.cargo);
  if (!summary) return { reasonKey: "block.target_no_longer_exists" };
  const destinationReason = destinationBlockReason(state, transport.destination, transport.cargo);
  if (destinationReason) return { reasonKey: destinationReason };
  const destinationPoint = destinationNavPoint(state, transport.destination);
  if (!destinationPoint) return { reasonKey: "block.target_unreachable" };
  const origin = cargoOriginPoint(state, transport.cargo);
  if ("reasonKey" in origin) return origin;
  const team = transportTeam(state, job);
  const primary = team[0];
  if (!primary) return { reasonKey: "block.no_executor" };
  const ctx: TransportPlanContext = { state, nav, cargo: transport.cargo, summary, team, primary, origin: origin.point, destination: transport.destination, destinationPoint };

  const requested = transport.requestedMethod;
  const candidates: readonly TransportMethod[] =
    requested !== "auto" ? [requested] : transport.manualOnly ? ["hand_carry", "personal_container", "coordinated_carry"] : TRANSPORT_METHODS;
  const evaluations = candidates.map((method) =>
    method === "wheelbarrow" || method === "handcart" ? evaluateWheeled(ctx, method, transport.requestedMeansId, job.id) : evaluateManual(ctx, method, destinationPoint),
  );
  const chosen = requested === "auto" ? pickBest(evaluations) : evaluations[0]!;
  return { chosen, chosenBy: requested === "auto" ? "auto" : "imposed", evaluations };
}
