import type {
  DomainEvent,
  FogMaskProjection,
  GameSummaryProjection,
  MapEntitiesProjection,
  MovementProjection,
  OperationalLogEntryProjection,
  PersonCardProjection,
  SaveStatus,
  SimulationStateV1,
  VisibilityState,
  WorkerProjections,
} from "@z-world/contracts";
import { toSimulatedDayTime } from "@z-world/contracts";

const VISIBILITY_BY_CELL_VALUE: readonly VisibilityState[] = ["hidden", "known", "observable"];

function buildFogProjection(state: SimulationStateV1): FogMaskProjection {
  return {
    resolutionMeters: state.fog.resolutionMeters,
    columns: state.fog.columns,
    rows: state.fog.rows,
    originX: state.fog.originX,
    originY: state.fog.originY,
    cells: state.fog.cells.map((value) => VISIBILITY_BY_CELL_VALUE[value] ?? "hidden"),
  };
}

function buildMapEntitiesProjection(state: SimulationStateV1): MapEntitiesProjection {
  return {
    areas: state.world.areas,
    lines: state.world.lines,
    points: state.world.points,
    structures: state.world.structures,
    people: state.peopleOrder.map((id) => ({ personId: id, position: state.people[id]!.public.position })),
  };
}

function buildMovementsProjection(state: SimulationStateV1): readonly MovementProjection[] {
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

function buildPersonCards(state: SimulationStateV1): readonly PersonCardProjection[] {
  return state.peopleOrder.map((id) => {
    const person = state.people[id]!.public;
    return {
      personId: id,
      firstName: person.firstName,
      lastName: person.lastName,
      operationalState: person.operationalState,
    };
  });
}

const EVENT_MESSAGE_KEYS: Readonly<Record<DomainEvent["type"], string>> = {
  game_created: "log.game_created",
  speed_or_pause_changed: "log.speed_or_pause_changed",
  move_order_accepted: "log.move_order_accepted",
  move_order_rejected: "log.move_order_rejected",
  movement_started: "log.movement_started",
  movement_completed: "log.movement_completed",
  movement_blocked: "log.movement_blocked",
  movement_cancelled: "log.movement_cancelled",
  priority_changed: "log.priority_changed",
};

export function toOperationalLogEntry(event: DomainEvent): OperationalLogEntryProjection {
  const params: Record<string, string> = {};
  if ("personId" in event) params.personId = event.personId;
  if ("code" in event) params.code = event.code;
  if ("priorityId" in event) params.priorityId = event.priorityId;
  return {
    eventId: event.eventId,
    simSeconds: event.simSeconds,
    messageKey: EVENT_MESSAGE_KEYS[event.type],
    params,
  };
}

export function buildWorkerProjections(params: {
  readonly state: SimulationStateV1;
  readonly gameSaveId: string;
  readonly revision: number;
  readonly saveStatus: SaveStatus;
  readonly lastSavedSimSeconds: number | null;
  readonly operationalLog: readonly OperationalLogEntryProjection[];
}): WorkerProjections {
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
    mapEntities: buildMapEntitiesProjection(state),
    fog: buildFogProjection(state),
    movements: buildMovementsProjection(state),
    operationalLog: params.operationalLog,
    revision: params.revision,
  };
}
