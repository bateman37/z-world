import type { DomainEvent, PersonState, SimulationStateV1, WorldPoint } from "@z-world/contracts";
import { advanceClock } from "./clock.js";
import { revealAroundObservers } from "./fog.js";
import { nextEventId } from "./sequences.js";

/** Velocidad base de desplazamiento a pie, valor técnico provisional (DEC-0014). */
export const BASE_WALK_SPEED_METERS_PER_SIM_SECOND = 1.4;

export interface AdvanceSimulationResult {
  readonly state: SimulationStateV1;
  readonly events: readonly DomainEvent[];
}

/**
 * Avanza la simulación un número de segundos reales ya acumulados por la
 * orquestación (el núcleo nunca lee `performance.now()` directamente).
 * Progresa el reloj, el movimiento de cada persona y la niebla observada.
 */
export function advanceSimulation(state: SimulationStateV1, elapsedRealSeconds: number): AdvanceSimulationResult {
  const previousSimSeconds = state.clock.elapsedSimSeconds;
  const nextClock = advanceClock(state.clock, elapsedRealSeconds);
  const simSecondsToAdvance = nextClock.elapsedSimSeconds - previousSimSeconds;

  if (simSecondsToAdvance <= 0) {
    return { state: { ...state, clock: nextClock }, events: [] };
  }

  let sequences = state.sequences;
  const events: DomainEvent[] = [];
  const people: Record<string, PersonState> = { ...state.people };

  for (const personId of state.peopleOrder) {
    const person = people[personId];
    if (!person || !person.public.activeMovementOrder) continue;

    const order = person.public.activeMovementOrder;
    const distanceToAdvance = BASE_WALK_SPEED_METERS_PER_SIM_SECOND * simSecondsToAdvance;
    const travelledDistanceMeters = Math.min(order.totalDistanceMeters, order.travelledDistanceMeters + distanceToAdvance);
    const position = pointAlongPath(order.path, travelledDistanceMeters);
    const reachedDestination = travelledDistanceMeters >= order.totalDistanceMeters;

    if (reachedDestination) {
      const { eventId, sequences: nextSequences } = nextEventId(sequences);
      sequences = nextSequences;
      events.push({
        type: "movement_completed",
        eventId,
        simSeconds: nextClock.elapsedSimSeconds,
        causedByCommandId: null,
        personId,
      });
      people[personId] = {
        ...person,
        public: {
          ...person.public,
          position,
          operationalState: "arrival_completed",
          activeMovementOrder: null,
        },
      };
    } else {
      people[personId] = {
        ...person,
        public: {
          ...person.public,
          position,
          activeMovementOrder: { ...order, travelledDistanceMeters },
        },
      };
    }
  }

  const observerPositions: WorldPoint[] = state.peopleOrder
    .map((id) => people[id]?.public.position)
    .filter((p): p is WorldPoint => p !== undefined);
  const fog = revealAroundObservers(state.fog, observerPositions);

  return {
    state: { ...state, clock: nextClock, people, fog, sequences },
    events,
  };
}

function pointAlongPath(path: readonly WorldPoint[], distance: number): WorldPoint {
  if (path.length === 0) return { x: 0, y: 0 };
  if (path.length === 1) return path[0]!;

  let remaining = distance;
  for (let i = 1; i < path.length; i++) {
    const start = path[i - 1]!;
    const end = path[i]!;
    const segmentLength = Math.hypot(end.x - start.x, end.y - start.y);
    if (remaining <= segmentLength) {
      const ratio = segmentLength === 0 ? 0 : remaining / segmentLength;
      return {
        x: start.x + (end.x - start.x) * ratio,
        y: start.y + (end.y - start.y) * ratio,
      };
    }
    remaining -= segmentLength;
  }
  return path[path.length - 1]!;
}
