import { z } from "zod";
import {
  gameCreatedEventSchema,
  speedOrPauseChangedEventSchema,
  moveOrderAcceptedEventSchema,
  moveOrderRejectedEventSchema,
  movementStartedEventSchema,
  movementCompletedEventSchema,
  movementBlockedEventSchema,
  movementCancelledEventSchema,
  priorityChangedEventSchema,
} from "./events.js";
import { JOB_PHASE_KINDS, JOB_STATES, OUTCOME_BAND_VALUES, RESERVATION_TARGET_KINDS, ZONE_POLICIES, DESIGNATION_KINDS } from "./work-v2.js";
import { NEED_BANDS, NEED_DIMENSIONS } from "./needs-v2.js";

/**
 * Eventos de dominio del runtime V2 (S3 de WEB-002 §5.1): reutiliza sin
 * cambios los eventos de movimiento/reloj/prioridad de V1 y añade los
 * eventos causales de S3 (exterior/interior, descubrimiento) más los de
 * S4-S6 (trabajos, fases, episodios, reservas, necesidades). Todos
 * representan límites causales, nunca telemetría por tick (§8 del prompt
 * de subhitos).
 */

const baseEventFields = {
  eventId: z.string().min(1),
  simSeconds: z.number().int().nonnegative(),
  causedByCommandId: z.string().nullable(),
};

export const DISCOVERY_ENTITY_KINDS = ["place", "building", "opening", "room"] as const;
export type DiscoveryEntityKind = (typeof DISCOVERY_ENTITY_KINDS)[number];

export const roomEnteredEventSchema = z.object({
  ...baseEventFields,
  type: z.literal("room_entered"),
  personId: z.string(),
  roomId: z.string(),
});

export const roomExitedEventSchema = z.object({
  ...baseEventFields,
  type: z.literal("room_exited"),
  personId: z.string(),
  roomId: z.string(),
});

export const discoveryUpgradedEventSchema = z.object({
  ...baseEventFields,
  type: z.literal("discovery_upgraded"),
  entityKind: z.enum(DISCOVERY_ENTITY_KINDS),
  entityId: z.string(),
  facet: z.string(),
  state: z.string(),
});

export const jobCreatedEventSchema = z.object({
  ...baseEventFields,
  type: z.literal("job_created"),
  jobId: z.string(),
  actionKey: z.string(),
  origin: z.string(),
});

export const jobStateChangedEventSchema = z.object({
  ...baseEventFields,
  type: z.literal("job_state_changed"),
  jobId: z.string(),
  fromState: z.enum(JOB_STATES),
  toState: z.enum(JOB_STATES),
  reasonKey: z.string().nullable(),
});

export const jobPhaseChangedEventSchema = z.object({
  ...baseEventFields,
  type: z.literal("job_phase_changed"),
  jobId: z.string(),
  phase: z.enum(JOB_PHASE_KINDS),
});

export const jobAssignmentChangedEventSchema = z.object({
  ...baseEventFields,
  type: z.literal("job_assignment_changed"),
  jobId: z.string(),
  personId: z.string(),
  change: z.enum(["added", "removed"]),
});

export const reservationCreatedEventSchema = z.object({
  ...baseEventFields,
  type: z.literal("reservation_created"),
  reservationId: z.string(),
  jobId: z.string(),
  targetKind: z.enum(RESERVATION_TARGET_KINDS),
  targetId: z.string(),
});

export const reservationReleasedEventSchema = z.object({
  ...baseEventFields,
  type: z.literal("reservation_released"),
  reservationId: z.string(),
  jobId: z.string(),
});

export const workEpisodeCreatedEventSchema = z.object({
  ...baseEventFields,
  type: z.literal("work_episode_created"),
  episodeId: z.string(),
  jobId: z.string(),
  band: z.enum(OUTCOME_BAND_VALUES),
});

export const needChangedEventSchema = z.object({
  ...baseEventFields,
  type: z.literal("need_changed"),
  personId: z.string(),
  dimension: z.enum(NEED_DIMENSIONS),
  band: z.enum(NEED_BANDS),
});

export const consumptionHappenedEventSchema = z.object({
  ...baseEventFields,
  type: z.literal("consumption_happened"),
  personId: z.string(),
  resourceLotId: z.string(),
  dimension: z.enum(NEED_DIMENSIONS),
  quantity: z.number().positive(),
});

export const restProgressedEventSchema = z.object({
  ...baseEventFields,
  type: z.literal("rest_progressed"),
  personId: z.string(),
  jobId: z.string(),
  completed: z.boolean(),
});

export const systemicIntentionCreatedEventSchema = z.object({
  ...baseEventFields,
  type: z.literal("systemic_intention_created"),
  personId: z.string(),
  dimension: z.enum(NEED_DIMENSIONS),
  jobId: z.string().nullable(),
  blockedReasonKey: z.string().nullable(),
});

export const workInterruptedEventSchema = z.object({
  ...baseEventFields,
  type: z.literal("work_interrupted"),
  jobId: z.string(),
  reasonKey: z.string(),
});

export const zoneChangedEventSchema = z.object({
  ...baseEventFields,
  type: z.literal("zone_changed"),
  zoneId: z.string(),
  change: z.enum(["created", "updated", "deleted"]),
  policy: z.enum(ZONE_POLICIES).nullable(),
});

export const designationChangedEventSchema = z.object({
  ...baseEventFields,
  type: z.literal("designation_changed"),
  designationId: z.string(),
  change: z.enum(["created", "cancelled"]),
  kind: z.enum(DESIGNATION_KINDS).nullable(),
});

export const domainEventV2Schema = z.discriminatedUnion("type", [
  gameCreatedEventSchema,
  speedOrPauseChangedEventSchema,
  moveOrderAcceptedEventSchema,
  moveOrderRejectedEventSchema,
  movementStartedEventSchema,
  movementCompletedEventSchema,
  movementBlockedEventSchema,
  movementCancelledEventSchema,
  priorityChangedEventSchema,
  roomEnteredEventSchema,
  roomExitedEventSchema,
  discoveryUpgradedEventSchema,
  jobCreatedEventSchema,
  jobStateChangedEventSchema,
  jobPhaseChangedEventSchema,
  jobAssignmentChangedEventSchema,
  reservationCreatedEventSchema,
  reservationReleasedEventSchema,
  workEpisodeCreatedEventSchema,
  needChangedEventSchema,
  consumptionHappenedEventSchema,
  restProgressedEventSchema,
  systemicIntentionCreatedEventSchema,
  workInterruptedEventSchema,
  zoneChangedEventSchema,
  designationChangedEventSchema,
]);

export type DomainEventV2 = z.infer<typeof domainEventV2Schema>;
