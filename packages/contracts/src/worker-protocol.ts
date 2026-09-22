import { z } from "zod";
import { simulationCommandSchema } from "./commands.js";
import { simulationStateV1Schema, type SimulationStateV1 } from "./state.js";
import { domainEventSchema, type DomainEvent } from "./events.js";
import type { SimulationCommand } from "./commands.js";
import type { WorkerProjections } from "./projections.js";

/**
 * Protocolo tipado y validado entre orquestación (hilo principal) y el Web
 * Worker (§8.1). Ambos sentidos declaran una versión para poder rechazar
 * payloads incompatibles con un mensaje visible en vez de fallar en
 * silencio. El Worker nunca importa Prisma: cuando decide que toca
 * persistir, emite `snapshot_ready` y espera que la orquestación confirme
 * con `snapshot_persisted` o informe `snapshot_persist_failed`.
 *
 * Los esquemas Zod validan la FORMA en tiempo de ejecución (frontera
 * `postMessage`, que no ofrece tipos); los tipos de dominio siguientes
 * son la forma de trabajo en TypeScript. `parseToWorkerMessage` /
 * `parseFromWorkerMessage` son la única frontera de cast entre ambos.
 */
export const WORKER_PROTOCOL_VERSION = 1 as const;

export const SNAPSHOT_REASONS = [
  "game_created",
  "session_pause_or_relevant_change",
  "order_settled",
  "priority_changed",
  "manual_save",
  "visibility_lost_best_effort",
] as const;
export type SnapshotReason = (typeof SNAPSHOT_REASONS)[number];

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
});

export const tickMessageSchema = z.object({
  type: z.literal("tick"),
  protocolVersion: z.literal(WORKER_PROTOCOL_VERSION),
  nowMs: z.number(),
});

export const snapshotPersistedMessageSchema = z.object({
  type: z.literal("snapshot_persisted"),
  protocolVersion: z.literal(WORKER_PROTOCOL_VERSION),
  revision: z.number().int().nonnegative(),
});

export const snapshotPersistFailedMessageSchema = z.object({
  type: z.literal("snapshot_persist_failed"),
  protocolVersion: z.literal(WORKER_PROTOCOL_VERSION),
  code: z.enum(["network_error", "server_error", "revision_conflict"]),
});

export const toWorkerMessageSchema = z.discriminatedUnion("type", [
  loadStateMessageSchema,
  commandMessageSchema,
  requestSnapshotMessageSchema,
  tickMessageSchema,
  snapshotPersistedMessageSchema,
  snapshotPersistFailedMessageSchema,
]);

export const projectionsMessageSchema = z.object({
  type: z.literal("projections"),
  protocolVersion: z.literal(WORKER_PROTOCOL_VERSION),
  projections: z.unknown(),
});

export const snapshotReadyMessageSchema = z.object({
  type: z.literal("snapshot_ready"),
  protocolVersion: z.literal(WORKER_PROTOCOL_VERSION),
  gameSaveId: z.string(),
  expectedRevision: z.number().int().nonnegative(),
  reason: z.enum(SNAPSHOT_REASONS),
  state: simulationStateV1Schema,
  events: z.array(domainEventSchema),
});

export const workerErrorMessageSchema = z.object({
  type: z.literal("worker_error"),
  protocolVersion: z.literal(WORKER_PROTOCOL_VERSION),
  code: z.enum(["incompatible_protocol_version", "invalid_payload", "internal_error"]),
  messageKey: z.string(),
});

export const fromWorkerMessageSchema = z.discriminatedUnion("type", [
  projectionsMessageSchema,
  snapshotReadyMessageSchema,
  workerErrorMessageSchema,
]);

/** Tipos de dominio de trabajo (ver nota de frontera de cast arriba). */
export type ToWorkerMessage =
  | { readonly type: "load_state"; readonly protocolVersion: 1; readonly gameSaveId: string; readonly revision: number; readonly state: SimulationStateV1 }
  | { readonly type: "command"; readonly protocolVersion: 1; readonly command: SimulationCommand }
  | { readonly type: "request_snapshot"; readonly protocolVersion: 1 }
  | { readonly type: "tick"; readonly protocolVersion: 1; readonly nowMs: number }
  | { readonly type: "snapshot_persisted"; readonly protocolVersion: 1; readonly revision: number }
  | { readonly type: "snapshot_persist_failed"; readonly protocolVersion: 1; readonly code: "network_error" | "server_error" | "revision_conflict" };

export type FromWorkerMessage =
  | { readonly type: "projections"; readonly protocolVersion: 1; readonly projections: WorkerProjections }
  | {
      readonly type: "snapshot_ready";
      readonly protocolVersion: 1;
      readonly gameSaveId: string;
      readonly expectedRevision: number;
      readonly reason: SnapshotReason;
      readonly state: SimulationStateV1;
      readonly events: readonly DomainEvent[];
    }
  | {
      readonly type: "worker_error";
      readonly protocolVersion: 1;
      readonly code: "incompatible_protocol_version" | "invalid_payload" | "internal_error";
      readonly messageKey: string;
    };

export interface ParseResult<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: string;
}

export function parseToWorkerMessage(raw: unknown): ParseResult<ToWorkerMessage> {
  const result = toWorkerMessageSchema.safeParse(raw);
  if (!result.success) return { success: false, error: result.error.message };
  return { success: true, data: result.data as unknown as ToWorkerMessage };
}
