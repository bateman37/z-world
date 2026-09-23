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

/**
 * Eventos de dominio del runtime V2 (S3 de WEB-002 §5.1): reutiliza sin
 * cambios los eventos de movimiento/reloj/prioridad de V1 (misma forma
 * exacta, mismos códigos de rechazo) y añade solo los eventos causales
 * nuevos de S3 — transición exterior/interior y descubrimiento — como
 * límites causales significativos, nunca telemetría por tick.
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
]);

export type DomainEventV2 = z.infer<typeof domainEventV2Schema>;
