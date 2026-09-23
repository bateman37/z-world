import type { DomainEventV2, Job, JobPhaseKind, Reservation, ReservationTargetKind, SimulationStateV2 } from "@z-world/contracts";
import { valuesById } from "../ordered.js";
import { nextEventId } from "../../sequences.js";

/** ID derivado solo de la secuencia causal (el evento `reservation_created` consume ese número): determinista entre ejecuciones y recargas (S7; antes usaba un contador global de módulo). */
function nextReservationId(state: SimulationStateV2): string {
  return `reservation-s${state.sequences.nextDomainEventSequence}`;
}

export interface ReserveResult {
  readonly state: SimulationStateV2;
  readonly reservation: Reservation;
  readonly events: readonly DomainEventV2[];
}

/**
 * Reserva un lote de recurso para un trabajo (§6.6/§11.8, subhito S5):
 * impide doble consumo (§14.5). Las reservas exclusivas de objeto, mueble,
 * contenedor y medio de S7 viven en `reserveExclusiveTarget`; las de carga
 * y transporte en ruta llegan en S8.
 */
export function reserveResourceLot(state: SimulationStateV2, job: Job, resourceLotId: string, phase: JobPhaseKind): ReserveResult | null {
  const lot = state.resourceLots[resourceLotId];
  if (!lot || lot.reservedByJobId) return null;
  const { eventId, sequences } = nextEventId(state.sequences);
  const reservation: Reservation = {
    id: nextReservationId(state),
    targetKind: "resource_lot",
    targetId: resourceLotId,
    quantity: null,
    jobId: job.id,
    phase,
    releasePolicy: "on_job_end",
    createdAtSimSeconds: state.clock.elapsedSimSeconds,
  };
  const event: DomainEventV2 = {
    type: "reservation_created",
    eventId,
    simSeconds: state.clock.elapsedSimSeconds,
    causedByCommandId: null,
    reservationId: reservation.id,
    jobId: job.id,
    targetKind: "resource_lot",
    targetId: resourceLotId,
  };
  const nextState: SimulationStateV2 = {
    ...state,
    sequences,
    reservations: { ...state.reservations, [reservation.id]: reservation },
    resourceLots: { ...state.resourceLots, [resourceLotId]: { ...lot, reservedByJobId: job.id } },
  };
  return { state: nextState, reservation, events: [event] };
}

/**
 * Reserva exclusiva profunda de S7 (§7.7/§9 del prompt S7-S9: "reservas
 * impiden doble uso"): un objeto, mueble, contenedor o medio de
 * transporte concreto solo puede estar comprometido con un único trabajo a
 * la vez. Devuelve `null` si otro trabajo ya lo tiene reservado (el
 * llamador bloquea con `block.target_reserved`, nunca comparte en
 * silencio). Un `WorldObject` refleja además la reserva en
 * `ownerOrReservedByJobId`, que la proyección usa para mostrarlo como
 * bloqueado.
 */
export function reserveExclusiveTarget(
  state: SimulationStateV2,
  job: Job,
  targetKind: Exclude<ReservationTargetKind, "resource_lot" | "person" | "room">,
  targetId: string,
  phase: JobPhaseKind,
): ReserveResult | null {
  const alreadyReserved = Object.values(state.reservations).some((r) => r.targetKind === targetKind && r.targetId === targetId);
  if (alreadyReserved) return null;
  if (targetKind === "world_object") {
    const obj = state.worldObjects[targetId];
    if (!obj || (obj.ownerOrReservedByJobId && obj.ownerOrReservedByJobId !== job.id)) return null;
  }
  const { eventId, sequences } = nextEventId(state.sequences);
  const reservation: Reservation = {
    id: nextReservationId(state),
    targetKind,
    targetId,
    quantity: null,
    jobId: job.id,
    phase,
    releasePolicy: "on_job_end",
    createdAtSimSeconds: state.clock.elapsedSimSeconds,
  };
  const event: DomainEventV2 = {
    type: "reservation_created",
    eventId,
    simSeconds: state.clock.elapsedSimSeconds,
    causedByCommandId: null,
    reservationId: reservation.id,
    jobId: job.id,
    targetKind,
    targetId,
  };
  let worldObjects = state.worldObjects;
  if (targetKind === "world_object") {
    worldObjects = { ...worldObjects, [targetId]: { ...worldObjects[targetId]!, ownerOrReservedByJobId: job.id } };
  }
  return { state: { ...state, sequences, worldObjects, reservations: { ...state.reservations, [reservation.id]: reservation } }, reservation, events: [event] };
}

/**
 * Reserva de persona porteadora (S8, §7.7 del prompt S7-S9: «personas/
 * funciones incompatibles»): una persona comprometida en un traslado no
 * puede reservarse para otro trabajo a la vez. Exclusiva, como el resto de
 * reservas profundas; `null` si otra reserva vigente ya la compromete.
 */
export function reservePerson(state: SimulationStateV2, job: Job, personId: string, phase: JobPhaseKind): ReserveResult | null {
  if (!state.people[personId]) return null;
  const existing = Object.values(state.reservations).find((r) => r.targetKind === "person" && r.targetId === personId);
  if (existing && existing.jobId !== job.id) return null;
  if (existing) return null;
  const { eventId, sequences } = nextEventId(state.sequences);
  const reservation: Reservation = {
    id: nextReservationId(state),
    targetKind: "person",
    targetId: personId,
    quantity: null,
    jobId: job.id,
    phase,
    releasePolicy: "on_job_end",
    createdAtSimSeconds: state.clock.elapsedSimSeconds,
  };
  const event: DomainEventV2 = {
    type: "reservation_created",
    eventId,
    simSeconds: state.clock.elapsedSimSeconds,
    causedByCommandId: null,
    reservationId: reservation.id,
    jobId: job.id,
    targetKind: "person",
    targetId: personId,
  };
  const jobs = { ...state.jobs, [job.id]: { ...(state.jobs[job.id] ?? job), reservationIds: [...(state.jobs[job.id] ?? job).reservationIds, reservation.id] } };
  return { state: { ...state, sequences, jobs, reservations: { ...state.reservations, [reservation.id]: reservation } }, reservation, events: [event] };
}

/** ¿Está la persona comprometida por la reserva vigente de otro trabajo? */
export function personReservedByOtherJob(state: SimulationStateV2, personId: string, jobId: string | null): boolean {
  return Object.values(state.reservations).some((r) => r.targetKind === "person" && r.targetId === personId && r.jobId !== jobId);
}

/** Libera todas las reservas de un trabajo (cancelación, bloqueo definitivo o cierre, §11.8: "reservar no teletransporta; al cancelar o fallar... la reserva se libera"). */
export function releaseJobReservations(state: SimulationStateV2, jobId: string): { readonly state: SimulationStateV2; readonly events: readonly DomainEventV2[] } {
  const events: DomainEventV2[] = [];
  let sequences = state.sequences;
  let resourceLots = state.resourceLots;
  let worldObjects = state.worldObjects;
  const remainingReservations = { ...state.reservations };

  for (const reservation of valuesById(state.reservations)) {
    if (reservation.jobId !== jobId) continue;
    delete remainingReservations[reservation.id];
    if (reservation.targetKind === "resource_lot") {
      const lot = resourceLots[reservation.targetId];
      if (lot && lot.reservedByJobId === jobId) {
        resourceLots = { ...resourceLots, [reservation.targetId]: { ...lot, reservedByJobId: null } };
      }
    }
    if (reservation.targetKind === "world_object") {
      const obj = worldObjects[reservation.targetId];
      if (obj && obj.ownerOrReservedByJobId === jobId) {
        worldObjects = { ...worldObjects, [reservation.targetId]: { ...obj, ownerOrReservedByJobId: null } };
      }
    }
    const { eventId, sequences: nextSequences } = nextEventId(sequences);
    sequences = nextSequences;
    events.push({ type: "reservation_released", eventId, simSeconds: state.clock.elapsedSimSeconds, causedByCommandId: null, reservationId: reservation.id, jobId });
  }

  // Reservas bidireccionales (§12 del prompt S7-S9): el trabajo solo lista sus reservas vigentes.
  const job = state.jobs[jobId];
  const jobs = job && job.reservationIds.length > 0 ? { ...state.jobs, [jobId]: { ...job, reservationIds: job.reservationIds.filter((id) => remainingReservations[id]) } } : state.jobs;
  return { state: { ...state, sequences, reservations: remainingReservations, resourceLots, worldObjects, jobs }, events };
}

export type { ReservationTargetKind };
