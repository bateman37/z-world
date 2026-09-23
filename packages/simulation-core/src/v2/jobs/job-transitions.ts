import type { DomainEventV2, Job, JobState, SimulationStateV2 } from "@z-world/contracts";
import { JOB_LEGAL_TRANSITIONS } from "@z-world/contracts";
import { nextEventId } from "../../sequences.js";

export interface TransitionResult {
  readonly job: Job;
  readonly events: readonly DomainEventV2[];
  readonly sequences: SimulationStateV2["sequences"];
}

/**
 * Aplica una transición de la máquina de estados de `Job` (§6.2/§11.2,
 * subhito S5). Una transición ilegal se rechaza devolviendo el trabajo sin
 * cambios y ningún evento, nunca lanzando una excepción: el motor de
 * avance decide qué intentar a continuación en el mismo tick.
 */
export function transitionJob(
  state: SimulationStateV2,
  job: Job,
  toState: JobState,
  reasonKey: string | null,
): TransitionResult {
  if (job.state === toState) return { job, events: [], sequences: state.sequences };
  const legal = JOB_LEGAL_TRANSITIONS[job.state] ?? [];
  if (!legal.includes(toState)) {
    return { job, events: [], sequences: state.sequences };
  }
  const { eventId, sequences } = nextEventId(state.sequences);
  const event: DomainEventV2 = {
    type: "job_state_changed",
    eventId,
    simSeconds: state.clock.elapsedSimSeconds,
    causedByCommandId: null,
    jobId: job.id,
    fromState: job.state,
    toState,
    reasonKey,
  };
  const updatedJob: Job = { ...job, state: toState, updatedAtSimSeconds: state.clock.elapsedSimSeconds, blockReasonKey: toState === "blocked" ? reasonKey : null };
  return { job: updatedJob, events: [event], sequences };
}

export function isTransitionLegal(from: JobState, to: JobState): boolean {
  return (JOB_LEGAL_TRANSITIONS[from] ?? []).includes(to);
}
