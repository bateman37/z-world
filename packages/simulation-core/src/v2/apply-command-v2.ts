import type { DomainEventV2, Job, JobTarget, PriorityValue, SimulationCommand, SimulationStateV2 } from "@z-world/contracts";
import { setClockPaused, setClockSpeed } from "../clock.js";
import { nextEventId } from "../sequences.js";
import { findPathV2, resolveNavAnchor } from "./pathfinding-v2.js";
import { ensureNavigationCurrent, type NavigationIndexV2 } from "./room-graph.js";
import { ACTION_METHODS_BY_KEY } from "@z-world/catalogs";
import { createJob } from "./jobs/job-factory.js";
import { releaseJobReservations } from "./jobs/reservations.js";
import { valuesById } from "./ordered.js";
import { transitionJob } from "./jobs/job-transitions.js";
import { emptyTransportState, settleTransportOnStop } from "./transport/phases.js";
import { generateTerrainDesignationJobs } from "./terrain/designations.js";

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
export function applyCommandV2(state: SimulationStateV2, command: SimulationCommand, navIn: NavigationIndexV2): ApplyCommandV2Result {
  // S9: navegación siempre al día con los accesos/estructura del mundo (O(1) si no cambió nada).
  const nav = ensureNavigationCurrent(navIn, state.world);
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
    case "order_contextual_action":
      return applyOrderContextualAction(state, command);
    case "pause_job":
      return applySimpleJobTransition(state, command.jobId, "paused", command.commandId);
    case "resume_job":
      return applySimpleJobTransition(state, command.jobId, "in_progress", command.commandId);
    case "cancel_job":
      return applyCancelJob(state, command.jobId, command.commandId);
    case "reassign_job":
      return applyReassignJob(state, command);
    case "set_job_modes":
      return applySetJobModes(state, command);
    case "draw_zone":
      return applyDrawZone(state, command);
    case "edit_zone":
      return applyEditZone(state, command);
    case "delete_zone":
      return applyDeleteZone(state, command);
    case "create_area_designation":
      return applyCreateAreaDesignation(state, command);
    case "cancel_designation":
      return applyCancelDesignation(state, command);
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
        crossedOpeningIds: [...path.openingIds],
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

// --- S4-S6: trabajos, zonas y designaciones ---------------------------

function applyOrderContextualAction(
  state: SimulationStateV2,
  command: Extract<SimulationCommand, { type: "order_contextual_action" }>,
): ApplyCommandV2Result {
  const def = ACTION_METHODS_BY_KEY.get(command.actionKey);
  // Una acción desconocida nunca debería llegar aquí desde una proyección ya
  // filtrada (§10.3 de WEB-002); se ignora sin efecto en vez de lanzar.
  if (!def) return { state, events: [] };
  // Idempotencia por `commandId` (§10.1 del prompt S7-S9): un duplicado de la misma orden nunca crea un segundo trabajo
  // (ni repite producción, consumo, movimiento ni episodio).
  if (Object.values(state.jobs).some((j) => j.origin === "direct_order" && j.causingCommandOrDesignationId === command.commandId && j.actionKey === command.actionKey)) return { state, events: [] };

  const requestedPersonIds = [...new Set([command.personId, ...command.teamPersonIds])];
  // S8: un traslado lleva su carga real (el blanco más los elementos añadidos), su destino y el selector Auto/método.
  let transport: Job["transport"] = null;
  if (command.actionKey === "transport") {
    if (!command.transportDestination) return { state, events: [] };
    const first = command.target.kind === "world_object" ? { kind: "world_object" as const, id: command.target.worldObjectId } : command.target.kind === "resource_lot" ? { kind: "resource_lot" as const, id: command.target.resourceLotId } : command.target.kind === "furniture" ? { kind: "furniture" as const, id: command.target.furnitureId } : null;
    if (!first) return { state, events: [] };
    const cargo = [first, ...(command.transportCargo ?? []).filter((c) => !(c.kind === first.kind && c.id === first.id))].filter((c, i, all) => all.findIndex((o) => o.kind === c.kind && o.id === c.id) === i);
    transport = {
      ...emptyTransportState(cargo, command.transportDestination),
      requestedMethod: command.transportMethod ?? "auto",
      requestedMeansId: command.transportMeansId ?? null,
      meansDisposition: command.meansDisposition ?? "park_at_destination",
    };
  }
  const created = createJob(state, {
    actionKey: command.actionKey,
    def,
    target: command.target,
    origin: "direct_order",
    causingCommandOrDesignationId: command.commandId,
    directOrder: true,
    requestedPersonIds,
    pace: command.pace,
    attention: command.attention,
    urgency: 5,
    disassemblyScope: command.disassemblyScope ?? null,
    irreversibleConfirmed: command.confirmIrreversible ?? false,
    storageItem: command.storageItem ?? null,
    storageQuantity: command.storageQuantity ?? null,
    transport,
    cropId: command.actionKey === "sow" ? (command.cropId ?? "garden_vegetables") : null,
  });
  if ("rejectedReasonKey" in created) return { state, events: [] };
  const nextState: SimulationStateV2 = { ...state, sequences: created.sequences, jobs: { ...state.jobs, [created.job.id]: created.job } };
  return { state: nextState, events: created.events };
}

function applySimpleJobTransition(state: SimulationStateV2, jobId: string, toState: Job["state"], _commandId: string): ApplyCommandV2Result {
  const job = state.jobs[jobId];
  if (!job) return { state, events: [] };
  const result = transitionJob(state, job, toState, null);
  if (result.events.length === 0) return { state, events: [] };
  return { state: { ...state, sequences: result.sequences, jobs: { ...state.jobs, [jobId]: result.job } }, events: result.events };
}

function applyCancelJob(state: SimulationStateV2, jobId: string, _commandId: string): ApplyCommandV2Result {
  const job = state.jobs[jobId];
  if (!job) return { state, events: [] };
  if (job.state === "completed" || job.state === "cancelled" || job.state === "causal_failure") return { state, events: [] };
  // S8: cancelar un traslado deja personas, carga y medio donde causalmente están (SET-010 §4), nunca en su origen.
  const settled = job.transport ? settleTransportOnStop(state, jobId, "block.cancelled_by_order", "cancel") : { state, events: [] as DomainEventV2[] };
  const releaseResult = releaseJobReservations(settled.state, jobId);
  let nextState = releaseResult.state;
  const events: DomainEventV2[] = [...settled.events, ...releaseResult.events];

  for (const assignment of job.assignments) {
    const person = nextState.people[assignment.personId];
    if (!person || person.activeJobId !== jobId) continue;
    const clearMovement = person.public.activeMovementOrder?.commandId === `job:${jobId}`;
    nextState = {
      ...nextState,
      people: {
        ...nextState.people,
        [assignment.personId]: {
          ...person,
          activeJobId: null,
          public: clearMovement ? { ...person.public, activeMovementOrder: null } : person.public,
        },
      },
    };
  }

  const result = transitionJob(nextState, nextState.jobs[jobId]!, "cancelled", null);
  nextState = { ...nextState, sequences: result.sequences, jobs: { ...nextState.jobs, [jobId]: result.job } };
  events.push(...result.events);
  return { state: nextState, events };
}

function applyReassignJob(state: SimulationStateV2, command: Extract<SimulationCommand, { type: "reassign_job" }>): ApplyCommandV2Result {
  const job = state.jobs[command.jobId];
  if (!job) return { state, events: [] };
  let nextState = state;
  const events: DomainEventV2[] = [];
  let assignments = job.assignments;

  if (command.removePersonId) {
    assignments = assignments.filter((a) => a.personId !== command.removePersonId);
    const person = nextState.people[command.removePersonId];
    if (person) {
      nextState = { ...nextState, people: { ...nextState.people, [command.removePersonId]: { ...person, activeJobId: null } } };
    }
    const { eventId, sequences } = nextEventId(nextState.sequences);
    nextState = { ...nextState, sequences };
    events.push({
      type: "job_assignment_changed",
      eventId,
      simSeconds: nextState.clock.elapsedSimSeconds,
      causedByCommandId: command.commandId,
      jobId: job.id,
      personId: command.removePersonId,
      change: "removed",
    });
  }

  if (command.addPersonId && !assignments.some((a) => a.personId === command.addPersonId)) {
    assignments = [...assignments, { personId: command.addPersonId, role: assignments.length === 0 ? "primary_executor" : "operational_helper" }];
    const person = nextState.people[command.addPersonId];
    if (person) {
      nextState = { ...nextState, people: { ...nextState.people, [command.addPersonId]: { ...person, activeJobId: job.id } } };
    }
    const { eventId, sequences } = nextEventId(nextState.sequences);
    nextState = { ...nextState, sequences };
    events.push({
      type: "job_assignment_changed",
      eventId,
      simSeconds: nextState.clock.elapsedSimSeconds,
      causedByCommandId: command.commandId,
      jobId: job.id,
      personId: command.addPersonId,
      change: "added",
    });
  }

  nextState = { ...nextState, jobs: { ...nextState.jobs, [job.id]: { ...nextState.jobs[job.id]!, assignments } } };
  return { state: nextState, events };
}

function applySetJobModes(state: SimulationStateV2, command: Extract<SimulationCommand, { type: "set_job_modes" }>): ApplyCommandV2Result {
  const job = state.jobs[command.jobId];
  if (!job) return { state, events: [] };
  const updatedJob: Job = { ...job, pace: command.pace ?? job.pace, attention: command.attention ?? job.attention };
  return { state: { ...state, jobs: { ...state.jobs, [job.id]: updatedJob } }, events: [] };
}

function applyDrawZone(state: SimulationStateV2, command: Extract<SimulationCommand, { type: "draw_zone" }>): ApplyCommandV2Result {
  const { eventId, sequences } = nextEventId(state.sequences);
  const zone = { id: command.zoneId, polygon: command.polygon, policy: command.policy, createdAtSimSeconds: state.clock.elapsedSimSeconds };
  const event: DomainEventV2 = { type: "zone_changed", eventId, simSeconds: state.clock.elapsedSimSeconds, causedByCommandId: command.commandId, zoneId: command.zoneId, change: "created", policy: command.policy };
  return { state: { ...state, sequences, workZones: { ...state.workZones, [zone.id]: zone } }, events: [event] };
}

function applyEditZone(state: SimulationStateV2, command: Extract<SimulationCommand, { type: "edit_zone" }>): ApplyCommandV2Result {
  const zone = state.workZones[command.zoneId];
  if (!zone) return { state, events: [] };
  const { eventId, sequences } = nextEventId(state.sequences);
  const updated = { ...zone, polygon: command.polygon ?? zone.polygon, policy: command.policy ?? zone.policy };
  const event: DomainEventV2 = { type: "zone_changed", eventId, simSeconds: state.clock.elapsedSimSeconds, causedByCommandId: command.commandId, zoneId: command.zoneId, change: "updated", policy: updated.policy };
  return { state: { ...state, sequences, workZones: { ...state.workZones, [command.zoneId]: updated } }, events: [event] };
}

function applyDeleteZone(state: SimulationStateV2, command: Extract<SimulationCommand, { type: "delete_zone" }>): ApplyCommandV2Result {
  if (!state.workZones[command.zoneId]) return { state, events: [] };
  const { eventId, sequences } = nextEventId(state.sequences);
  const nextZones = { ...state.workZones };
  delete nextZones[command.zoneId];
  const event: DomainEventV2 = { type: "zone_changed", eventId, simSeconds: state.clock.elapsedSimSeconds, causedByCommandId: command.commandId, zoneId: command.zoneId, change: "deleted", policy: null };
  return { state: { ...state, sequences, workZones: nextZones }, events: [event] };
}

function pointInPolygon(point: { x: number; y: number }, polygon: readonly { x: number; y: number }[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const pi = polygon[i]!;
    const pj = polygon[j]!;
    const intersects = pi.y > point.y !== pj.y > point.y && point.x < ((pj.x - pi.x) * (point.y - pi.y)) / (pj.y - pi.y) + pi.x;
    if (intersects) inside = !inside;
  }
  return inside;
}

/**
 * Designación por área (§6.8/§11.4, subhito S5): solo `systematic_recon`
 * es ejecutable en esta entrega. Genera de inmediato un `observe` discreto
 * por cada `Place` ya avistado (`sighted`) dentro del polígono — nunca
 * revela lugares desconocidos ni registra edificios (§6.8).
 */
function applyCreateAreaDesignation(
  state: SimulationStateV2,
  command: Extract<SimulationCommand, { type: "create_area_designation" }>,
): ApplyCommandV2Result {
  const { eventId, sequences } = nextEventId(state.sequences);
  let nextState: SimulationStateV2 = { ...state, sequences };
  const events: DomainEventV2[] = [
    { type: "designation_changed", eventId, simSeconds: state.clock.elapsedSimSeconds, causedByCommandId: command.commandId, designationId: command.designationId, change: "created", kind: command.kind },
  ];

  const generatedJobIds: string[] = [];
  if (command.kind === "clear_area" || command.kind === "cut_vegetation" || command.kind === "prepare_soil" || command.kind === "harvest" || command.kind === "build_barrier") {
    const result = generateTerrainDesignationJobs(nextState, command.designationId, command.kind, command.polygon, command.wayCrossingMode);
    nextState = result.state;
    events.push(...result.events);
    generatedJobIds.push(...result.generatedJobIds);
  } else if (command.kind === "systematic_recon") {
    const def = ACTION_METHODS_BY_KEY.get("observe");
    if (def) {
      for (const place of valuesById(nextState.world.places)) {
        const exteriorRecord = nextState.discoveries.find((d) => d.entityId === place.id && d.facet === "exterior");
        if (!exteriorRecord || exteriorRecord.state !== "sighted") continue; // solo objetivos ya conocidos (sighted), nunca desconocidos ni ya observados (§6.8).
        if (!pointInPolygon(place.position, command.polygon)) continue;
        const target: JobTarget = { kind: "place", placeId: place.id };
        const created = createJob(nextState, {
          actionKey: "observe",
          def,
          target,
          origin: "designation",
          causingCommandOrDesignationId: command.designationId,
          directOrder: false,
          requestedPersonIds: [],
          urgency: 1,
        });
        if ("rejectedReasonKey" in created) continue;
        nextState = { ...nextState, sequences: created.sequences, jobs: { ...nextState.jobs, [created.job.id]: created.job } };
        events.push(...created.events);
        generatedJobIds.push(created.job.id);
      }
    }
  }

  const designation = {
    id: command.designationId,
    kind: command.kind,
    areaOrLinePolygon: command.polygon,
    generatedJobIds,
    cancelled: false,
    createdAtSimSeconds: state.clock.elapsedSimSeconds,
  };
  nextState = { ...nextState, designations: { ...nextState.designations, [designation.id]: designation } };
  return { state: nextState, events };
}

function applyCancelDesignation(state: SimulationStateV2, command: Extract<SimulationCommand, { type: "cancel_designation" }>): ApplyCommandV2Result {
  const designation = state.designations[command.designationId];
  if (!designation) return { state, events: [] };
  const { eventId, sequences } = nextEventId(state.sequences);
  const events: DomainEventV2[] = [
    { type: "designation_changed", eventId, simSeconds: state.clock.elapsedSimSeconds, causedByCommandId: command.commandId, designationId: command.designationId, change: "cancelled", kind: designation.kind },
  ];
  let nextState: SimulationStateV2 = { ...state, sequences, designations: { ...state.designations, [designation.id]: { ...designation, cancelled: true } } };

  for (const jobId of designation.generatedJobIds) {
    const job = nextState.jobs[jobId];
    if (!job || job.state === "completed" || job.state === "cancelled" || job.state === "causal_failure") continue;
    const cancelResult = applyCancelJob(nextState, jobId, command.commandId);
    nextState = cancelResult.state;
    events.push(...cancelResult.events);
  }

  return { state: nextState, events };
}
