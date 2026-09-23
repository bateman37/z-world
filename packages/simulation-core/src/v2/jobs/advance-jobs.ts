import type {
  ActionMethodDefinition,
  DiscoveryFacet,
  DomainEventV2,
  Job,
  KnowledgeState,
  NeedDimension,
  OutcomeBand,
  PersonStateV2,
  SimulationStateV2,
  WorkEpisode,
} from "@z-world/contracts";
import { bandForMargin, needBandFor } from "@z-world/contracts";
import { ACTION_METHODS_BY_KEY } from "@z-world/catalogs";
import { nextEventId } from "../../sequences.js";
import type { NavigationIndexV2 } from "../room-graph.js";
import { findPathV2, resolveNavAnchor } from "../pathfinding-v2.js";
import { PrngStream } from "../../prng.js";
import { computeEffectiveCapacity, isUniversalCapacity } from "../resolution/capacity.js";
import { sampleVariationB } from "../resolution/model-b.js";
import { sampleVariationD } from "../resolution/model-d.js";
import { checkHardRequirements, priorityAllowsWork } from "./eligibility.js";
import { isPersonCoLocated, locationToNavPoint, resolveTargetLocation } from "./location-utils.js";
import { selectJobForPerson } from "./planner.js";
import { releaseJobReservations, reserveResourceLot } from "./reservations.js";
import { resolveOwnNeedTarget } from "./own-need-resolution.js";
import { createJob } from "./job-factory.js";
import { transitionJob } from "./job-transitions.js";
import {
  applyHydrationRecovery,
  applyNutritionRecovery,
  applyRestRecovery,
  declineNeedsForElapsedSimMinutes,
  needOf,
  type RestSupportTier,
} from "../needs/evolve-needs.js";

export interface AdvanceJobsResult {
  readonly state: SimulationStateV2;
  readonly events: readonly DomainEventV2[];
}

let episodeCounter = 0;
function nextEpisodeId(state: SimulationStateV2): string {
  episodeCounter += 1;
  return `episode-${state.sequences.nextDomainEventSequence}-${episodeCounter}`;
}

interface Ctx {
  state: SimulationStateV2;
  events: DomainEventV2[];
  nav: NavigationIndexV2;
  simSecondsToAdvance: number;
}

function emit(ctx: Ctx, event: DomainEventV2): void {
  ctx.events.push(event);
}

function withNextEventId(ctx: Ctx): string {
  const { eventId, sequences } = nextEventId(ctx.state.sequences);
  ctx.state = { ...ctx.state, sequences };
  return eventId;
}

function putJob(ctx: Ctx, job: Job): void {
  ctx.state = { ...ctx.state, jobs: { ...ctx.state.jobs, [job.id]: job } };
}

function setPerson(ctx: Ctx, personId: string, person: PersonStateV2): void {
  ctx.state = { ...ctx.state, people: { ...ctx.state.people, [personId]: person } };
}

/**
 * Motor de avance de trabajos (WEB-002 §11/§12, subhitos S4-S6): un único
 * paso por tick que asigna, reserva, mueve, resuelve fases (directa/D/B) y
 * cierra trabajos, más la evolución de necesidades ligada a trabajo activo
 * y la autoprotección mínima. Se invoca desde `advanceSimulationV2` después
 * del movimiento y la niebla, con el mismo `nav` derivado (nunca
 * persistido) que usa el pathfinding de órdenes directas.
 */
export function advanceJobs(state: SimulationStateV2, nav: NavigationIndexV2, simSecondsToAdvance: number): AdvanceJobsResult {
  const ctx: Ctx = { state, events: [], nav, simSecondsToAdvance };
  if (simSecondsToAdvance <= 0) return { state: ctx.state, events: ctx.events };

  reviveBlockedJobs(ctx);
  assignIdlePeople(ctx);
  progressActiveJobs(ctx);
  applyWorkNeedDecline(ctx);
  runAutoprotection(ctx);

  return { state: ctx.state, events: ctx.events };
}

// --- Asignación -------------------------------------------------------------

function isPersonFreeForPlanning(person: PersonStateV2): boolean {
  return person.activeJobId === null && person.public.activeMovementOrder === null;
}

function assignIdlePeople(ctx: Ctx): void {
  const openJobs = Object.values(ctx.state.jobs).filter(
    (job) => (job.state === "proposed" || job.state === "available") && job.assignments.length < job.desiredTeamSize,
  );
  if (openJobs.length === 0) return;

  for (const personId of ctx.state.peopleOrder) {
    const person = ctx.state.people[personId];
    if (!person || !isPersonFreeForPlanning(person)) continue;

    // Órdenes directas: la persona solicitada tiene precedencia absoluta
    // sobre el planificador general (§11.9/§6.9 del prompt de subhitos), pero
    // `Nunca` sigue excluyendo incluso una orden directa silenciosa (§11.7).
    const directJob = Object.values(ctx.state.jobs).find(
      (job) =>
        job.directOrder &&
        job.requestedPersonIds.includes(personId) &&
        !job.assignments.some((a) => a.personId === personId) &&
        job.assignments.length < job.desiredTeamSize &&
        // La autoprotección mínima por necesidad crítica (§7.6) no es
        // autonomía discrecional: no la excluye `Nunca`.
        (job.origin === "systemic_need" || priorityAllowsWork(person.public.priorities[job.effectivePriority] ?? "never")),
    );
    const currentOpenJobs = Object.values(ctx.state.jobs).filter(
      (job) => (job.state === "proposed" || job.state === "available") && job.assignments.length < job.desiredTeamSize,
    );
    const chosenJob = directJob ?? selectJobForPerson(ctx.state, personId, currentOpenJobs, ACTION_METHODS_BY_KEY);
    if (!chosenJob) continue;

    assignPersonToJob(ctx, chosenJob.id, personId);
  }
}

function assignPersonToJob(ctx: Ctx, jobId: string, personId: string): void {
  const job = ctx.state.jobs[jobId];
  const person = ctx.state.people[personId];
  if (!job || !person) return;

  const role = job.assignments.length === 0 ? "primary_executor" : "operational_helper";
  const updatedJob: Job = { ...job, assignments: [...job.assignments, { personId, role }] };
  putJob(ctx, updatedJob);
  const eventId = withNextEventId(ctx);
  emit(ctx, { type: "job_assignment_changed", eventId, simSeconds: ctx.state.clock.elapsedSimSeconds, causedByCommandId: null, jobId, personId, change: "added" });
  setPerson(ctx, personId, { ...person, activeJobId: jobId });

  if (updatedJob.assignments.length >= 1 && (updatedJob.state === "proposed" || updatedJob.state === "available")) {
    startJob(ctx, updatedJob.id);
  }
}

/** Reserva lo necesario y transiciona `proposed`/`available` → `in_progress` (§6.6/§11.2). */
function startJob(ctx: Ctx, jobId: string): void {
  let job = ctx.state.jobs[jobId];
  if (!job) return;

  if (job.target.kind === "resource_lot") {
    const reserveResult = reserveResourceLot(ctx.state, job, job.target.resourceLotId, "reserve");
    if (!reserveResult) {
      const blockedResult = transitionJob(ctx.state, job, "blocked", "block.resource_exhausted");
      ctx.state = { ...ctx.state, sequences: blockedResult.sequences };
      putJob(ctx, blockedResult.job);
      ctx.events.push(...blockedResult.events);
      return;
    }
    ctx.state = reserveResult.state;
    ctx.events.push(...reserveResult.events);
    job = { ...ctx.state.jobs[jobId]!, reservationIds: [...ctx.state.jobs[jobId]!.reservationIds, reserveResult.reservation.id] };
    putJob(ctx, job);
  }

  const availableResult = transitionJob(ctx.state, job, "available", null);
  ctx.state = { ...ctx.state, sequences: availableResult.sequences };
  putJob(ctx, availableResult.job);
  ctx.events.push(...availableResult.events);

  const reservedResult = transitionJob(ctx.state, availableResult.job, "reserved", null);
  ctx.state = { ...ctx.state, sequences: reservedResult.sequences };
  putJob(ctx, reservedResult.job);
  ctx.events.push(...reservedResult.events);

  const assignedResult = transitionJob(ctx.state, reservedResult.job, "assigned", null);
  ctx.state = { ...ctx.state, sequences: assignedResult.sequences };
  putJob(ctx, assignedResult.job);
  ctx.events.push(...assignedResult.events);

  const inProgressResult = transitionJob(ctx.state, assignedResult.job, "in_progress", null);
  ctx.state = { ...ctx.state, sequences: inProgressResult.sequences };
  putJob(ctx, markPhaseActive(inProgressResult.job, 0));
  ctx.events.push(...inProgressResult.events);
}

function markPhaseActive(job: Job, index: number): Job {
  const phases = job.phases.map((p, i) => (i === index ? { ...p, state: "active" as const } : p));
  return { ...job, currentPhaseIndex: index, phases };
}

/** Reevalúa trabajos `blocked` ante el estado actual, nunca por sondeo del mundo entero (§11.2: "se reevalúa por eventos pertinentes"). Sin ejecutor asignado, vuelve a quedar disponible para el planificador; con ejecutor, retoma si sus requisitos duros ya se cumplen. */
function reviveBlockedJobs(ctx: Ctx): void {
  for (const job of Object.values(ctx.state.jobs)) {
    const current = ctx.state.jobs[job.id];
    if (!current || current.state !== "blocked") continue;
    const def = ACTION_METHODS_BY_KEY.get(current.actionKey);
    if (!def) continue;
    const executorId = primaryExecutorId(current);
    if (!executorId) {
      const result = transitionJob(ctx.state, current, "available", null);
      ctx.state = { ...ctx.state, sequences: result.sequences };
      putJob(ctx, result.job);
      ctx.events.push(...result.events);
      continue;
    }
    const hardCheck = checkHardRequirements(def, ctx.state, executorId, current.target);
    if (!hardCheck.ok) continue;
    const result = transitionJob(ctx.state, current, "in_progress", null);
    ctx.state = { ...ctx.state, sequences: result.sequences };
    putJob(ctx, result.job);
    ctx.events.push(...result.events);
  }
}

// --- Progreso de fases --------------------------------------------------

function progressActiveJobs(ctx: Ctx): void {
  for (const job of Object.values(ctx.state.jobs)) {
    if (job.state !== "in_progress") continue;
    const current = ctx.state.jobs[job.id];
    if (!current || current.state !== "in_progress") continue;
    progressJob(ctx, current.id);
  }
}

function completePhase(ctx: Ctx, jobId: string): void {
  const job = ctx.state.jobs[jobId];
  if (!job) return;
  const doneIndex = job.currentPhaseIndex;
  const phases = job.phases.map((p, i) => (i === doneIndex ? { ...p, state: "done" as const } : p));
  const nextIndex = doneIndex + 1;
  const eventId = withNextEventId(ctx);
  emit(ctx, { type: "job_phase_changed", eventId, simSeconds: ctx.state.clock.elapsedSimSeconds, causedByCommandId: null, jobId, phase: job.phases[doneIndex]!.kind });

  if (nextIndex >= phases.length) {
    finishJob(ctx, jobId);
    return;
  }
  const withPhases: Job = { ...job, phases };
  putJob(ctx, markPhaseActive(withPhases, nextIndex));
}

function finishJob(ctx: Ctx, jobId: string): void {
  const job = ctx.state.jobs[jobId];
  if (!job) return;
  const releaseResult = releaseJobReservations(ctx.state, jobId);
  ctx.state = releaseResult.state;
  ctx.events.push(...releaseResult.events);

  for (const assignment of job.assignments) {
    const person = ctx.state.people[assignment.personId];
    if (person && person.activeJobId === jobId) setPerson(ctx, assignment.personId, { ...person, activeJobId: null });
  }

  const transitionResult = transitionJob(ctx.state, ctx.state.jobs[jobId]!, "completed", null);
  ctx.state = { ...ctx.state, sequences: transitionResult.sequences };
  putJob(ctx, { ...transitionResult.job, progressRatio: 1 });
  ctx.events.push(...transitionResult.events);
}

/** Bloquea un trabajo y libera sus reservas: un bloqueo es temporal y se reevalúa (§11.2), así que no debe retener recursos que otro trabajo podría usar mientras tanto. */
function blockJob(ctx: Ctx, jobId: string, reasonKey: string): void {
  const job = ctx.state.jobs[jobId];
  if (!job) return;
  const releaseResult = releaseJobReservations(ctx.state, jobId);
  ctx.state = releaseResult.state;
  ctx.events.push(...releaseResult.events);
  const result = transitionJob(ctx.state, ctx.state.jobs[jobId]!, "blocked", reasonKey);
  ctx.state = { ...ctx.state, sequences: result.sequences };
  putJob(ctx, result.job);
  ctx.events.push(...result.events);
}

function failJobCausally(ctx: Ctx, jobId: string, reasonKey: string): void {
  const job = ctx.state.jobs[jobId];
  if (!job) return;
  const releaseResult = releaseJobReservations(ctx.state, jobId);
  ctx.state = releaseResult.state;
  ctx.events.push(...releaseResult.events);
  for (const assignment of job.assignments) {
    const person = ctx.state.people[assignment.personId];
    if (person && person.activeJobId === jobId) setPerson(ctx, assignment.personId, { ...person, activeJobId: null });
  }
  const result = transitionJob(ctx.state, ctx.state.jobs[jobId]!, "causal_failure", reasonKey);
  ctx.state = { ...ctx.state, sequences: result.sequences };
  putJob(ctx, result.job);
  ctx.events.push(...result.events);
}

function primaryExecutorId(job: Job): string | null {
  return job.assignments.find((a) => a.role === "primary_executor")?.personId ?? job.assignments[0]?.personId ?? null;
}

function progressJob(ctx: Ctx, jobId: string): void {
  const job = ctx.state.jobs[jobId];
  if (!job) return;
  const def = ACTION_METHODS_BY_KEY.get(job.actionKey);
  if (!def) return;
  const phaseKind = job.phases[job.currentPhaseIndex]?.kind;
  if (!phaseKind) return;

  const executorId = primaryExecutorId(job);
  if (!executorId) return;
  const executor = ctx.state.people[executorId];
  if (!executor) return;

  const targetLocation = resolveTargetLocation(ctx.state, job.target);
  if (!targetLocation) {
    failJobCausally(ctx, jobId, "block.target_no_longer_exists");
    return;
  }

  switch (phaseKind) {
    case "validate": {
      const hardCheck = checkHardRequirements(def, ctx.state, executorId, job.target);
      if (!hardCheck.ok) {
        blockJob(ctx, jobId, hardCheck.reasonKey ?? "block.requirement_failed");
        return;
      }
      completePhase(ctx, jobId);
      return;
    }
    case "travel": {
      if (isPersonCoLocated(ctx.state, executorId, targetLocation)) {
        completePhase(ctx, jobId);
        return;
      }
      if (executor.public.activeMovementOrder) return; // ya en camino, se comprobará el próximo tick.
      const destination = locationToNavPoint(ctx.state, targetLocation);
      if (!destination) {
        blockJob(ctx, jobId, "block.target_unreachable");
        return;
      }
      startInternalMove(ctx, executorId, destination, jobId);
      return;
    }
    case "execute": {
      progressExecutePhase(ctx, jobId, def, executorId);
      return;
    }
    case "record_result":
      completePhase(ctx, jobId);
      return;
    default:
      completePhase(ctx, jobId);
      return;
  }
}

function startInternalMove(ctx: Ctx, personId: string, destination: { x: number; y: number }, jobId: string): void {
  const person = ctx.state.people[personId];
  if (!person) return;
  const goalAnchor = resolveNavAnchor(ctx.nav, ctx.state.world, destination);
  const startAnchor = resolveNavAnchor(ctx.nav, ctx.state.world, person.public.position);
  const path = findPathV2(ctx.nav, ctx.state.world, startAnchor, goalAnchor);
  if (!path) {
    blockJob(ctx, jobId, "block.no_known_route");
    return;
  }
  setPerson(ctx, personId, {
    ...person,
    public: {
      ...person.public,
      operationalState: "moving",
      activeMovementOrder: {
        commandId: `job:${jobId}`,
        destination,
        path: path.waypoints,
        totalDistanceMeters: path.totalDistanceMeters,
        travelledDistanceMeters: 0,
        startedAtSimSeconds: ctx.state.clock.elapsedSimSeconds,
        locationCheckpoints: path.locationCheckpoints,
      },
    },
  });
}

// --- Fase de ejecución: directa / D / B ---------------------------------

function progressExecutePhase(ctx: Ctx, jobId: string, def: ActionMethodDefinition, executorId: string): void {
  const job = ctx.state.jobs[jobId];
  if (!job) return;

  switch (def.model) {
    case "direct":
      resolveDirectExecution(ctx, jobId, def, executorId);
      return;
    case "d":
      resolveModelDExecution(ctx, jobId, def, executorId);
      return;
    case "b":
    case "d_then_b":
      resolveModelBExecution(ctx, jobId, def, executorId);
      return;
    default: {
      const exhaustive: never = def.model;
      throw new Error(`Modelo de resolución no reconocido: ${JSON.stringify(exhaustive)}`);
    }
  }
}


function resolveDirectExecution(ctx: Ctx, jobId: string, def: ActionMethodDefinition, executorId: string): void {
  const job = ctx.state.jobs[jobId];
  if (!job) return;
  applyConsequences(ctx, job, def, executorId, "favorable");
  completePhase(ctx, jobId);
}

function resolveModelDExecution(ctx: Ctx, jobId: string, def: ActionMethodDefinition, executorId: string): void {
  let job = ctx.state.jobs[jobId];
  if (!job) return;

  if (job.workRateVariation === null) {
    const stream = new PrngStream(ctx.state.prng.resolution);
    const variation = sampleVariationD(stream);
    ctx.state = { ...ctx.state, prng: { ...ctx.state.prng, resolution: stream.snapshot() } };
    job = { ...job, workRateVariation: variation };
    putJob(ctx, job);
  }

  const elapsedMinutes = (ctx.simSecondsToAdvance / 60) * (1 + (job.workRateVariation ?? 0));

  if (job.actionKey === "rest") {
    const executor = ctx.state.people[executorId];
    if (executor) {
      const tier = restSupportTier(job);
      const restNeedBefore = needOf(executor.needs, "rest").value;
      const nextNeeds = applyRestRecovery(executor.needs, elapsedMinutes, tier);
      setPerson(ctx, executorId, { ...executor, needs: nextNeeds });
      emitNeedChangedIfBandShifted(ctx, executorId, "rest", restNeedBefore, needOf(nextNeeds, "rest").value);
      if (needOf(nextNeeds, "rest").value >= 100) {
        completePhase(ctx, jobId);
        return;
      }
    }
  }

  const remaining = Math.max(0, job.workRemainingUnits - elapsedMinutes);
  const progressRatio = def.baseWorkUnits > 0 ? Math.min(1, 1 - remaining / def.baseWorkUnits) : 1;
  putJob(ctx, { ...ctx.state.jobs[jobId]!, workRemainingUnits: remaining, progressRatio });
  if (remaining <= 0) completePhase(ctx, jobId);
}

function restSupportTier(job: Job): RestSupportTier {
  if (job.target.kind === "furniture") return "bed";
  return "ground";
}

function resolveModelBExecution(ctx: Ctx, jobId: string, def: ActionMethodDefinition, executorId: string): void {
  const job = ctx.state.jobs[jobId];
  if (!job) return;
  const executor = ctx.state.people[executorId];
  if (!executor) return;

  const capacityEffective = computeEffectiveCapacity(executor.public, def);
  const difficultyEffective = def.difficulty;
  const marginPrevious = isUniversalCapacity(capacityEffective) ? 10 - difficultyEffective : capacityEffective - difficultyEffective;

  const stream = new PrngStream(ctx.state.prng.resolution);
  const variationB = sampleVariationB(stream);
  ctx.state = { ...ctx.state, prng: { ...ctx.state.prng, resolution: stream.snapshot() } };

  const marginFinal = marginPrevious + variationB;
  const band = bandForMargin(marginFinal);

  const episodeId = nextEpisodeId(ctx.state);
  const episode: WorkEpisode = {
    id: episodeId,
    jobId,
    phase: "execute",
    executorPersonId: executorId,
    capacityEffective: isUniversalCapacity(capacityEffective) ? 10 : capacityEffective,
    difficultyEffective,
    marginPrevious,
    variationB,
    marginFinal,
    band,
    createdAtSimSeconds: ctx.state.clock.elapsedSimSeconds,
  };
  ctx.state = { ...ctx.state, episodes: { ...ctx.state.episodes, [episodeId]: episode } };
  const eventId = withNextEventId(ctx);
  emit(ctx, { type: "work_episode_created", eventId, simSeconds: ctx.state.clock.elapsedSimSeconds, causedByCommandId: null, episodeId, jobId, band });
  putJob(ctx, { ...ctx.state.jobs[jobId]!, episodeIds: [...ctx.state.jobs[jobId]!.episodeIds, episodeId] });

  if (band === "severe") {
    failJobCausally(ctx, jobId, "block.severe_outcome");
    return;
  }

  applyConsequences(ctx, ctx.state.jobs[jobId]!, def, executorId, band);
  completePhase(ctx, jobId);
}

function applyConsequences(ctx: Ctx, job: Job, def: ActionMethodDefinition, executorId: string, _band: OutcomeBand): void {
  for (const reveal of def.revealsKnowledge) {
    const entityId = discoveryEntityIdForTarget(job.target);
    if (!entityId) continue;
    const kind = discoveryEntityKindForTarget(job.target);
    if (!kind) continue;
    upgradeDiscovery(ctx, kind, entityId, reveal.facet, reveal.state);
  }

  if (job.actionKey === "drink" && job.target.kind === "resource_lot") {
    consumeResourceLot(ctx, job, executorId, job.target.resourceLotId, "hydration", 1);
  }
  if (job.actionKey === "eat" && job.target.kind === "resource_lot") {
    consumeResourceLot(ctx, job, executorId, job.target.resourceLotId, "nutrition", 1);
  }
}

function discoveryEntityIdForTarget(target: Job["target"]): string | null {
  switch (target.kind) {
    case "place":
      return target.placeId;
    case "building":
      return target.buildingId;
    case "room":
      return target.roomId;
    case "opening":
      return target.openingId;
    default:
      return null;
  }
}

function discoveryEntityKindForTarget(target: Job["target"]): "place" | "building" | "opening" | "room" | null {
  switch (target.kind) {
    case "place":
      return "place";
    case "building":
      return "building";
    case "room":
      return "room";
    case "opening":
      return "opening";
    default:
      return null;
  }
}

const KNOWLEDGE_RANK: Readonly<Record<KnowledgeState, number>> = { unknown: 0, sighted: 1, observed: 2, inspected: 3, exploited: 4 };

function upgradeDiscovery(ctx: Ctx, kind: "place" | "building" | "opening" | "room", entityId: string, facet: DiscoveryFacet, nextState: KnowledgeState): void {
  const existing = ctx.state.discoveries.find((d) => d.entityId === entityId && d.facet === facet);
  if (existing && KNOWLEDGE_RANK[existing.state] >= KNOWLEDGE_RANK[nextState]) return;
  const withoutExisting = ctx.state.discoveries.filter((d) => !(d.entityId === entityId && d.facet === facet));
  ctx.state = { ...ctx.state, discoveries: [...withoutExisting, { entityId, facet, state: nextState }] };
  const eventId = withNextEventId(ctx);
  emit(ctx, { type: "discovery_upgraded", eventId, simSeconds: ctx.state.clock.elapsedSimSeconds, causedByCommandId: null, entityKind: kind, entityId, facet, state: nextState });
}

function consumeResourceLot(ctx: Ctx, job: Job, executorId: string, resourceLotId: string, dimension: NeedDimension, quantity: number): void {
  const lot = ctx.state.resourceLots[resourceLotId];
  const executor = ctx.state.people[executorId];
  if (!lot || !executor) return;
  const consumed = Math.min(quantity, lot.quantity);
  if (consumed <= 0) return;
  const nextQuantity = lot.quantity - consumed;
  ctx.state = {
    ...ctx.state,
    resourceLots: nextQuantity <= 0 ? removeKey(ctx.state.resourceLots, resourceLotId) : { ...ctx.state.resourceLots, [resourceLotId]: { ...lot, quantity: nextQuantity, reservedByJobId: null } },
  };
  const eventId = withNextEventId(ctx);
  emit(ctx, {
    type: "consumption_happened",
    eventId,
    simSeconds: ctx.state.clock.elapsedSimSeconds,
    causedByCommandId: null,
    personId: executorId,
    resourceLotId,
    dimension,
    quantity: consumed,
  });

  const before = needOf(executor.needs, dimension).value;
  const nextNeeds = dimension === "hydration" ? applyHydrationRecovery(executor.needs, consumed) : applyNutritionRecovery(executor.needs, consumed);
  setPerson(ctx, executorId, { ...ctx.state.people[executorId]!, needs: nextNeeds });
  emitNeedChangedIfBandShifted(ctx, executorId, dimension, before, needOf(nextNeeds, dimension).value);
}

function removeKey<T>(record: Readonly<Record<string, T>>, key: string): Readonly<Record<string, T>> {
  const next = { ...record };
  delete next[key];
  return next;
}

function emitNeedChangedIfBandShifted(ctx: Ctx, personId: string, dimension: NeedDimension, before: number, after: number): void {
  if (needBandFor(before) === needBandFor(after)) return;
  const eventId = withNextEventId(ctx);
  emit(ctx, { type: "need_changed", eventId, simSeconds: ctx.state.clock.elapsedSimSeconds, causedByCommandId: null, personId, dimension, band: needBandFor(after) });
}

// --- Necesidad por trabajo activo (evita doble contabilización con el pasivo) ---

function applyWorkNeedDecline(ctx: Ctx): void {
  const elapsedMinutes = ctx.simSecondsToAdvance / 60;
  const SELF_CARE_ACTION_KEYS = new Set(["drink", "eat", "rest"]);
  for (const job of Object.values(ctx.state.jobs)) {
    if (job.state !== "in_progress") continue;
    // Beber/comer/descansar ya declaran su propio efecto sobre necesidades
    // (consumo/recuperación): aplicarles también el coste genérico de
    // "trabajo activo" contaría la misma causa dos veces (§14.3).
    if (SELF_CARE_ACTION_KEYS.has(job.actionKey)) continue;
    const phaseKind = job.phases[job.currentPhaseIndex]?.kind;
    if (phaseKind !== "execute") continue;
    for (const assignment of job.assignments) {
      const person = ctx.state.people[assignment.personId];
      if (!person) continue;
      const before: Record<NeedDimension, number> = { hydration: needOf(person.needs, "hydration").value, nutrition: needOf(person.needs, "nutrition").value, rest: needOf(person.needs, "rest").value };
      const nextNeeds = declineNeedsForElapsedSimMinutes(person.needs, elapsedMinutes, "working", job.pace);
      setPerson(ctx, assignment.personId, { ...ctx.state.people[assignment.personId]!, needs: nextNeeds });
      for (const dimension of ["hydration", "nutrition", "rest"] as const) {
        emitNeedChangedIfBandShifted(ctx, assignment.personId, dimension, before[dimension], needOf(nextNeeds, dimension).value);
      }
    }
  }
}

// --- Autoprotección mínima -----------------------------------------------

function worstCriticalDimension(person: PersonStateV2): NeedDimension | null {
  const critical = person.needs.filter((n) => n.band === "critical").sort((a, b) => a.value - b.value);
  return critical[0]?.dimension ?? null;
}

function jobAddressesDimension(job: Job, dimension: NeedDimension): boolean {
  if (dimension === "hydration") return job.actionKey === "drink";
  if (dimension === "nutrition") return job.actionKey === "eat";
  return job.actionKey === "rest";
}

function runAutoprotection(ctx: Ctx): void {
  for (const personId of ctx.state.peopleOrder) {
    const person = ctx.state.people[personId];
    if (!person) continue;
    const dimension = worstCriticalDimension(person);
    if (!dimension) continue;

    if (person.activeJobId) {
      const currentJob = ctx.state.jobs[person.activeJobId];
      if (currentJob && jobAddressesDimension(currentJob, dimension)) continue; // ya se está resolviendo.
      if (currentJob && (currentJob.state === "in_progress" || currentJob.state === "assigned")) {
        interruptJobForAutoprotection(ctx, currentJob.id, personId);
      }
      continue; // vuelve al planificador el próximo tick, ya libre.
    }

    const target = resolveOwnNeedTarget(ctx.state, personId, dimension);
    if (!target) {
      const eventId = withNextEventId(ctx);
      emit(ctx, {
        type: "systemic_intention_created",
        eventId,
        simSeconds: ctx.state.clock.elapsedSimSeconds,
        causedByCommandId: null,
        personId,
        dimension,
        jobId: null,
        blockedReasonKey: `block.no_known_solution_for_${dimension}`,
      });
      continue;
    }

    const actionKey = dimension === "hydration" ? "drink" : dimension === "nutrition" ? "eat" : "rest";
    const def = ACTION_METHODS_BY_KEY.get(actionKey);
    if (!def) continue;
    const created = createJob(ctx.state, {
      actionKey,
      def,
      target,
      origin: "systemic_need",
      causingCommandOrDesignationId: null,
      directOrder: true,
      requestedPersonIds: [personId],
      urgency: 5,
    });
    if ("rejectedReasonKey" in created) continue;
    ctx.state = { ...ctx.state, sequences: created.sequences, jobs: { ...ctx.state.jobs, [created.job.id]: created.job } };
    ctx.events.push(...created.events);
    const eventId = withNextEventId(ctx);
    emit(ctx, {
      type: "systemic_intention_created",
      eventId,
      simSeconds: ctx.state.clock.elapsedSimSeconds,
      causedByCommandId: null,
      personId,
      dimension,
      jobId: created.job.id,
      blockedReasonKey: null,
    });
  }
}

function interruptJobForAutoprotection(ctx: Ctx, jobId: string, personId: string): void {
  const job = ctx.state.jobs[jobId];
  if (!job) return;
  const releaseResult = releaseJobReservations(ctx.state, jobId);
  ctx.state = releaseResult.state;
  ctx.events.push(...releaseResult.events);
  const person = ctx.state.people[personId];
  if (person) setPerson(ctx, personId, { ...person, activeJobId: null, public: { ...person.public, activeMovementOrder: null } });

  const remainingAssignments = ctx.state.jobs[jobId]!.assignments.filter((a) => a.personId !== personId);
  const withoutPerson: Job = { ...ctx.state.jobs[jobId]!, assignments: remainingAssignments };
  putJob(ctx, withoutPerson);

  if (remainingAssignments.length === 0) {
    const result = transitionJob(ctx.state, withoutPerson, "interrupted", "block.critical_need_autoprotection");
    ctx.state = { ...ctx.state, sequences: result.sequences };
    putJob(ctx, result.job);
    ctx.events.push(...result.events);
  }
  const eventId = withNextEventId(ctx);
  emit(ctx, { type: "work_interrupted", eventId, simSeconds: ctx.state.clock.elapsedSimSeconds, causedByCommandId: null, jobId, reasonKey: "block.critical_need_autoprotection" });
}
