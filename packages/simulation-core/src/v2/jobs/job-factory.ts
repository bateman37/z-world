import type { ActionMethodDefinition, AttentionMode, DomainEventV2, Job, JobOrigin, JobPhase, JobTarget, PaceMode, SimulationStateV2 } from "@z-world/contracts";
import { nextEventId } from "../../sequences.js";
import { resolveTargetLocation } from "./location-utils.js";
import { s9WorkUnits } from "../exploitation/actions.js";
import { terrainWorkUnits } from "../terrain/actions.js";

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
  readonly storageQuantity?: number | null;
  readonly transport?: Job["transport"];
  readonly cropId?: string | null;
}

export interface CreateJobResult {
  readonly job: Job;
  readonly events: readonly DomainEventV2[];
  readonly sequences: SimulationStateV2["sequences"];
}


/** Genera un ID de trabajo determinista a partir de la secuencia causal del estado (el evento `job_created` consume ese mismo número), nunca de `Date.now()`/`Math.random()` ni de un contador global de módulo (§6.1 de WEB-002; corregido en S7). */
function nextJobId(state: SimulationStateV2): string {
  return `job-s${state.sequences.nextDomainEventSequence}`;
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
  // S9/S10: la duración real depende del blanco (puerta/portón, receta, m² de huella o de parcela, metros de vía/barrera), fijada por el catálogo versionado al crear el trabajo.
  const specificWorkUnits = s9WorkUnits(state, params.actionKey, params.target, params.storageItem ?? null) ?? terrainWorkUnits(state, params.actionKey, params.target);
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
    workRemainingUnits: specificWorkUnits ?? params.def.baseWorkUnits,
    workRateVariation: null,
    directOrder: params.directOrder,
    disassemblyScope: params.disassemblyScope ?? null,
    irreversibleConfirmed: params.irreversibleConfirmed ?? false,
    storageItem: params.storageItem ?? null,
    storageQuantity: params.storageQuantity ?? null,
    transport: params.transport ?? null,
    workTotalUnits: specificWorkUnits,
    cropId: params.cropId ?? null,
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
