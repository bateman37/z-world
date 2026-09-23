import type {
  ActionMethodDefinition,
  DiscoveryFacet,
  DomainEventV2,
  Furniture,
  Job,
  JobTarget,
  KnowledgeState,
  NeedDimension,
  OutcomeBand,
  PersonStateV2,
  ResourceLot,
  SimulationStateV2,
  StorageItemRef,
  TransportMeans,
  WorkEpisode,
  WorldObject,
} from "@z-world/contracts";
import { bandForMargin, needBandFor, furnitureLocation } from "@z-world/contracts";
import {
  ACTION_METHODS_BY_KEY,
  DISASSEMBLY_PROFILES_BY_ID,
  DRAW_WATER_LITERS_PER_JOB,
  EXCLUSIVE_TARGET_ACTION_KEYS,
  OBJECT_CATALOG_BY_VARIANT,
  REPAIR_PROFILES_BY_ID,
} from "@z-world/catalogs";
import { installationBlockReason, resolveTransformationProfileId } from "./eligibility.js";
import {
  canMergeResourceLots,
  itemLocation,
  liquidCapacityOf,
  mergeResourceLots,
  splitResourceLot,
  liquidHeldBy,
  locationWorldPoint,
  moveItem,
  resolveHolderPersonId,
  storageBlockReason,
} from "../objects/storage.js";
import { applyUseWear, REPAIRABLE_INACTIVE_REASONS } from "../objects/wear.js";
import { nextEventId } from "../../sequences.js";
import type { NavigationIndexV2 } from "../room-graph.js";
import { findPathV2, resolveNavAnchor } from "../pathfinding-v2.js";
import { PrngStream } from "../../prng.js";
import { computeEffectiveCapacity, isUniversalCapacity } from "../resolution/capacity.js";
import { sampleVariationB } from "../resolution/model-b.js";
import { sampleVariationD } from "../resolution/model-d.js";
import { checkHardRequirements, priorityAllowsWork } from "./eligibility.js";
import { isPersonCoLocated, locationToNavPoint, resolveRoomId, resolveTargetLocation } from "./location-utils.js";
import { selectJobForPerson } from "./planner.js";
import { releaseJobReservations, reserveExclusiveTarget, reserveResourceLot, type ReserveResult } from "./reservations.js";
import { resolveOwnNeedTarget } from "./own-need-resolution.js";
import { createJob } from "./job-factory.js";
import { transitionJob } from "./job-transitions.js";
import { jobsInOrder, valuesById } from "../ordered.js";
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

/**
 * ID de episodio derivado solo de la secuencia causal del estado (el
 * evento `work_episode_created` consume ese mismo número justo después, así
 * que es único). Antes de S7 incluía un contador global de módulo, que
 * hacía divergir los IDs entre dos ejecuciones idénticas (p. ej. seguir en
 * memoria frente a seguir tras recargar): corregido sin tocar IDs ya
 * persistidos, que conservan su forma antigua.
 */
function nextEpisodeId(state: SimulationStateV2): string {
  return `episode-s${state.sequences.nextDomainEventSequence}`;
}

/**
 * Redondeo a 6 decimales en los límites causales que se persisten (S7):
 * PostgreSQL `jsonb` no devuelve exactamente un `double` de 17 cifras
 * significativas, así que un episodio o un progreso sin redondear diverge
 * al recargar. Mismo criterio que `generator/round-state.ts`.
 */
function round6(value: number): number {
  return Math.round(value * 1_000_000) / 1_000_000;
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
  const openJobs = jobsInOrder(ctx.state.jobs).filter(
    (job) => (job.state === "proposed" || job.state === "available") && job.assignments.length < job.desiredTeamSize,
  );
  if (openJobs.length === 0) return;

  for (const personId of ctx.state.peopleOrder) {
    const person = ctx.state.people[personId];
    if (!person || !isPersonFreeForPlanning(person)) continue;

    // Órdenes directas: la persona solicitada tiene precedencia absoluta
    // sobre el planificador general (§11.9/§6.9 del prompt de subhitos), pero
    // `Nunca` sigue excluyendo incluso una orden directa silenciosa (§11.7).
    const directJob = jobsInOrder(ctx.state.jobs).find(
      (job) =>
        job.directOrder &&
        job.requestedPersonIds.includes(personId) &&
        !job.assignments.some((a) => a.personId === personId) &&
        job.assignments.length < job.desiredTeamSize &&
        // La autoprotección mínima por necesidad crítica (§7.6) no es
        // autonomía discrecional: no la excluye `Nunca`.
        (job.origin === "systemic_need" || priorityAllowsWork(person.public.priorities[job.effectivePriority] ?? "never")),
    );
    // Un trabajo de orden directa con personas solicitadas explícitamente
    // (§11.9) no lo puebla el planificador con cualquier otra persona libre:
    // solo lo toman las solicitadas.
    const currentOpenJobs = jobsInOrder(ctx.state.jobs).filter(
      (job) =>
        (job.state === "proposed" || job.state === "available") &&
        job.assignments.length < job.desiredTeamSize &&
        (job.requestedPersonIds.length === 0 || job.requestedPersonIds.includes(personId)),
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

  const reserveFailure = acquireJobReservations(ctx, jobId);
  if (reserveFailure) {
    const blockedResult = transitionJob(ctx.state, ctx.state.jobs[jobId]!, "blocked", reserveFailure);
    ctx.state = { ...ctx.state, sequences: blockedResult.sequences };
    putJob(ctx, blockedResult.job);
    ctx.events.push(...blockedResult.events);
    return;
  }
  job = ctx.state.jobs[jobId]!;

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

/**
 * Blancos que un trabajo compromete en exclusiva (S5 para lotes consumidos;
 * S7 para objeto/mueble/contenedor/medio y el elemento que se almacena o
 * retira). Todo o nada: si una reserva falla, se liberan las ya hechas en
 * esta llamada y se devuelve el motivo de bloqueo.
 */
function reservationTargetsFor(job: Job): { kind: "resource_lot" | "world_object" | "furniture" | "container" | "transport_means"; id: string }[] {
  const targets: { kind: "resource_lot" | "world_object" | "furniture" | "container" | "transport_means"; id: string }[] = [];
  const exclusive = EXCLUSIVE_TARGET_ACTION_KEYS.has(job.actionKey);
  switch (job.target.kind) {
    case "resource_lot":
      // Beber/comer (S5) y recoger un lote suelto (S7) reservan el lote.
      targets.push({ kind: "resource_lot", id: job.target.resourceLotId });
      break;
    case "world_object":
      if (exclusive) targets.push({ kind: "world_object", id: job.target.worldObjectId });
      break;
    case "furniture":
      if (exclusive) targets.push({ kind: "furniture", id: job.target.furnitureId });
      break;
    case "container":
      if (exclusive) targets.push({ kind: "container", id: job.target.containerId });
      break;
    case "transport_means":
      if (exclusive) targets.push({ kind: "transport_means", id: job.target.transportMeansId });
      break;
    default:
      break;
  }
  if (exclusive && job.storageItem) targets.push({ kind: job.storageItem.kind, id: job.storageItem.id });
  return targets;
}

function acquireJobReservations(ctx: Ctx, jobId: string): string | null {
  const job = ctx.state.jobs[jobId];
  if (!job) return null;
  const already = new Set(Object.values(ctx.state.reservations).filter((r) => r.jobId === jobId).map((r) => `${r.targetKind}:${r.targetId}`));
  const created: string[] = [];
  for (const target of reservationTargetsFor(job)) {
    if (already.has(`${target.kind}:${target.id}`)) continue;
    const current = ctx.state.jobs[jobId]!;
    let result: ReserveResult | null;
    if (target.kind === "resource_lot") {
      result = reserveResourceLot(ctx.state, current, target.id, "reserve");
    } else {
      result = reserveExclusiveTarget(ctx.state, current, target.kind, target.id, "reserve");
    }
    if (!result) {
      if (created.length > 0) {
        const releaseResult = releaseJobReservations(ctx.state, jobId);
        ctx.state = releaseResult.state;
        ctx.events.push(...releaseResult.events);
        putJob(ctx, { ...ctx.state.jobs[jobId]!, reservationIds: ctx.state.jobs[jobId]!.reservationIds.filter((id) => !created.includes(id)) });
      }
      const exists = target.kind === "resource_lot" ? Boolean(ctx.state.resourceLots[target.id]) : true;
      return target.kind === "resource_lot" ? (exists ? "block.resource_reserved" : "block.resource_exhausted") : "block.target_reserved";
    }
    ctx.state = result.state;
    ctx.events.push(...result.events);
    created.push(result.reservation.id);
    putJob(ctx, { ...ctx.state.jobs[jobId]!, reservationIds: [...ctx.state.jobs[jobId]!.reservationIds, result.reservation.id] });
  }
  return null;
}

function markPhaseActive(job: Job, index: number): Job {
  const phases = job.phases.map((p, i) => (i === index ? { ...p, state: "active" as const } : p));
  return { ...job, currentPhaseIndex: index, phases };
}

/** Reevalúa trabajos `blocked` ante el estado actual, nunca por sondeo del mundo entero (§11.2: "se reevalúa por eventos pertinentes"). Sin ejecutor asignado, vuelve a quedar disponible para el planificador; con ejecutor, retoma si sus requisitos duros ya se cumplen. */
function reviveBlockedJobs(ctx: Ctx): void {
  for (const job of jobsInOrder(ctx.state.jobs)) {
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
    // Un bloqueo de fase (S7) solo se reevalúa cuando su causa concreta ha
    // cambiado: reanudar y volver a bloquear en el mismo tick sería
    // telemetría sin límite causal.
    if (phaseBlockerStillApplies(ctx.state, current, executorId)) continue;
    if (acquireJobReservations(ctx, current.id)) continue;
    const result = transitionJob(ctx.state, ctx.state.jobs[current.id]!, "in_progress", null);
    ctx.state = { ...ctx.state, sequences: result.sequences };
    putJob(ctx, result.job);
    ctx.events.push(...result.events);
  }
}

/** ¿Sigue vigente la causa concreta de un bloqueo de fase? Solo cubre los motivos de S7 y de materiales; el resto se reevalúa como en S4-S6. */
function phaseBlockerStillApplies(state: SimulationStateV2, job: Job, executorId: string): boolean {
  switch (job.blockReasonKey) {
    case "block.irreversible_not_confirmed":
      return !job.irreversibleConfirmed;
    case "block.missing_materials": {
      const plan = missingMaterialsForRepair(state, job, executorId);
      return plan === null || plan.missing;
    }
    case "block.requires_diagnosis":
      return requiresDiagnosisFirst(state, job);
    case "block.container_full":
    case "block.container_incompatible":
    case "block.item_not_at_storage_site":
    case "block.item_not_in_container":
    case "block.container_not_empty":
    case "block.transport_loaded":
    case "block.no_liquid_vessel":
      return storagePhaseBlockReason(state, job, executorId) !== null || disassemblyPreconditionReason(state, job) !== null || drawWaterVesselReason(state, job, executorId) !== null;
    default:
      return false;
  }
}

// --- Progreso de fases --------------------------------------------------

function progressActiveJobs(ctx: Ctx): void {
  for (const job of jobsInOrder(ctx.state.jobs)) {
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
      const storageReason = storageValidationReason(ctx.state, job);
      if (storageReason) {
        blockJob(ctx, jobId, storageReason);
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
    case "collect": {
      if (job.actionKey === "retrieve_from_storage") {
        progressRetrievePhase(ctx, jobId, executorId);
        return;
      }
      progressCollectPhase(ctx, jobId, executorId);
      return;
    }
    case "deliver": {
      if (job.actionKey === "store") {
        progressStorePhase(ctx, jobId, executorId);
        return;
      }
      completePhase(ctx, jobId);
      return;
    }
    case "prepare": {
      progressPreparePhase(ctx, jobId);
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

/** Fase `collect` de §11.3/§15.7 (S7): mueve el objeto o lote suelto a la persona ejecutora en un único límite causal, nunca por teletransporte silencioso. */
function progressCollectPhase(ctx: Ctx, jobId: string, executorId: string): void {
  const job = ctx.state.jobs[jobId];
  if (!job) return;
  if (job.target.kind !== "world_object" && job.target.kind !== "resource_lot") {
    // El mobiliario pesado exige un método de transporte de S8 (porte
    // coordinado, carretilla, carro), todavía sin implementar: bloquear con
    // motivo causal es más honesto que fingir una recogida a pulso.
    blockJob(ctx, jobId, "block.requires_transport_method");
    return;
  }
  const ref: StorageItemRef = job.target.kind === "world_object" ? { kind: "world_object", id: job.target.worldObjectId } : { kind: "resource_lot", id: job.target.resourceLotId };
  const location = itemLocation(ctx.state, ref);
  if (!location) {
    failJobCausally(ctx, jobId, "block.target_no_longer_exists");
    return;
  }
  if (ref.kind === "world_object") {
    const obj = ctx.state.worldObjects[ref.id]!;
    if (obj.portability === "fixed" || obj.installedAt) {
      blockJob(ctx, jobId, "block.requires_transport_method");
      return;
    }
  }
  ctx.state = moveItem(ctx.state, ref, { kind: "carried_by_person", personId: executorId });
  const eventId = withNextEventId(ctx);
  emit(ctx, { type: "object_collected", eventId, simSeconds: ctx.state.clock.elapsedSimSeconds, causedByCommandId: null, objectId: ref.id, entityKind: ref.kind, personId: executorId, jobId });
  completePhase(ctx, jobId);
}

/**
 * Validación propia de `store`/`retrieve_from_storage` en la fase
 * `validate` (S7 §6.3/§6.4): el elemento debe existir y, al almacenar,
 * caber en el contenedor real (capacidad y compatibilidad); al retirar,
 * estar realmente dentro de él.
 */
function storageValidationReason(state: SimulationStateV2, job: Job): string | null {
  if (job.actionKey !== "store" && job.actionKey !== "retrieve_from_storage") return null;
  if (job.target.kind !== "container") return "block.no_storage_container_selected";
  const container = state.containers[job.target.containerId];
  if (!container) return "block.target_no_longer_exists";
  if (!job.storageItem) return "block.no_storage_item_selected";
  const location = itemLocation(state, job.storageItem);
  if (!location) return "block.target_no_longer_exists";
  if (job.actionKey === "retrieve_from_storage") {
    return location.kind === "container" && location.containerId === container.id ? null : "block.item_not_in_container";
  }
  return storageBlockReason(state, container, job.storageItem);
}

/** Motivo por el que la fase física de almacenar/retirar no puede ocurrir ahora mismo, o `null`. */
function storagePhaseBlockReason(state: SimulationStateV2, job: Job, executorId: string): string | null {
  if (job.actionKey !== "store" && job.actionKey !== "retrieve_from_storage") return null;
  const validation = storageValidationReason(state, job);
  if (validation) return validation;
  if (job.actionKey === "retrieve_from_storage") return null;
  // Almacenar: el elemento debe estar ya en el lugar (lo lleva la persona
  // ejecutora, o está suelto en la misma estancia/alcance que el
  // contenedor). Traerlo desde otra parte es transporte (S8), nunca un
  // teletransporte implícito.
  const container = state.containers[(job.target as { containerId: string }).containerId]!;
  const location = itemLocation(state, job.storageItem!)!;
  const holder = resolveHolderPersonId(state, location);
  if (holder === executorId) return null;
  if (holder !== null) return "block.item_not_at_storage_site";
  if (!isPersonCoLocated(state, executorId, location)) return "block.item_not_at_storage_site";
  const containerRoom = resolveRoomId(state, container.location);
  const itemRoom = resolveRoomId(state, location);
  if (containerRoom !== itemRoom) return "block.item_not_at_storage_site";
  return null;
}

/** Fase `deliver` de `store` (S7 §6.4): deja el elemento dentro del contenedor real en un único límite causal. */
function progressStorePhase(ctx: Ctx, jobId: string, executorId: string): void {
  const job = ctx.state.jobs[jobId];
  if (!job || job.target.kind !== "container" || !job.storageItem) return;
  const reason = storagePhaseBlockReason(ctx.state, job, executorId);
  if (reason) {
    if (reason === "block.target_no_longer_exists") failJobCausally(ctx, jobId, reason);
    else blockJob(ctx, jobId, reason);
    return;
  }
  const containerId = job.target.containerId;
  ctx.state = moveItem(ctx.state, job.storageItem, { kind: "container", containerId });
  const eventId = withNextEventId(ctx);
  emit(ctx, { type: "object_stored", eventId, simSeconds: ctx.state.clock.elapsedSimSeconds, causedByCommandId: null, objectId: job.storageItem.id, entityKind: job.storageItem.kind, containerId, jobId });
  if (job.storageItem.kind === "resource_lot") mergeStoredLotIntoContainer(ctx, job.storageItem.id, containerId, jobId);
  completePhase(ctx, jobId);
}

/** Fase `collect` de `retrieve_from_storage` (S7 §6.4): saca el elemento del contenedor real y lo deja en manos de la persona ejecutora. */
function progressRetrievePhase(ctx: Ctx, jobId: string, executorId: string): void {
  const job = ctx.state.jobs[jobId];
  if (!job || job.target.kind !== "container" || !job.storageItem) return;
  const reason = storagePhaseBlockReason(ctx.state, job, executorId);
  if (reason) {
    if (reason === "block.target_no_longer_exists") failJobCausally(ctx, jobId, reason);
    else blockJob(ctx, jobId, reason);
    return;
  }
  const containerId = job.target.containerId;
  const lot = job.storageItem.kind === "resource_lot" ? ctx.state.resourceLots[job.storageItem.id] : undefined;
  let retrievedId = job.storageItem.id;
  if (lot && job.storageQuantity !== null && job.storageQuantity < lot.quantity) {
    // Retirar solo una parte divide el lote (S7 §6.5): misma condición, curva y procedencia; la cantidad se conserva exacta.
    const newLotId = `resource-lot-${ctx.state.sequences.nextEntityOrdinal}`;
    ctx.state = { ...ctx.state, sequences: { ...ctx.state.sequences, nextEntityOrdinal: ctx.state.sequences.nextEntityOrdinal + 1 } };
    const split = splitResourceLot(ctx.state, lot.id, job.storageQuantity, newLotId, { kind: "carried_by_person", personId: executorId });
    if (split) {
      ctx.state = split;
      retrievedId = newLotId;
      const splitEventId = withNextEventId(ctx);
      emit(ctx, { type: "resource_lot_split", eventId: splitEventId, simSeconds: ctx.state.clock.elapsedSimSeconds, causedByCommandId: null, sourceResourceLotId: lot.id, newResourceLotId: newLotId, quantity: job.storageQuantity });
    }
  }
  if (retrievedId === job.storageItem.id) ctx.state = moveItem(ctx.state, job.storageItem, { kind: "carried_by_person", personId: executorId });
  const eventId = withNextEventId(ctx);
  emit(ctx, { type: "object_retrieved", eventId, simSeconds: ctx.state.clock.elapsedSimSeconds, causedByCommandId: null, objectId: retrievedId, entityKind: job.storageItem.kind, containerId, jobId });
  completePhase(ctx, jobId);
}

/** Al guardar un lote junto a otro compatible del mismo contenedor, se fusionan en uno solo (S7 §6.5) sin mezclar estados incompatibles. */
function mergeStoredLotIntoContainer(ctx: Ctx, lotId: string, containerId: string, jobId: string): void {
  const stored = ctx.state.resourceLots[lotId];
  const container = ctx.state.containers[containerId];
  if (!stored || !container) return;
  // El lote guardado solo está reservado por este mismo trabajo: se libera para poder fusionarlo.
  const unreserved = { ...stored, reservedByJobId: stored.reservedByJobId === jobId ? null : stored.reservedByJobId };
  const survivor = container.contentIds
    .map((id) => ctx.state.resourceLots[id])
    .filter((l): l is ResourceLot => l !== undefined && l.id !== lotId)
    .sort((a, b) => (a.id < b.id ? -1 : 1))
    .find((l) => canMergeResourceLots(l, unreserved));
  if (!survivor) return;
  const merged = mergeResourceLots({ ...ctx.state, resourceLots: { ...ctx.state.resourceLots, [lotId]: unreserved } }, survivor.id, lotId);
  if (!merged) return;
  ctx.state = merged;
  const eventId = withNextEventId(ctx);
  emit(ctx, { type: "resource_lot_merged", eventId, simSeconds: ctx.state.clock.elapsedSimSeconds, causedByCommandId: null, survivingResourceLotId: survivor.id, mergedResourceLotId: lotId });
}

/**
 * Fase `prepare` (S7 §16.2/§16.4, SET-009 §3.4 paso 5): para `repair`,
 * reserva y consume las familias de recurso concretas de la receta en un
 * único límite causal, sin pila universal; para `disassemble_*`, exige la
 * confirmación informada del coste irreversible y que el objeto esté
 * vaciado/descargado antes de tocar nada. Otros métodos que declaren
 * `prepare` sin lógica propia simplemente la completan.
 */
function progressPreparePhase(ctx: Ctx, jobId: string): void {
  const job = ctx.state.jobs[jobId];
  if (!job) return;

  if (job.actionKey === "disassemble_selective" || job.actionKey === "disassemble_destructive") {
    if (!job.irreversibleConfirmed) {
      blockJob(ctx, jobId, "block.irreversible_not_confirmed");
      return;
    }
    const precondition = disassemblyPreconditionReason(ctx.state, job);
    if (precondition) {
      blockJob(ctx, jobId, precondition);
      return;
    }
    completePhase(ctx, jobId);
    return;
  }

  if (job.actionKey === "repair") {
    const executorId = primaryExecutorId(job);
    const profileId = resolveTransformationProfileId(ctx.state, job.target, "repair");
    const profile = profileId ? REPAIR_PROFILES_BY_ID.get(profileId) : undefined;
    if (!profile || !executorId) {
      blockJob(ctx, jobId, "block.no_transformation_profile");
      return;
    }
    if (requiresDiagnosisFirst(ctx.state, job)) {
      blockJob(ctx, jobId, "block.requires_diagnosis");
      return;
    }
    const plan = missingMaterialsForRepair(ctx.state, job, executorId);
    if (plan === null || plan.missing) {
      blockJob(ctx, jobId, "block.missing_materials");
      return;
    }
    for (const { lotId, quantity } of plan.consumed) {
      consumeResourceLotQuantity(ctx, lotId, quantity, jobId);
    }
    completePhase(ctx, jobId);
    return;
  }

  completePhase(ctx, jobId);
}

/**
 * Una instalación técnica (bomba) solo se repara tras diagnosticarla (S7
 * §6.8: "una reparación requiere diagnóstico suficiente"): hace falta una
 * prueba previa o haberla visto averiarse. Los objetos sueltos y muebles no
 * lo exigen en este recorte (su avería es visible al registrarlos).
 */
function requiresDiagnosisFirst(state: SimulationStateV2, job: Job): boolean {
  if (job.actionKey !== "repair" || job.target.kind !== "world_object") return false;
  const obj = state.worldObjects[job.target.worldObjectId];
  if (!obj || !obj.installedAt) return false;
  return !obj.knownEvidenceIds.some((e) => e.startsWith("tested@") || e.startsWith("broke_down@"));
}

/** Desmontar exige vaciar el contenedor anfitrión y descargar el medio (SET-009 §3.4 paso 5). `null` si se puede desmontar ya. */
function disassemblyPreconditionReason(state: SimulationStateV2, job: Job): string | null {
  if (job.actionKey !== "disassemble_selective" && job.actionKey !== "disassemble_destructive") return null;
  const resolved = resolveTransformEntity(state, job.target);
  if (!resolved) return null;
  if (resolved.kind === "transport_means") return resolved.entity.currentLoadBundleId ? "block.transport_loaded" : null;
  const containerId = resolved.entity.containerId;
  const container = containerId ? state.containers[containerId] : undefined;
  if (container && container.contentIds.length > 0) return "block.container_not_empty";
  return null;
}

/**
 * Materiales concretos disponibles para una reparación en el lugar de
 * trabajo (S7 §6.8, CAT-005 §4.3): lotes en la misma estancia que el
 * objetivo (sueltos o en contenedores), lotes que lleva la propia persona
 * ejecutora, o lotes al alcance (≤ 6 m) de un objetivo exterior como la
 * bomba. Nunca de un almacén remoto ni de lo que lleva otra persona.
 * Devuelve `null` si el trabajo no es una reparación con perfil; si no,
 * el plan de consumo y si falta algo.
 */
function missingMaterialsForRepair(state: SimulationStateV2, job: Job, executorId: string): { consumed: { lotId: string; quantity: number }[]; missing: boolean } | null {
  if (job.actionKey !== "repair") return null;
  const profileId = resolveTransformationProfileId(state, job.target, "repair");
  const profile = profileId ? REPAIR_PROFILES_BY_ID.get(profileId) : undefined;
  if (!profile) return null;
  const targetLocation = resolveTargetLocation(state, job.target);
  if (!targetLocation) return null;
  const consumed: { lotId: string; quantity: number }[] = [];
  let missing = false;
  for (const requirement of profile.requirements) {
    const available = findWorkSiteResourceLots(state, targetLocation, executorId, requirement.resourceFamily);
    let remaining = requirement.quantity;
    for (const lot of available) {
      if (remaining <= 0) break;
      const take = Math.min(remaining, lot.quantity);
      consumed.push({ lotId: lot.id, quantity: take });
      remaining -= take;
    }
    if (remaining > 0) missing = true;
  }
  return { consumed, missing };
}

const WORK_SITE_REACH_METERS = 6;

function findWorkSiteResourceLots(state: SimulationStateV2, targetLocation: Job["location"], executorId: string, family: ResourceLot["family"]): ResourceLot[] {
  const targetRoomId = resolveRoomId(state, targetLocation);
  const targetPoint = targetRoomId ? null : locationWorldPoint(state, targetLocation);
  return valuesById(state.resourceLots)
    .filter((lot) => lot.family === family && lot.quantity > 0 && !lot.reservedByJobId)
    .filter((lot) => {
      const holder = resolveHolderPersonId(state, lot.location);
      if (holder === executorId) return true;
      if (holder !== null) return false; // lo lleva otra persona: no se consume a distancia.
      if (targetRoomId) return resolveRoomId(state, lot.location) === targetRoomId;
      if (!targetPoint) return false;
      if (resolveRoomId(state, lot.location) !== null) return false;
      const lotPoint = locationWorldPoint(state, lot.location);
      return lotPoint !== null && Math.hypot(lotPoint.x - targetPoint.x, lotPoint.y - targetPoint.y) <= WORK_SITE_REACH_METERS;
    })
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

function consumeResourceLotQuantity(ctx: Ctx, lotId: string, quantity: number, jobId: string): void {
  const lot = ctx.state.resourceLots[lotId];
  if (!lot) return;
  const nextQuantity = lot.quantity - quantity;
  ctx.state = nextQuantity <= 0 ? removeResourceLot(ctx.state, lotId) : { ...ctx.state, resourceLots: { ...ctx.state.resourceLots, [lotId]: { ...lot, quantity: nextQuantity } } };
  const eventId = withNextEventId(ctx);
  emit(ctx, { type: "resource_lot_consumed", eventId, simSeconds: ctx.state.clock.elapsedSimSeconds, causedByCommandId: null, resourceLotId: lotId, jobId, quantity });
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
    const variation = round6(sampleVariationD(stream));
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

  const remaining = round6(Math.max(0, job.workRemainingUnits - elapsedMinutes));
  const progressRatio = round6(def.baseWorkUnits > 0 ? Math.min(1, 1 - remaining / def.baseWorkUnits) : 1);
  putJob(ctx, { ...ctx.state.jobs[jobId]!, workRemainingUnits: remaining, progressRatio });
  if (remaining <= 0) {
    applyConsequences(ctx, ctx.state.jobs[jobId]!, def, executorId, "favorable");
    completePhase(ctx, jobId);
  }
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
  const marginPrevious = round6(isUniversalCapacity(capacityEffective) ? 10 - difficultyEffective : capacityEffective - difficultyEffective);

  const stream = new PrngStream(ctx.state.prng.resolution);
  const variationB = round6(sampleVariationB(stream));
  ctx.state = { ...ctx.state, prng: { ...ctx.state.prng, resolution: stream.snapshot() } };

  const marginFinal = round6(marginPrevious + variationB);
  const band = bandForMargin(marginFinal);

  const episodeId = nextEpisodeId(ctx.state);
  const episode: WorkEpisode = {
    id: episodeId,
    jobId,
    phase: "execute",
    executorPersonId: executorId,
    capacityEffective: isUniversalCapacity(capacityEffective) ? 10 : round6(capacityEffective),
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

function applyConsequences(ctx: Ctx, job: Job, def: ActionMethodDefinition, executorId: string, band: OutcomeBand): void {
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
  if (job.actionKey === "repair") {
    applyRepairConsequences(ctx, job, band);
  }
  if (job.actionKey === "disassemble_selective" || job.actionKey === "disassemble_destructive") {
    applyDisassemblyConsequences(ctx, job);
  }
  if (job.actionKey === "test_installation") {
    applyInstallationTestConsequences(ctx, job);
  }
  if (job.actionKey === "draw_water") {
    applyDrawWaterConsequences(ctx, job, executorId);
  }
}

/** Probar/diagnosticar (S7 §6.10): la comunidad reconoce el estado funcional real y las causas de las funciones inactivas. */
function applyInstallationTestConsequences(ctx: Ctx, job: Job): void {
  if (job.target.kind !== "world_object") return;
  const obj = ctx.state.worldObjects[job.target.worldObjectId];
  if (!obj) return;
  const evidence = `tested@${ctx.state.clock.elapsedSimSeconds}`;
  ctx.state = { ...ctx.state, worldObjects: { ...ctx.state.worldObjects, [obj.id]: { ...obj, knownEvidenceIds: [...obj.knownEvidenceIds, evidence] } } };
  const eventId = withNextEventId(ctx);
  emit(ctx, {
    type: "installation_tested",
    eventId,
    simSeconds: ctx.state.clock.elapsedSimSeconds,
    causedByCommandId: null,
    objectId: obj.id,
    jobId: job.id,
    functionalState: obj.functionalState,
    inactiveFunctionKeys: Object.keys(obj.inactiveFunctionReasons).sort(),
  });
}

/** Recipientes de líquido con hueco que la persona lleva o que están al pie de la instalación, en orden estable. */
function waterVesselsFor(state: SimulationStateV2, pump: WorldObject, executorId: string): { obj: WorldObject; free: number }[] {
  const pumpPoint = locationWorldPoint(state, pump.location);
  return valuesById(state.worldObjects)
    .filter((o) => o.id !== pump.id)
    .map((o) => ({ obj: o, capacity: liquidCapacityOf(o) }))
    .filter((v): v is { obj: WorldObject; capacity: number } => v.capacity !== null)
    .filter(({ obj }) => {
      const holder = resolveHolderPersonId(state, obj.location);
      if (holder === executorId) return true;
      if (holder !== null || !pumpPoint) return false;
      const point = locationWorldPoint(state, obj.location);
      return point !== null && resolveRoomId(state, obj.location) === null && Math.hypot(point.x - pumpPoint.x, point.y - pumpPoint.y) <= WORK_SITE_REACH_METERS;
    })
    .map(({ obj, capacity }) => ({ obj, free: Math.max(0, capacity - liquidHeldBy(state, obj.id)) }))
    .filter((v) => v.free > 0)
    .sort((a, b) => (a.obj.id < b.obj.id ? -1 : a.obj.id > b.obj.id ? 1 : 0));
}

function drawWaterVesselReason(state: SimulationStateV2, job: Job, executorId: string): string | null {
  if (job.actionKey !== "draw_water" || job.target.kind !== "world_object") return null;
  const pump = state.worldObjects[job.target.worldObjectId];
  if (!pump) return null;
  return waterVesselsFor(state, pump, executorId).length === 0 ? "block.no_liquid_vessel" : null;
}

/**
 * Extraer agua (S7 §6.10): una bomba funcional conectada a su fuente llena
 * recipientes reales (que lleva la persona o que están al pie de la
 * bomba), nunca crea agua suelta ni en un almacén abstracto. Cada
 * extracción desgasta la bomba de forma determinista; al cruzar el umbral
 * del catálogo se avería con motivo causal y deja de producir agua hasta
 * que alguien la repare con piezas concretas.
 */
function applyDrawWaterConsequences(ctx: Ctx, job: Job, executorId: string): void {
  if (job.target.kind !== "world_object") return;
  const pump = ctx.state.worldObjects[job.target.worldObjectId];
  if (!pump) return;
  if (installationBlockReason(ctx.state, pump)) return; // se averió o desconectó entre tanto: no hay agua.
  let remaining = DRAW_WATER_LITERS_PER_JOB;
  for (const { obj, free } of waterVesselsFor(ctx.state, pump, executorId)) {
    if (remaining <= 0) break;
    const liters = Math.min(free, remaining);
    remaining -= liters;
    const existing = valuesById(ctx.state.resourceLots).find((lot) => lot.family === "water" && lot.location.kind === "on_object" && lot.location.objectId === obj.id);
    let lotId: string;
    if (existing) {
      lotId = existing.id;
      ctx.state = { ...ctx.state, resourceLots: { ...ctx.state.resourceLots, [lotId]: { ...existing, quantity: Math.round((existing.quantity + liters) * 1000) / 1000 } } };
    } else {
      lotId = `resource-lot-${ctx.state.sequences.nextEntityOrdinal}`;
      ctx.state = { ...ctx.state, sequences: { ...ctx.state.sequences, nextEntityOrdinal: ctx.state.sequences.nextEntityOrdinal + 1 } };
      const lot: ResourceLot = {
        id: lotId,
        family: "water",
        quantity: liters,
        unit: "liter",
        location: { kind: "on_object", objectId: obj.id },
        condition: 1,
        reservedByJobId: null,
        qualityKnown: true,
        quality: 1,
        provenance: `drawn_from:${pump.id}`,
        decayStartedAtSimSeconds: null,
        conditionAtDecayStart: null,
      };
      ctx.state = { ...ctx.state, resourceLots: { ...ctx.state.resourceLots, [lotId]: lot } };
    }
    const eventId = withNextEventId(ctx);
    emit(ctx, { type: "water_drawn", eventId, simSeconds: ctx.state.clock.elapsedSimSeconds, causedByCommandId: null, objectId: pump.id, jobId: job.id, resourceLotId: lotId, quantity: liters });
  }

  const wear = OBJECT_CATALOG_BY_VARIANT.get(pump.variant)?.wear;
  if (!wear) return;
  const worn = applyUseWear(ctx.state.worldObjects[pump.id]!, wear);
  const wornEntity = worn.brokeDown ? { ...worn.entity, knownEvidenceIds: [...worn.entity.knownEvidenceIds, `broke_down@${ctx.state.clock.elapsedSimSeconds}`] } : worn.entity;
  ctx.state = { ...ctx.state, worldObjects: { ...ctx.state.worldObjects, [pump.id]: wornEntity } };
  if (worn.brokeDown) {
    const eventId = withNextEventId(ctx);
    emit(ctx, { type: "object_broke_down", eventId, simSeconds: ctx.state.clock.elapsedSimSeconds, causedByCommandId: null, objectId: pump.id, entityKind: "world_object", jobId: job.id, reasonKey: "worn_out" });
  }
}

type TransformEntity = { kind: "world_object"; entity: WorldObject } | { kind: "furniture"; entity: Furniture } | { kind: "transport_means"; entity: TransportMeans };

/** Objeto, mueble o medio transformable referenciado por un `JobTarget` (S7 §16). `null` si el blanco no es transformable o ya no existe. */
function resolveTransformEntity(state: SimulationStateV2, target: JobTarget): TransformEntity | null {
  if (target.kind === "transport_means") {
    const entity = state.transportMeans[target.transportMeansId];
    return entity ? { kind: "transport_means", entity } : null;
  }
  if (target.kind === "world_object") {
    const entity = state.worldObjects[target.worldObjectId];
    return entity ? { kind: "world_object", entity } : null;
  }
  if (target.kind === "furniture") {
    const entity = state.furniture[target.furnitureId];
    return entity ? { kind: "furniture", entity } : null;
  }
  return null;
}

function putTransformEntity(ctx: Ctx, resolved: TransformEntity): void {
  if (resolved.kind === "world_object") {
    ctx.state = { ...ctx.state, worldObjects: { ...ctx.state.worldObjects, [resolved.entity.id]: resolved.entity } };
  } else if (resolved.kind === "transport_means") {
    ctx.state = { ...ctx.state, transportMeans: { ...ctx.state.transportMeans, [resolved.entity.id]: resolved.entity } };
  } else {
    ctx.state = { ...ctx.state, furniture: { ...ctx.state.furniture, [resolved.entity.id]: resolved.entity } };
  }
}

/** Resultado de una reparación (§16.2): completa/provisional/parcial según la banda del episodio; nunca eleva la calidad original ni recupera una función irreparable por sí sola. */
function applyRepairConsequences(ctx: Ctx, job: Job, band: OutcomeBand): void {
  const resolved = resolveTransformEntity(ctx.state, job.target);
  if (!resolved) return;
  const profileId = resolveTransformationProfileId(ctx.state, job.target, "repair");
  const profile = profileId ? REPAIR_PROFILES_BY_ID.get(profileId) : undefined;
  if (!profile) return;
  if (resolved.entity.functionalState === "irreparable") return; // una reparación nunca recupera automáticamente una función declarada irreparable (§16.2).

  if (resolved.entity.functionalState === "parts_only") return; // lo desmontado no se reconstruye reparando (§6.9: "cancelar no reconstruye lo ya retirado").

  const outcome: "complete" | "provisional" | "partial" = band === "exceptional" || band === "favorable" ? "complete" : band === "uncertain" ? "provisional" : "partial";
  const functionalStateAfter = outcome === "complete" ? profile.bestCaseFunctionalState : outcome === "provisional" ? "degraded" : resolved.entity.functionalState;

  // Solo se recuperan funciones cuyo motivo de inactividad es reparable con
  // piezas (S7 §6.8): `no_electricity` o `disassembled` nunca se levantan.
  const restoresFunctions = outcome !== "partial";
  const inactive = { ...resolved.entity.inactiveFunctionReasons };
  const functions = [...resolved.entity.functions];
  if (restoresFunctions) {
    for (const [fn, reason] of Object.entries(resolved.entity.inactiveFunctionReasons)) {
      if (!REPAIRABLE_INACTIVE_REASONS.has(reason)) continue;
      delete inactive[fn];
      if (!functions.includes(fn)) functions.push(fn);
    }
  }
  const repairedFields = {
    functionalState: functionalStateAfter,
    condition: Math.round(Math.min(1, resolved.entity.condition + (outcome === "partial" ? 0.05 : 0.25)) * 10000) / 10000,
    functions,
    inactiveFunctionReasons: inactive,
    knownEvidenceIds: [...resolved.entity.knownEvidenceIds, `repaired@${ctx.state.clock.elapsedSimSeconds}`],
  };
  putTransformEntity(ctx, { ...resolved, entity: { ...resolved.entity, ...repairedFields } } as TransformEntity);

  const eventId = withNextEventId(ctx);
  emit(ctx, {
    type: "object_repaired",
    eventId,
    simSeconds: ctx.state.clock.elapsedSimSeconds,
    causedByCommandId: null,
    objectId: resolved.entity.id,
    entityKind: resolved.kind,
    jobId: job.id,
    outcome,
    functionalStateAfter,
  });
}

/**
 * Resultado de un desmontaje (§16.3/§16.9): produce lotes de recurso
 * localizados según el perfil y el alcance elegido (nunca más de lo
 * declarado, conservación de masa), y elimina para siempre las funciones
 * del perfil. El objeto/mueble no desaparece: queda marcado `parts_only`
 * como evidencia física de lo ocurrido, coherente con §21 (capas de
 * edificio) para el caso de mobiliario/instalación.
 */
function applyDisassemblyConsequences(ctx: Ctx, job: Job): void {
  const resolved = resolveTransformEntity(ctx.state, job.target);
  if (!resolved) return;
  const profileId = resolveTransformationProfileId(ctx.state, job.target, job.actionKey);
  const profile = profileId ? DISASSEMBLY_PROFILES_BY_ID.get(profileId) : undefined;
  if (!profile) return;
  const scope = job.disassemblyScope ?? "selective";

  const location = resolved.kind === "furniture" ? furnitureLocation(resolved.entity) : resolved.entity.location;
  const producedResourceLotIds: string[] = [];
  for (const output of profile.outputs) {
    const quantity = scope === "selective" ? output.selectiveQuantity : output.destructiveQuantity;
    if (quantity <= 0) continue;
    const lotId = `resource-lot-${ctx.state.sequences.nextEntityOrdinal}`;
    ctx.state = { ...ctx.state, sequences: { ...ctx.state.sequences, nextEntityOrdinal: ctx.state.sequences.nextEntityOrdinal + 1 } };
    const lot: ResourceLot = {
      id: lotId,
      family: output.resourceFamily,
      quantity,
      unit: output.resourceFamily === "water" ? "liter" : "kilogram",
      location,
      condition: scope === "selective" ? 0.8 : 0.5,
      reservedByJobId: null,
      qualityKnown: true,
      quality: scope === "selective" ? 0.8 : 0.5,
      provenance: `disassembled_from:${resolved.entity.id}`,
      decayStartedAtSimSeconds: null,
      conditionAtDecayStart: null,
    };
    ctx.state = { ...ctx.state, resourceLots: { ...ctx.state.resourceLots, [lotId]: lot } };
    producedResourceLotIds.push(lotId);
  }

  const remainingInactive = { ...resolved.entity.inactiveFunctionReasons };
  for (const fn of profile.functionsLost) remainingInactive[fn] = "disassembled";
  const disassembledFields =
    resolved.kind === "transport_means"
      ? { functionalState: "parts_only" as const, functions: [], inactiveFunctionReasons: remainingInactive }
      : { functionalState: "parts_only" as const, functions: [], inactiveFunctionReasons: remainingInactive, capacityUnits: null };
  putTransformEntity(ctx, { ...resolved, entity: { ...resolved.entity, ...disassembledFields } } as TransformEntity);
  // El contenedor que materializaba el almacenamiento deja de admitir
  // contenido para siempre (ya se exigió vaciarlo en `prepare`).
  const hostedContainerId = resolved.kind === "transport_means" ? null : resolved.entity.containerId;
  const hostedContainer = hostedContainerId ? ctx.state.containers[hostedContainerId] : undefined;
  if (hostedContainer) ctx.state = { ...ctx.state, containers: { ...ctx.state.containers, [hostedContainer.id]: { ...hostedContainer, capacityUnits: 0 } } };

  const eventId = withNextEventId(ctx);
  emit(ctx, {
    type: "object_disassembled",
    eventId,
    simSeconds: ctx.state.clock.elapsedSimSeconds,
    causedByCommandId: null,
    objectId: resolved.entity.id,
    entityKind: resolved.kind,
    jobId: job.id,
    scope,
    producedResourceLotIds,
    functionsLost: [...profile.functionsLost],
  });
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
  ctx.state =
    nextQuantity <= 0
      ? removeResourceLot(ctx.state, resourceLotId)
      : { ...ctx.state, resourceLots: { ...ctx.state.resourceLots, [resourceLotId]: { ...lot, quantity: nextQuantity, reservedByJobId: null } } };
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

/** Elimina un lote agotado sin dejar contenido huérfano en su contenedor (jerarquía bidireccional, §6.4). */
function removeResourceLot(state: SimulationStateV2, lotId: string): SimulationStateV2 {
  const lot = state.resourceLots[lotId];
  if (!lot) return state;
  let containers = state.containers;
  if (lot.location.kind === "container") {
    const container = containers[lot.location.containerId];
    if (container) containers = { ...containers, [container.id]: { ...container, contentIds: container.contentIds.filter((id) => id !== lotId) } };
  }
  return { ...state, containers, resourceLots: removeKey(state.resourceLots, lotId) };
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
  for (const job of jobsInOrder(ctx.state.jobs)) {
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
