import type { DomainEventV2, Job, PersonStateV2, SimulationStateV2 } from "@z-world/contracts";
import { nextEventId } from "../../sequences.js";
import type { NavigationIndexV2 } from "../room-graph.js";

/**
 * Contexto mutable de un paso del motor único de trabajos (`advance-jobs.ts`).
 * Extraído en S8 para que las fases logísticas de transporte
 * (`transport/phases.ts`) operen sobre exactamente el mismo estado, la
 * misma secuencia causal y la misma lista de eventos que el resto de fases:
 * no es una segunda tubería, es el mismo paso.
 */
export interface Ctx {
  state: SimulationStateV2;
  events: DomainEventV2[];
  nav: NavigationIndexV2;
  simSecondsToAdvance: number;
}

/** Operaciones del motor que las fases de transporte reutilizan (bloquear, completar, fallar, reservar). */
export interface EngineOps {
  completePhase(ctx: Ctx, jobId: string): void;
  blockJob(ctx: Ctx, jobId: string, reasonKey: string): void;
  failJobCausally(ctx: Ctx, jobId: string, reasonKey: string): void;
  acquireJobReservations(ctx: Ctx, jobId: string): string | null;
  mergeStoredLotIntoContainer(ctx: Ctx, lotId: string, containerId: string, jobId: string): void;
}

export function emit(ctx: Ctx, event: DomainEventV2): void {
  ctx.events.push(event);
}

export function withNextEventId(ctx: Ctx): string {
  const { eventId, sequences } = nextEventId(ctx.state.sequences);
  ctx.state = { ...ctx.state, sequences };
  return eventId;
}

export function putJob(ctx: Ctx, job: Job): void {
  ctx.state = { ...ctx.state, jobs: { ...ctx.state.jobs, [job.id]: job } };
}

export function setPerson(ctx: Ctx, personId: string, person: PersonStateV2): void {
  ctx.state = { ...ctx.state, people: { ...ctx.state.people, [personId]: person } };
}

/** Redondeo a 6 decimales en límites persistidos (PostgreSQL `jsonb`, ver S7). */
export function round6(value: number): number {
  return Math.round(value * 1_000_000) / 1_000_000;
}
