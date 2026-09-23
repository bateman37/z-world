import type { DomainEventV2, PriorityValue, SimulationCommand, SimulationStateV2 } from "@z-world/contracts";
import { setClockPaused, setClockSpeed } from "../clock.js";
import { nextEventId } from "../sequences.js";
import { findPathV2, resolveNavAnchor } from "./pathfinding-v2.js";
import type { NavigationIndexV2 } from "./room-graph.js";

export interface ApplyCommandV2Result {
  readonly state: SimulationStateV2;
  readonly events: readonly DomainEventV2[];
}

/**
 * Reductor puro del runtime V2 (S3 de WEB-002 §5.1/§5.3): mismos seis
 * comandos que V1 (`SimulationCommand` se reutiliza sin cambios — ver
 * DEC-0017), reinterpretados sobre `SimulationStateV2`. `initialize_scenario`
 * no aplica a V2 (las partidas nacen ya generadas por S2) y se ignora sin
 * error. El índice de navegación (`nav`) es una estructura derivada,
 * reconstruida al cargar la partida, nunca persistida (evita una segunda
 * fuente de verdad que pueda divergir del mundo).
 */
export function applyCommandV2(state: SimulationStateV2, command: SimulationCommand, nav: NavigationIndexV2): ApplyCommandV2Result {
  switch (command.type) {
    case "initialize_scenario":
      return { state, events: [] };
    case "set_pause":
      return applySetPause(state, command.paused, command.commandId);
    case "set_speed":
      return applySetSpeed(state, command.speed, command.commandId);
    case "order_direct_move":
      return applyOrderDirectMove(state, command.personId, command.destination, command.commandId, nav);
    case "cancel_direct_order":
      return applyCancelDirectOrder(state, command.personId, command.commandId);
    case "update_priority":
      return applyUpdatePriority(state, command.personId, command.priorityId, command.value, command.commandId);
    default: {
      const exhaustive: never = command;
      throw new Error(`Comando no reconocido: ${JSON.stringify(exhaustive)}`);
    }
  }
}

function applySetPause(state: SimulationStateV2, paused: boolean, commandId: string): ApplyCommandV2Result {
  const nextClock = setClockPaused(state.clock, paused);
  if (nextClock === state.clock) return { state, events: [] };
  const { eventId, sequences } = nextEventId(state.sequences);
  const event: DomainEventV2 = {
    type: "speed_or_pause_changed",
    eventId,
    simSeconds: state.clock.elapsedSimSeconds,
    causedByCommandId: commandId,
    speed: nextClock.speed,
  };
  return { state: { ...state, clock: nextClock, sequences }, events: [event] };
}

function applySetSpeed(state: SimulationStateV2, speed: SimulationStateV2["clock"]["speed"], commandId: string): ApplyCommandV2Result {
  const nextClock = setClockSpeed(state.clock, speed);
  if (nextClock === state.clock) return { state, events: [] };
  const { eventId, sequences } = nextEventId(state.sequences);
  const event: DomainEventV2 = {
    type: "speed_or_pause_changed",
    eventId,
    simSeconds: state.clock.elapsedSimSeconds,
    causedByCommandId: commandId,
    speed: nextClock.speed,
  };
  return { state: { ...state, clock: nextClock, sequences }, events: [event] };
}

function worldPointToFogStateV2(state: SimulationStateV2, point: { x: number; y: number }): "hidden" | "known" | "observable" {
  const { fog } = state;
  const col = Math.floor((point.x - fog.originX) / fog.resolutionMeters);
  const row = Math.floor((point.y - fog.originY) / fog.resolutionMeters);
  if (col < 0 || row < 0 || col >= fog.columns || row >= fog.rows) return "hidden";
  const value = fog.cells[row * fog.columns + col] ?? 0;
  return value === 2 ? "observable" : value === 1 ? "known" : "hidden";
}

function applyOrderDirectMove(
  state: SimulationStateV2,
  personId: string,
  destination: { x: number; y: number },
  commandId: string,
  nav: NavigationIndexV2,
): ApplyCommandV2Result {
  const person = state.people[personId];
  if (!person) {
    return rejectMove(state, personId, "stale_or_duplicate_command", commandId);
  }
  if (person.public.activeMovementOrder) {
    return rejectMove(state, personId, "person_already_ordered", commandId);
  }

  const { bounds } = state.world;
  if (destination.x < bounds.minX || destination.x > bounds.maxX || destination.y < bounds.minY || destination.y > bounds.maxY) {
    return rejectMove(state, personId, "destination_outside_world", commandId);
  }

  const goalAnchor = resolveNavAnchor(nav, state.world, destination);
  // Un destino dentro de un edificio solo es válido si la comunidad ya
  // conoce su exterior (fog en la posición del `Place`, §5.4/§5.6): no se
  // puede navegar deliberadamente hacia el interior de algo nunca visto.
  const fogCheckPoint =
    goalAnchor.kind === "room"
      ? (Object.values(state.world.places).find((p) => p.buildingId === nav.roomToBuilding[goalAnchor.roomId])?.position ?? destination)
      : destination;
  if (worldPointToFogStateV2(state, fogCheckPoint) === "hidden") {
    return rejectMove(state, personId, "destination_hidden", commandId);
  }

  const startAnchor = resolveNavAnchor(nav, state.world, person.public.position);
  const path = findPathV2(nav, state.world, startAnchor, goalAnchor);
  if (!path) {
    return rejectMove(state, personId, "no_known_route", commandId);
  }

  const events: DomainEventV2[] = [];
  let sequences = state.sequences;

  const acceptedEventResult = nextEventId(sequences);
  sequences = acceptedEventResult.sequences;
  events.push({
    type: "move_order_accepted",
    eventId: acceptedEventResult.eventId,
    simSeconds: state.clock.elapsedSimSeconds,
    causedByCommandId: commandId,
    personId,
    destination,
  });

  const startedEventResult = nextEventId(sequences);
  sequences = startedEventResult.sequences;
  events.push({
    type: "movement_started",
    eventId: startedEventResult.eventId,
    simSeconds: state.clock.elapsedSimSeconds,
    causedByCommandId: commandId,
    personId,
  });

  const updatedPerson = {
    ...person,
    public: {
      ...person.public,
      operationalState: "moving" as const,
      lastBlockReasonKey: null,
      activeMovementOrder: {
        commandId,
        destination,
        path: path.waypoints,
        totalDistanceMeters: path.totalDistanceMeters,
        travelledDistanceMeters: 0,
        startedAtSimSeconds: state.clock.elapsedSimSeconds,
        locationCheckpoints: path.locationCheckpoints,
      },
    },
  };

  return {
    state: { ...state, sequences, people: { ...state.people, [personId]: updatedPerson } },
    events,
  };
}

function applyCancelDirectOrder(state: SimulationStateV2, personId: string, commandId: string): ApplyCommandV2Result {
  const person = state.people[personId];
  if (!person || !person.public.activeMovementOrder) {
    return { state, events: [] };
  }
  const { eventId, sequences } = nextEventId(state.sequences);
  const event: DomainEventV2 = {
    type: "movement_cancelled",
    eventId,
    simSeconds: state.clock.elapsedSimSeconds,
    causedByCommandId: commandId,
    personId,
  };
  const updatedPerson = {
    ...person,
    public: { ...person.public, operationalState: "order_cancelled" as const, activeMovementOrder: null },
  };
  return {
    state: { ...state, sequences, people: { ...state.people, [personId]: updatedPerson } },
    events: [event],
  };
}

function applyUpdatePriority(
  state: SimulationStateV2,
  personId: string,
  priorityId: string,
  value: PriorityValue,
  commandId: string,
): ApplyCommandV2Result {
  const person = state.people[personId];
  if (!person) return { state, events: [] };
  const { eventId, sequences } = nextEventId(state.sequences);
  const event: DomainEventV2 = {
    type: "priority_changed",
    eventId,
    simSeconds: state.clock.elapsedSimSeconds,
    causedByCommandId: commandId,
    personId,
    priorityId,
    value,
  };
  const updatedPerson = {
    ...person,
    public: { ...person.public, priorities: { ...person.public.priorities, [priorityId]: value } },
  };
  return {
    state: { ...state, sequences, people: { ...state.people, [personId]: updatedPerson } },
    events: [event],
  };
}

function rejectMove(
  state: SimulationStateV2,
  personId: string,
  code: Extract<DomainEventV2, { type: "move_order_rejected" }>["code"],
  commandId: string,
): ApplyCommandV2Result {
  const { eventId, sequences } = nextEventId(state.sequences);
  const event: DomainEventV2 = {
    type: "move_order_rejected",
    eventId,
    simSeconds: state.clock.elapsedSimSeconds,
    causedByCommandId: commandId,
    personId,
    code,
  };
  const person = state.people[personId];
  const nextState = person
    ? {
        ...state,
        sequences,
        people: {
          ...state.people,
          [personId]: { ...person, public: { ...person.public, lastBlockReasonKey: `move_rejection.${code}` } },
        },
      }
    : { ...state, sequences };
  return { state: nextState, events: [event] };
}
