import type { DomainEventV2, EntityLocation, PersonStateV2, SimulationStateV2, WorldPoint } from "@z-world/contracts";
import { advanceClock } from "../clock.js";
import { revealAroundObservers } from "../fog.js";
import { nextEventId } from "../sequences.js";
import { updateDiscoveryV2 } from "./discovery.js";
import type { NavigationIndexV2 } from "./room-graph.js";

/** Misma velocidad base provisional que V1 (DEC-0014); no se recalibra en S3. */
export const BASE_WALK_SPEED_METERS_PER_SIM_SECOND_V2 = 1.4;

export interface AdvanceSimulationV2Result {
  readonly state: SimulationStateV2;
  readonly events: readonly DomainEventV2[];
}

function pointAlongPath(path: readonly WorldPoint[], distanceMeters: number): WorldPoint {
  if (path.length === 0) return { x: 0, y: 0 };
  if (path.length === 1) return path[0]!;
  let remaining = distanceMeters;
  for (let i = 1; i < path.length; i++) {
    const start = path[i - 1]!;
    const end = path[i]!;
    const segmentLength = Math.hypot(end.x - start.x, end.y - start.y);
    if (remaining <= segmentLength) {
      const ratio = segmentLength === 0 ? 0 : remaining / segmentLength;
      return { x: start.x + (end.x - start.x) * ratio, y: start.y + (end.y - start.y) * ratio };
    }
    remaining -= segmentLength;
  }
  return path[path.length - 1]!;
}

/**
 * Ubicación lógica canónica de una persona en un punto de recorrido dado,
 * a partir de los `locationCheckpoints` calculados por el pathfinder
 * híbrido (§5.3/§5.4 de WEB-002): `location: EntityLocation` es la única
 * fuente de verdad de exterior/interior; `public.position` es una
 * proyección derivada (siempre sincronizada en esta misma frontera) usada
 * para render y como ancla de fog/descubrimiento, nunca una segunda
 * autoridad independiente.
 */
function locationAtCheckpoint(
  checkpoints: NonNullable<PersonStateV2["public"]["activeMovementOrder"]>["locationCheckpoints"],
  travelledDistanceMeters: number,
  currentPosition: WorldPoint,
): EntityLocation {
  let active: "exterior" | { roomId: string } = "exterior";
  for (const checkpoint of checkpoints ?? []) {
    if (checkpoint.afterDistanceMeters > travelledDistanceMeters) break;
    active = checkpoint.location.kind === "room" ? { roomId: checkpoint.location.roomId } : "exterior";
  }
  return active === "exterior" ? { kind: "world_point", point: currentPosition } : { kind: "room", roomId: active.roomId };
}

/**
 * Avanza el runtime V2 un número de segundos reales ya acumulados por la
 * orquestación (igual contrato que `advanceSimulation` de V1: el núcleo
 * nunca lee el reloj de sistema). Progresa reloj, movimiento multi-tramo
 * (exterior/interior), niebla y descubrimiento pasivo.
 */
export function advanceSimulationV2(state: SimulationStateV2, elapsedRealSeconds: number, nav: NavigationIndexV2): AdvanceSimulationV2Result {
  const previousSimSeconds = state.clock.elapsedSimSeconds;
  const nextClock = advanceClock(state.clock, elapsedRealSeconds);
  const simSecondsToAdvance = nextClock.elapsedSimSeconds - previousSimSeconds;

  if (simSecondsToAdvance <= 0) {
    return { state: { ...state, clock: nextClock }, events: [] };
  }

  let sequences = state.sequences;
  const events: DomainEventV2[] = [];
  const people: Record<string, PersonStateV2> = { ...state.people };

  for (const personId of state.peopleOrder) {
    const person = people[personId];
    if (!person || !person.public.activeMovementOrder) continue;

    const order = person.public.activeMovementOrder;
    const distanceToAdvance = BASE_WALK_SPEED_METERS_PER_SIM_SECOND_V2 * simSecondsToAdvance;
    const travelledDistanceMeters = Math.min(order.totalDistanceMeters, order.travelledDistanceMeters + distanceToAdvance);
    const position = pointAlongPath(order.path, travelledDistanceMeters);
    const reachedDestination = travelledDistanceMeters >= order.totalDistanceMeters;

    const previousLocation = person.location;
    const nextLocation = locationAtCheckpoint(order.locationCheckpoints, travelledDistanceMeters, position);

    if (previousLocation.kind === "room" && (nextLocation.kind !== "room" || nextLocation.roomId !== previousLocation.roomId)) {
      const { eventId, sequences: seq1 } = nextEventId(sequences);
      sequences = seq1;
      events.push({ type: "room_exited", eventId, simSeconds: nextClock.elapsedSimSeconds, causedByCommandId: null, personId, roomId: previousLocation.roomId });
    }
    if (nextLocation.kind === "room" && (previousLocation.kind !== "room" || previousLocation.roomId !== nextLocation.roomId)) {
      const { eventId, sequences: seq2 } = nextEventId(sequences);
      sequences = seq2;
      events.push({ type: "room_entered", eventId, simSeconds: nextClock.elapsedSimSeconds, causedByCommandId: null, personId, roomId: nextLocation.roomId });
    }

    if (reachedDestination) {
      const { eventId, sequences: nextSequences } = nextEventId(sequences);
      sequences = nextSequences;
      events.push({ type: "movement_completed", eventId, simSeconds: nextClock.elapsedSimSeconds, causedByCommandId: null, personId });
      people[personId] = {
        ...person,
        public: { ...person.public, position, operationalState: "arrival_completed", activeMovementOrder: null },
        location: nextLocation,
      };
    } else {
      people[personId] = {
        ...person,
        public: { ...person.public, position, activeMovementOrder: { ...order, travelledDistanceMeters } },
        location: nextLocation,
      };
    }
  }

  const observerPositions: WorldPoint[] = state.peopleOrder
    .map((id) => people[id])
    .filter((p): p is PersonStateV2 => p !== undefined && p.location.kind === "world_point")
    .map((p) => p.public.position);
  const fog = revealAroundObservers(state.fog, observerPositions);

  let stateAfterMovement: SimulationStateV2 = { ...state, clock: nextClock, people, fog, sequences };

  const discoveryResult = updateDiscoveryV2(stateAfterMovement, nav, nextClock.elapsedSimSeconds);
  if (discoveryResult.changed) {
    stateAfterMovement = { ...stateAfterMovement, discoveries: discoveryResult.discoveries, sequences: discoveryResult.sequences };
    events.push(...discoveryResult.events);
  }

  return { state: stateAfterMovement, events };
}
