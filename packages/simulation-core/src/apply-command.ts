import type { DomainEvent, PriorityValue, SimulationCommand, SimulationStateV1 } from "@z-world/contracts";
import { setClockPaused, setClockSpeed } from "./clock.js";
import { createInitialState } from "./create-initial-state.js";
import { buildWalkabilityGrid } from "./navigation-grid.js";
import { findPath } from "./pathfinding.js";
import { nextEventId } from "./sequences.js";

export interface ApplyCommandResult {
  readonly state: SimulationStateV1;
  readonly events: readonly DomainEvent[];
}

/**
 * Reductor puro del núcleo: aplica un comando validado al estado y produce
 * el estado siguiente más los eventos de dominio causados. Nunca lanza
 * excepciones para condiciones esperables del juego (destino inválido,
 * persona ocupada, etc.): esas se representan como eventos de rechazo.
 */
export function applyCommand(state: SimulationStateV1, command: SimulationCommand): ApplyCommandResult {
  switch (command.type) {
    case "initialize_scenario":
      return applyInitializeScenario(command.seed, state.sequences.nextDomainEventSequence, command.commandId);
    case "set_pause":
      return applySetPause(state, command.paused, command.commandId);
    case "set_speed":
      return applySetSpeed(state, command.speed, command.commandId);
    case "order_direct_move":
      return applyOrderDirectMove(state, command.personId, command.destination, command.commandId);
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

function applyInitializeScenario(seed: string, _startSequence: number, commandId: string): ApplyCommandResult {
  const state = createInitialState(seed);
  const { eventId, sequences } = nextEventId(state.sequences);
  const event: DomainEvent = {
    type: "game_created",
    eventId,
    simSeconds: state.clock.elapsedSimSeconds,
    causedByCommandId: commandId,
    seed,
  };
  return { state: { ...state, sequences }, events: [event] };
}

function applySetPause(state: SimulationStateV1, paused: boolean, commandId: string): ApplyCommandResult {
  const nextClock = setClockPaused(state.clock, paused);
  if (nextClock === state.clock) return { state, events: [] };
  const { eventId, sequences } = nextEventId(state.sequences);
  const event: DomainEvent = {
    type: "speed_or_pause_changed",
    eventId,
    simSeconds: state.clock.elapsedSimSeconds,
    causedByCommandId: commandId,
    speed: nextClock.speed,
  };
  return { state: { ...state, clock: nextClock, sequences }, events: [event] };
}

function applySetSpeed(
  state: SimulationStateV1,
  speed: SimulationStateV1["clock"]["speed"],
  commandId: string,
): ApplyCommandResult {
  const nextClock = setClockSpeed(state.clock, speed);
  if (nextClock === state.clock) return { state, events: [] };
  const { eventId, sequences } = nextEventId(state.sequences);
  const event: DomainEvent = {
    type: "speed_or_pause_changed",
    eventId,
    simSeconds: state.clock.elapsedSimSeconds,
    causedByCommandId: commandId,
    speed: nextClock.speed,
  };
  return { state: { ...state, clock: nextClock, sequences }, events: [event] };
}

function applyOrderDirectMove(
  state: SimulationStateV1,
  personId: string,
  destination: { x: number; y: number },
  commandId: string,
): ApplyCommandResult {
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

  const destinationCell = worldPointToFogState(state, destination);
  if (destinationCell === "hidden") {
    return rejectMove(state, personId, "destination_hidden", commandId);
  }

  const grid = buildWalkabilityGrid(state.world);
  const path = findPath(grid, person.public.position, destination);
  if (!path) {
    const destCol = Math.floor((destination.x - grid.originX) / grid.resolutionMeters);
    const destRow = Math.floor((destination.y - grid.originY) / grid.resolutionMeters);
    const idx = destRow * grid.columns + destCol;
    const notTransitable = grid.walkable[idx] !== 1;
    return rejectMove(state, personId, notTransitable ? "destination_not_transitable" : "no_known_route", commandId);
  }

  const totalDistanceMeters = pathLength(path);
  const events: DomainEvent[] = [];
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
        path,
        totalDistanceMeters,
        travelledDistanceMeters: 0,
        startedAtSimSeconds: state.clock.elapsedSimSeconds,
      },
    },
  };

  return {
    state: {
      ...state,
      sequences,
      people: { ...state.people, [personId]: updatedPerson },
    },
    events,
  };
}

function applyCancelDirectOrder(state: SimulationStateV1, personId: string, commandId: string): ApplyCommandResult {
  const person = state.people[personId];
  if (!person || !person.public.activeMovementOrder) {
    return { state, events: [] };
  }
  const { eventId, sequences } = nextEventId(state.sequences);
  const event: DomainEvent = {
    type: "movement_cancelled",
    eventId,
    simSeconds: state.clock.elapsedSimSeconds,
    causedByCommandId: commandId,
    personId,
  };
  const updatedPerson = {
    ...person,
    public: {
      ...person.public,
      operationalState: "order_cancelled" as const,
      activeMovementOrder: null,
    },
  };
  return {
    state: { ...state, sequences, people: { ...state.people, [personId]: updatedPerson } },
    events: [event],
  };
}

function applyUpdatePriority(
  state: SimulationStateV1,
  personId: string,
  priorityId: string,
  value: PriorityValue,
  commandId: string,
): ApplyCommandResult {
  const person = state.people[personId];
  if (!person) return { state, events: [] };
  const { eventId, sequences } = nextEventId(state.sequences);
  const event: DomainEvent = {
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
    public: {
      ...person.public,
      priorities: { ...person.public.priorities, [priorityId]: value },
    },
  };
  return {
    state: { ...state, sequences, people: { ...state.people, [personId]: updatedPerson } },
    events: [event],
  };
}

function rejectMove(
  state: SimulationStateV1,
  personId: string,
  code: Extract<DomainEvent, { type: "move_order_rejected" }>["code"],
  commandId: string,
): ApplyCommandResult {
  const { eventId, sequences } = nextEventId(state.sequences);
  const event: DomainEvent = {
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

function pathLength(path: readonly { x: number; y: number }[]): number {
  let total = 0;
  for (let i = 1; i < path.length; i++) {
    total += Math.hypot(path[i]!.x - path[i - 1]!.x, path[i]!.y - path[i - 1]!.y);
  }
  return total;
}

function worldPointToFogState(state: SimulationStateV1, point: { x: number; y: number }): "hidden" | "known" | "observable" {
  const { fog } = state;
  const col = Math.floor((point.x - fog.originX) / fog.resolutionMeters);
  const row = Math.floor((point.y - fog.originY) / fog.resolutionMeters);
  if (col < 0 || row < 0 || col >= fog.columns || row >= fog.rows) return "hidden";
  const value = fog.cells[row * fog.columns + col] ?? 0;
  return value === 2 ? "observable" : value === 1 ? "known" : "hidden";
}
