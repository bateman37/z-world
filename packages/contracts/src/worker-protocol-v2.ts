import { z } from "zod";
import { simulationCommandSchema, type SimulationCommand } from "./commands.js";
import { simulationStateV2Schema, type SimulationStateV2 } from "./state-v2.js";
import { domainEventV2Schema, type DomainEventV2 } from "./events-v2.js";
import type { WorkerProjectionsV2 } from "./projections-v2.js";

/**
 * Protocolo tipado y versionado del runtime V2 (S3 de WEB-002 §5.1). Es una
 * variante discriminada y versionada del protocolo de WEB-001, no una
 * mutación de él: `WORKER_PROTOCOL_VERSION_V2 = 2` (distinto de
 * `WORKER_PROTOCOL_VERSION = 1`) hace que un mensaje V1 enviado a una sesión
 * V2 — o viceversa — se rechace con `worker_error.invalid_payload` en vez de
 * confundirse en silencio (ninguno de los dos esquemas discriminados acepta
 * la forma del otro protocolo). Reutiliza sin cambios `SimulationCommand`
 * (los seis comandos ya sirven a V2, ver `apply-command-v2.ts`) y
 * `DomainEventV2` (superconjunto aditivo de los eventos V1). Ver DEC-0017.
 */
export const WORKER_PROTOCOL_VERSION_V2 = 2 as const;

export const SNAPSHOT_REASONS_V2 = [
  "game_created",
  "session_pause_or_relevant_change",
  "order_settled",
  "priority_changed",
  "manual_save",
  "visibility_lost_best_effort",
  "discovery_progressed",
] as const;
export type SnapshotReasonV2 = (typeof SNAPSHOT_REASONS_V2)[number];

export const loadStateMessageSchemaV2 = z.object({
  type: z.literal("load_state"),
  protocolVersion: z.literal(WORKER_PROTOCOL_VERSION_V2),
  gameSaveId: z.string(),
  revision: z.number().int().nonnegative(),
  state: simulationStateV2Schema,
});

export const commandMessageSchemaV2 = z.object({
  type: z.literal("command"),
  protocolVersion: z.literal(WORKER_PROTOCOL_VERSION_V2),
  command: simulationCommandSchema,
});

export const requestSnapshotMessageSchemaV2 = z.object({
  type: z.literal("request_snapshot"),
  protocolVersion: z.literal(WORKER_PROTOCOL_VERSION_V2),
});

export const tickMessageSchemaV2 = z.object({
  type: z.literal("tick"),
  protocolVersion: z.literal(WORKER_PROTOCOL_VERSION_V2),
  nowMs: z.number(),
});

export const snapshotPersistedMessageSchemaV2 = z.object({
  type: z.literal("snapshot_persisted"),
  protocolVersion: z.literal(WORKER_PROTOCOL_VERSION_V2),
  revision: z.number().int().nonnegative(),
});

export const snapshotPersistFailedMessageSchemaV2 = z.object({
  type: z.literal("snapshot_persist_failed"),
  protocolVersion: z.literal(WORKER_PROTOCOL_VERSION_V2),
  code: z.enum(["network_error", "server_error", "revision_conflict"]),
});

export const toWorkerMessageSchemaV2 = z.discriminatedUnion("type", [
  loadStateMessageSchemaV2,
  commandMessageSchemaV2,
  requestSnapshotMessageSchemaV2,
  tickMessageSchemaV2,
  snapshotPersistedMessageSchemaV2,
  snapshotPersistFailedMessageSchemaV2,
]);

export const projectionsMessageSchemaV2 = z.object({
  type: z.literal("projections"),
  protocolVersion: z.literal(WORKER_PROTOCOL_VERSION_V2),
  projections: z.unknown(),
});

export const snapshotReadyMessageSchemaV2 = z.object({
  type: z.literal("snapshot_ready"),
  protocolVersion: z.literal(WORKER_PROTOCOL_VERSION_V2),
  gameSaveId: z.string(),
  expectedRevision: z.number().int().nonnegative(),
  reason: z.enum(SNAPSHOT_REASONS_V2),
  state: simulationStateV2Schema,
  events: z.array(domainEventV2Schema),
});

export const workerErrorMessageSchemaV2 = z.object({
  type: z.literal("worker_error"),
  protocolVersion: z.literal(WORKER_PROTOCOL_VERSION_V2),
  code: z.enum(["incompatible_protocol_version", "invalid_payload", "internal_error"]),
  messageKey: z.string(),
});

export const fromWorkerMessageSchemaV2 = z.discriminatedUnion("type", [
  projectionsMessageSchemaV2,
  snapshotReadyMessageSchemaV2,
  workerErrorMessageSchemaV2,
]);

export type ToWorkerMessageV2 =
  | { readonly type: "load_state"; readonly protocolVersion: 2; readonly gameSaveId: string; readonly revision: number; readonly state: SimulationStateV2 }
  | { readonly type: "command"; readonly protocolVersion: 2; readonly command: SimulationCommand }
  | { readonly type: "request_snapshot"; readonly protocolVersion: 2 }
  | { readonly type: "tick"; readonly protocolVersion: 2; readonly nowMs: number }
  | { readonly type: "snapshot_persisted"; readonly protocolVersion: 2; readonly revision: number }
  | { readonly type: "snapshot_persist_failed"; readonly protocolVersion: 2; readonly code: "network_error" | "server_error" | "revision_conflict" };

export type FromWorkerMessageV2 =
  | { readonly type: "projections"; readonly protocolVersion: 2; readonly projections: WorkerProjectionsV2 }
  | {
      readonly type: "snapshot_ready";
      readonly protocolVersion: 2;
      readonly gameSaveId: string;
      readonly expectedRevision: number;
      readonly reason: SnapshotReasonV2;
      readonly state: SimulationStateV2;
      readonly events: readonly DomainEventV2[];
    }
  | {
      readonly type: "worker_error";
      readonly protocolVersion: 2;
      readonly code: "incompatible_protocol_version" | "invalid_payload" | "internal_error";
      readonly messageKey: string;
    };

export interface ParseResultV2<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: string;
}

export function parseToWorkerMessageV2(raw: unknown): ParseResultV2<ToWorkerMessageV2> {
  const result = toWorkerMessageSchemaV2.safeParse(raw);
  if (!result.success) return { success: false, error: result.error.message };
  return { success: true, data: result.data as unknown as ToWorkerMessageV2 };
}
