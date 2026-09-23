import type { DomainEventV2, Job, JobPhaseKind, Reservation, ReservationTargetKind, SimulationStateV2 } from "@z-world/contracts";
import { nextEventId } from "../../sequences.js";

let reservationCounter = 0;
function nextReservationId(state: SimulationStateV2): string {
  reservationCounter += 1;
  return `reservation-${state.sequences.nextDomainEventSequence}-${reservationCounter}`;
}

export interface ReserveResult {
  readonly state: SimulationStateV2;
  readonly reservation: Reservation;
  readonly events: readonly DomainEventV2[];
}

/**
 * Reserva un blanco exclusivo para un trabajo (§6.6/§11.8, subhito S5). En
 * este alcance solo se reservan lotes de recurso (impide doble consumo,
 * §14.5) — las reservas profundas de herramientas/carga/transporte llegan
 * en S7/S8 (§6.6 del prompt de subhitos).
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

/** Libera todas las reservas de un trabajo (cancelación, bloqueo definitivo o cierre, §11.8: "reservar no teletransporta; al cancelar o fallar... la reserva se libera"). */
export function releaseJobReservations(state: SimulationStateV2, jobId: string): { readonly state: SimulationStateV2; readonly events: readonly DomainEventV2[] } {
  const events: DomainEventV2[] = [];
  let sequences = state.sequences;
  let resourceLots = state.resourceLots;
  const remainingReservations = { ...state.reservations };

  for (const reservation of Object.values(state.reservations)) {
    if (reservation.jobId !== jobId) continue;
    delete remainingReservations[reservation.id];
    if (reservation.targetKind === "resource_lot") {
      const lot = resourceLots[reservation.targetId];
      if (lot && lot.reservedByJobId === jobId) {
        resourceLots = { ...resourceLots, [reservation.targetId]: { ...lot, reservedByJobId: null } };
      }
    }
    const { eventId, sequences: nextSequences } = nextEventId(sequences);
    sequences = nextSequences;
    events.push({ type: "reservation_released", eventId, simSeconds: state.clock.elapsedSimSeconds, causedByCommandId: null, reservationId: reservation.id, jobId });
  }

  return { state: { ...state, sequences, reservations: remainingReservations, resourceLots }, events };
}

export type { ReservationTargetKind };
