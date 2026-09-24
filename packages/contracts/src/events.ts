import { z } from "zod";
import { worldPointSchema } from "./geometry.js";

/**
 * Eventos de dominio significativos (§7.2). Representan límites causales
 * auditables, nunca telemetría por fotograma/tick.
 */

export const MOVE_REJECTION_CODES = [
  "destination_outside_world",
  "destination_hidden",
  "destination_not_transitable",
  "no_known_route",
  "person_already_ordered",
  "stale_or_duplicate_command",
  /** S9: un acceso de la ruta dejó de ser transitable (tapiado, barricada, bloqueo, demolición) durante el recorrido. */
  "access_no_longer_passable",
] as const;
export type MoveRejectionCode = (typeof MOVE_REJECTION_CODES)[number];

const baseEventFields = {
  eventId: z.string().min(1),
  simSeconds: z.number().int().nonnegative(),
  causedByCommandId: z.string().nullable(),
};

export const gameCreatedEventSchema = z.object({
  ...baseEventFields,
  type: z.literal("game_created"),
  seed: z.string(),
});

export const speedOrPauseChangedEventSchema = z.object({
  ...baseEventFields,
  type: z.literal("speed_or_pause_changed"),
  speed: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(4), z.literal(10)]),
});

export const moveOrderAcceptedEventSchema = z.object({
  ...baseEventFields,
  type: z.literal("move_order_accepted"),
  personId: z.string(),
  destination: worldPointSchema,
});

export const moveOrderRejectedEventSchema = z.object({
  ...baseEventFields,
  type: z.literal("move_order_rejected"),
  personId: z.string(),
  code: z.enum(MOVE_REJECTION_CODES),
});

export const movementStartedEventSchema = z.object({
  ...baseEventFields,
  type: z.literal("movement_started"),
  personId: z.string(),
});

export const movementCompletedEventSchema = z.object({
  ...baseEventFields,
  type: z.literal("movement_completed"),
  personId: z.string(),
});

export const movementBlockedEventSchema = z.object({
  ...baseEventFields,
  type: z.literal("movement_blocked"),
  personId: z.string(),
  code: z.enum(MOVE_REJECTION_CODES),
});

export const movementCancelledEventSchema = z.object({
  ...baseEventFields,
  type: z.literal("movement_cancelled"),
  personId: z.string(),
});

export const priorityChangedEventSchema = z.object({
  ...baseEventFields,
  type: z.literal("priority_changed"),
  personId: z.string(),
  priorityId: z.string(),
  value: z.union([
    z.literal("never"),
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
  ]),
});

export const domainEventSchema = z.discriminatedUnion("type", [
  gameCreatedEventSchema,
  speedOrPauseChangedEventSchema,
  moveOrderAcceptedEventSchema,
  moveOrderRejectedEventSchema,
  movementStartedEventSchema,
  movementCompletedEventSchema,
  movementBlockedEventSchema,
  movementCancelledEventSchema,
  priorityChangedEventSchema,
]);

export type DomainEvent = z.infer<typeof domainEventSchema>;
