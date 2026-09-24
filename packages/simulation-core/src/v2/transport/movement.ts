import type { PersonStateV2, SimulationStateV2 } from "@z-world/contracts";
import { NEEDS_TUNING, TRANSPORT_METHOD_DEFINITIONS_BY_METHOD, TRANSPORT_PACE_SPEED } from "@z-world/catalogs";
import type { NavigationIndexV2 } from "../room-graph.js";
import { surfaceKindAt, worldToCellV2 } from "../navigation-v2.js";
import { isOpeningPassable } from "../room-graph.js";
import { OPENING_WIDTH_RANK } from "@z-world/catalogs";
import { summarizeCargo } from "./cargo.js";
import { requiredOpeningClass } from "./plan.js";
import { coordinatedTeamKg, personCarryKg } from "./capacity.js";

/**
 * Velocidad y esfuerzo de una persona que se desplaza dentro de un traslado
 * (S8, SET-010 §3.4/§3.10): el método y la superficie real bajo sus pies
 * cambian la velocidad y la fatiga del mismo movimiento de S3/S6 — no hay
 * un segundo sistema de movimiento ni un multiplicador universal. Fuera de
 * un traslado, `{ speed: 1, effort: 1 }` (idéntico a S3-S7).
 */
export interface TransportMovementFactors {
  readonly speed: number;
  readonly effort: number;
}

const NEUTRAL: TransportMovementFactors = { speed: 1, effort: 1 };

export function transportMovementFactors(state: SimulationStateV2, nav: NavigationIndexV2, person: PersonStateV2): TransportMovementFactors {
  const order = person.public.activeMovementOrder;
  if (!order || !person.activeJobId || order.commandId !== `job:${person.activeJobId}`) return NEUTRAL;
  const job = state.jobs[person.activeJobId];
  const transport = job?.transport;
  if (!job || !transport?.method) return NEUTRAL;
  const def = TRANSPORT_METHOD_DEFINITIONS_BY_METHOD.get(transport.method);
  if (!def) return NEUTRAL;
  const surface = person.location.kind === "room" ? "interior" : surfaceAt(nav, person.public.position);
  const pace = TRANSPORT_PACE_SPEED[job.pace];
  const paceEffort = job.pace === "fast" ? NEEDS_TUNING.fastPaceExtraMultiplier : job.pace === "relaxed" ? 0.85 : 1;
  const means = transport.transportMeansId ? state.transportMeans[transport.transportMeansId] : undefined;
  const pushing = means?.location.kind === "carried_by_person" && means.location.personId === person.public.id;
  const conditionFactor = pushing && means ? 0.7 + 0.3 * means.condition : 1;
  const behaviour = def.surfaces[surface] ?? { speed: 0.3, noisePerMeter: 1.5, effort: 2.5 };

  if (transport.step === "traverse") {
    const carrying = transport.carrierPersonIds.includes(person.public.id) || pushing;
    if (!carrying) return { speed: behaviour.speed * pace, effort: paceEffort };
    return { speed: round6(behaviour.speed * pace * conditionFactor), effort: round6(behaviour.effort * paceEffort * loadEffortFactor(state, person, transport, means, def)) };
  }
  if (pushing) {
    // Medio vacío (hacia la carga o de vuelta a su origen).
    return { speed: round6(def.emptySpeed * Math.min(1, behaviour.speed + 0.2) * conditionFactor), effort: 1.1 };
  }
  return NEUTRAL;
}

/**
 * La fatiga depende de cuánto pesa lo que lleva cada persona respecto a lo
 * que puede llevar (S8 §7.10: «según distancia, carga, método, terreno,
 * ritmo y cooperación»): 0,6 sin apenas carga, 1,4 a plena capacidad,
 * hasta 1,8 si va sobrecargada.
 */
function loadEffortFactor(
  state: SimulationStateV2,
  person: PersonStateV2,
  transport: NonNullable<SimulationStateV2["jobs"][string]["transport"]>,
  means: SimulationStateV2["transportMeans"][string] | undefined,
  def: NonNullable<ReturnType<typeof TRANSPORT_METHOD_DEFINITIONS_BY_METHOD.get>>,
): number {
  const bundle = transport.loadBundleId ? state.loadBundles[transport.loadBundleId] : undefined;
  if (!bundle) return 1;
  let share: number;
  if (means && (transport.method === "wheelbarrow" || transport.method === "handcart")) {
    share = bundle.totalWeightKg / Math.max(1, means.capacityKg);
  } else if (transport.method === "coordinated_carry") {
    const carriers = transport.carrierPersonIds.map((id) => state.people[id]).filter((p): p is PersonStateV2 => p !== undefined);
    share = bundle.totalWeightKg / Math.max(1, coordinatedTeamKg(carriers, def));
  } else if (transport.method === "hand_carry") {
    const mine = Object.entries(bundle.allocation).filter(([, personId]) => personId === person.public.id).map(([id]) => id);
    const kg = mine.reduce((acc, id) => acc + (state.resourceLots[id] ? summarizeCargo(state, [{ kind: "resource_lot", id }])?.totalWeightKg ?? 0 : summarizeCargo(state, [{ kind: "world_object", id }])?.totalWeightKg ?? 0), 0);
    share = (mine.length > 0 ? kg : bundle.totalWeightKg) / Math.max(1, personCarryKg(person, def));
  } else {
    share = bundle.totalWeightKg / Math.max(1, personCarryKg(person, def));
  }
  return round6(0.6 + 0.8 * Math.max(0, Math.min(1.5, share)));
}

function surfaceAt(nav: NavigationIndexV2, point: { x: number; y: number }): "road" | "open_ground" | "dense_vegetation" | "rubble" {
  const cell = worldToCellV2(nav.grid, point);
  if (!cell) return "open_ground";
  return surfaceKindAt(nav.grid, cell.row * nav.grid.columns + cell.col);
}

function round6(value: number): number {
  return Math.round(value * 1_000_000) / 1_000_000;
}

/**
 * Distancia máxima que una porteadora puede recorrer de su orden actual sin
 * atravesar un acceso de la ruta que ya no es transitable para la carga
 * (S8, obstáculo descubierto durante el recorrido, §7.5): se detiene medio
 * metro antes, nunca lo cruza. `null` si nada la limita.
 */
export function transportTravelLimit(state: SimulationStateV2, person: PersonStateV2): number | null {
  const order = person.public.activeMovementOrder;
  if (!order || !person.activeJobId || order.commandId !== `job:${person.activeJobId}`) return null;
  const job = state.jobs[person.activeJobId];
  const transport = job?.transport;
  if (!job || !transport?.method || transport.step !== "traverse") return null;
  const pending = transport.routeAccesses.filter((a) => !a.crossed);
  if (pending.length === 0) return null;
  const def = TRANSPORT_METHOD_DEFINITIONS_BY_METHOD.get(transport.method);
  if (!def) return null;
  const summary = summarizeCargo(state, transport.cargo);
  const minRank = OPENING_WIDTH_RANK[summary ? requiredOpeningClass(def, summary) : def.minOpeningClass];
  const offset = Math.max(0, order.totalDistanceMeters - transport.routeDistanceMeters);
  for (const access of pending) {
    const opening = state.world.openings[access.openingId];
    const passable = opening !== undefined && isOpeningPassable(access.openingId, state.world) && OPENING_WIDTH_RANK[opening.widthClass] >= minRank;
    if (!passable) return Math.max(order.travelledDistanceMeters, access.atMeters + offset - 0.5);
  }
  return null;
}
