import type { ActionMethodDefinition, AttentionMode, DomainEventV2, Job, JobOrigin, JobPhase, JobTarget, PaceMode, SimulationStateV2 } from "@z-world/contracts";
import { nextEventId } from "../../sequences.js";
import { resolveTargetLocation } from "./location-utils.js";

export interface CreateJobParams {
  readonly actionKey: string;
  readonly def: ActionMethodDefinition;
  readonly target: JobTarget;
  readonly origin: JobOrigin;
  readonly causingCommandOrDesignationId: string | null;
  readonly directOrder: boolean;
  readonly requestedPersonIds: readonly string[];
  readonly pace?: PaceMode;
  readonly attention?: AttentionMode;
  readonly urgency?: number;
  readonly disassemblyScope?: "selective" | "destructive" | null;
  readonly irreversibleConfirmed?: boolean;
  readonly storageItem?: Job["storageItem"];
}

export interface CreateJobResult {
  readonly job: Job;
  readonly events: readonly DomainEventV2[];
  readonly sequences: SimulationStateV2["sequences"];
}

let jobCounter = 0;

/** Genera un ID de trabajo determinista a partir de las secuencias causales del estado, nunca de `Date.now()`/`Math.random()` (§6.1 de WEB-002: prohibido en núcleo). */
function nextJobId(state: SimulationStateV2): string {
  jobCounter += 1;
  return `job-${state.sequences.nextDomainEventSequence}-${jobCounter}`;
}

/**
 * Construye un `Job` completo a partir de una definición de método
 * catalogada (§11.1, subhito S5). No decide asignación ni reserva: eso
 * corresponde al planificador/motor de avance. El trabajo nace `proposed`
 * y solo la máquina de avance lo mueve a `available`/`reserved`/`assigned`.
 */
export function createJob(state: SimulationStateV2, params: CreateJobParams): CreateJobResult | { readonly rejectedReasonKey: string } {
  const location = resolveTargetLocation(state, params.target);
  if (!location) return { rejectedReasonKey: "block.target_no_longer_exists" };

  const phases: JobPhase[] = params.def.phases.map((kind) => ({ kind, state: "pending" as const }));
  const jobId = nextJobId(state);
  const { eventId, sequences } = nextEventId(state.sequences);

  const job: Job = {
    id: jobId,
    origin: params.origin,
    causingCommandOrDesignationId: params.causingCommandOrDesignationId,
    actionKey: params.actionKey,
    methodVersion: params.def.version,
    target: params.target,
    effectivePriority: params.def.priority,
    location,
    urgency: params.urgency ?? (params.directOrder ? 5 : 1),
    knowledgeUsed: [],
    phases,
    currentPhaseIndex: 0,
    assignments: [],
    requestedPersonIds: params.requestedPersonIds,
    desiredTeamSize: params.requestedPersonIds.length || params.def.recommendedParticipants,
    pace: params.pace ?? "normal",
    attention: params.attention ?? "standard",
    timeLimit: null,
    responsePolicy: "standard",
    state: "proposed",
    blockReasonKey: null,
    reservationIds: [],
    episodeIds: [],
    progressRatio: 0,
    workRemainingUnits: params.def.baseWorkUnits,
    workRateVariation: null,
    directOrder: params.directOrder,
    disassemblyScope: params.disassemblyScope ?? null,
    irreversibleConfirmed: params.irreversibleConfirmed ?? false,
    storageItem: params.storageItem ?? null,
    createdAtSimSeconds: state.clock.elapsedSimSeconds,
    updatedAtSimSeconds: state.clock.elapsedSimSeconds,
  };

  const event: DomainEventV2 = {
    type: "job_created",
    eventId,
    simSeconds: state.clock.elapsedSimSeconds,
    causedByCommandId: params.causingCommandOrDesignationId,
    jobId,
    actionKey: params.actionKey,
    origin: params.origin,
  };

  return { job, events: [event], sequences };
}
