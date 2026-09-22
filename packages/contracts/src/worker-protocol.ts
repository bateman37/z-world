import { z } from "zod";
import { simulationCommandSchema } from "./commands.js";
import { simulationStateV1Schema } from "./state.js";

/**
 * Protocolo tipado y validado entre React/orquestación y el Web Worker
 * (§8.1). Ambos sentidos declaran una versión para poder rechazar payloads
 * incompatibles con un mensaje visible en vez de fallar en silencio.
 */
export const WORKER_PROTOCOL_VERSION = 1 as const;

export const loadStateMessageSchema = z.object({
  type: z.literal("load_state"),
  protocolVersion: z.literal(WORKER_PROTOCOL_VERSION),
  gameSaveId: z.string(),
  revision: z.number().int().nonnegative(),
  state: simulationStateV1Schema,
});

export const commandMessageSchema = z.object({
  type: z.literal("command"),
  protocolVersion: z.literal(WORKER_PROTOCOL_VERSION),
  command: simulationCommandSchema,
});

export const requestSnapshotMessageSchema = z.object({
  type: z.literal("request_snapshot"),
  protocolVersion: z.literal(WORKER_PROTOCOL_VERSION),
  reason: z.enum([
    "game_created",
    "session_pause_or_relevant_change",
    "order_settled",
    "priority_changed",
    "manual_save",
    "visibility_lost_best_effort",
  ]),
});

export const toWorkerMessageSchema = z.discriminatedUnion("type", [
  loadStateMessageSchema,
  commandMessageSchema,
  requestSnapshotMessageSchema,
]);
export type ToWorkerMessage = z.infer<typeof toWorkerMessageSchema>;

export const projectionsMessageSchema = z.object({
  type: z.literal("projections"),
  protocolVersion: z.literal(WORKER_PROTOCOL_VERSION),
});

export const snapshotReadyMessageSchema = z.object({
  type: z.literal("snapshot_ready"),
  protocolVersion: z.literal(WORKER_PROTOCOL_VERSION),
  gameSaveId: z.string(),
  expectedRevision: z.number().int().nonnegative(),
  reason: z.string(),
  state: simulationStateV1Schema,
  events: z.array(z.unknown()),
});

export const workerErrorMessageSchema = z.object({
  type: z.literal("worker_error"),
  protocolVersion: z.literal(WORKER_PROTOCOL_VERSION),
  code: z.enum([
    "incompatible_protocol_version",
    "invalid_payload",
    "internal_error",
  ]),
  messageKey: z.string(),
});

export type FromWorkerEnvelope =
  | { readonly type: "projections"; readonly protocolVersion: typeof WORKER_PROTOCOL_VERSION }
  | { readonly type: "snapshot_ready"; readonly protocolVersion: typeof WORKER_PROTOCOL_VERSION }
  | { readonly type: "worker_error"; readonly protocolVersion: typeof WORKER_PROTOCOL_VERSION };
