import { z } from "zod";
import { simulationCommandSchema, type SimulationCommand } from "./commands.js";
import { simulationStateV2Schema, type SimulationStateV2 } from "./state-v2.js";
import { domainEventV2Schema, type DomainEventV2 } from "./events-v2.js";
import type { StructuralProjectionsV2, TickProjectionsV2 } from "./projections-v2.js";
import { structuralProjectionsV2Schema, tickProjectionsV2Schema } from "./projections-v2-schema.js";

/**
 * Protocolo tipado y versionado del runtime V2 (S3 de WEB-002 §5.1). Es una
 * variante discriminada y versionada del protocolo de WEB-001, no una
 * mutación de él: `WORKER_PROTOCOL_VERSION_V2` (distinto de
 * `WORKER_PROTOCOL_VERSION = 1`) hace que un mensaje V1 enviado a una sesión
 * V2 — o viceversa — se rechace con `worker_error.invalid_payload` en vez de
 * confundirse en silencio (ninguno de los dos esquemas discriminados acepta
 * la forma del otro protocolo). Reutiliza sin cambios `SimulationCommand`
 * (los seis comandos ya sirven a V2, ver `apply-command-v2.ts`) y
 * `DomainEventV2` (superconjunto aditivo de los eventos V1). Ver DEC-0017.
 *
 * `WORKER_PROTOCOL_VERSION_V2 = 3` (S11 §5.2): la versión 2 enviaba un
 * único mensaje `projections` con la proyección completa en cada
 * tick/comando. La 3 sustituye ese mensaje por dos canales de cadencia
 * distinta — `structural_projections` (geometría del mundo, edificios,
 * fichas de persona: cambia raramente) y `tick_projections` (reloj,
 * movimiento, trabajos, registro: cambia en cada tick) — con secuencia
 * monotónica y resincronización explícita (`request_resync`). Es un
 * cambio de forma incompatible con la v2, así que la versión sube: un
 * cliente v2 conectado a un Worker v3 (o viceversa, tras una recarga a
 * medias) se rechaza en vez de interpretar mal el mensaje.
 */
export const WORKER_PROTOCOL_VERSION_V2 = 3 as const;

export const SNAPSHOT_REASONS_V2 = [
  "game_created",
  "session_pause_or_relevant_change",
  "order_settled",
  "priority_changed",
  "manual_save",
  "visibility_lost_best_effort",
  "discovery_progressed",
  /**
   * Cadencia de autosave (S11 §4.4): cambios continuos sin un límite
   * material propio (tiempo, deterioro, movimiento, trabajo parcial)
   * llevan demasiado tiempo solo en memoria y se guardan igualmente, sin
   * hacerlo en cada tick.
   */
  "autosave_debounced",
] as const;
export type SnapshotReasonV2 = (typeof SNAPSHOT_REASONS_V2)[number];

export const loadStateMessageSchemaV2 = z.object({
  type: z.literal("load_state"),
  protocolVersion: z.literal(WORKER_PROTOCOL_VERSION_V2),
  gameSaveId: z.string(),
  revision: z.number().int().nonnegative(),
  state: simulationStateV2Schema,
  /** Eventos de dominio persistidos recientes (S11 §6.4), para reconstruir el registro operativo al cargar en vez de arrancar vacío. */
  recentEvents: z.array(domainEventV2Schema).optional(),
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

/**
 * Pide reintentar el último lote de guardado que falló por red/servidor
 * (S11 §4.5). El Worker reenvía el mismo `snapshot_ready` — misma
 * `attemptId`, mismos eventos, mismo `expectedRevision` — nunca genera un
 * lote nuevo. No hace nada si no hay un intento fallido pendiente.
 */
export const retrySaveMessageSchemaV2 = z.object({
  type: z.literal("retry_save"),
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
  attemptId: z.string(),
});

export const snapshotPersistFailedMessageSchemaV2 = z.object({
  type: z.literal("snapshot_persist_failed"),
  protocolVersion: z.literal(WORKER_PROTOCOL_VERSION_V2),
  code: z.enum(["network_error", "server_error", "revision_conflict"]),
  attemptId: z.string(),
});

/**
 * Pide una resincronización completa (S11 §5.2): el cliente detectó un
 * hueco de secuencia, un delta sobre una base incorrecta, o quiere
 * recuperar el estado tras reanudar una pestaña suspendida. El Worker
 * responde con `structural_projections` fresco (secuencia nueva) seguido
 * de `tick_projections` sobre esa base — igual que al cargar.
 */
export const requestResyncMessageSchemaV2 = z.object({
  type: z.literal("request_resync"),
  protocolVersion: z.literal(WORKER_PROTOCOL_VERSION_V2),
});

export const toWorkerMessageSchemaV2 = z.discriminatedUnion("type", [
  loadStateMessageSchemaV2,
  commandMessageSchemaV2,
  requestSnapshotMessageSchemaV2,
  retrySaveMessageSchemaV2,
  requestResyncMessageSchemaV2,
  tickMessageSchemaV2,
  snapshotPersistedMessageSchemaV2,
  snapshotPersistFailedMessageSchemaV2,
]);

/**
 * Canal estructural (S11 §5.2): geometría del mundo, edificios y fichas de
 * persona. Solo se envía al cargar, al resincronizar, o cuando algo
 * estructural cambió de verdad — nunca en cada tick. `sequence` es
 * monotónica y compartida con `tick_projections`: un mensaje con
 * `sequence` menor o igual al último ya aplicado es un duplicado/mensaje
 * fuera de orden y se ignora.
 */
export const structuralProjectionsMessageSchemaV2 = z.object({
  type: z.literal("structural_projections"),
  protocolVersion: z.literal(WORKER_PROTOCOL_VERSION_V2),
  sequence: z.number().int().nonnegative(),
  structural: structuralProjectionsV2Schema,
});

/**
 * Canal de cadencia alta (S11 §5.2): todo lo que puede cambiar en cada
 * tick/comando. `structuralSequence` identifica sin ambigüedad la base
 * estructural sobre la que se aplica este delta — si no coincide con la
 * última `structural_projections` que el cliente tiene aplicada, el
 * cliente debe pedir `request_resync` en vez de aplicarlo sobre una base
 * incorrecta.
 */
export const tickProjectionsMessageSchemaV2 = z.object({
  type: z.literal("tick_projections"),
  protocolVersion: z.literal(WORKER_PROTOCOL_VERSION_V2),
  sequence: z.number().int().nonnegative(),
  structuralSequence: z.number().int().nonnegative(),
  tick: tickProjectionsV2Schema,
});

export const snapshotReadyMessageSchemaV2 = z.object({
  type: z.literal("snapshot_ready"),
  protocolVersion: z.literal(WORKER_PROTOCOL_VERSION_V2),
  gameSaveId: z.string(),
  expectedRevision: z.number().int().nonnegative(),
  reason: z.enum(SNAPSHOT_REASONS_V2),
  state: simulationStateV2Schema,
  events: z.array(domainEventV2Schema),
  /** Identidad estable de este intento de guardado (S11 §4.2). */
  attemptId: z.string(),
});

export const workerErrorMessageSchemaV2 = z.object({
  type: z.literal("worker_error"),
  protocolVersion: z.literal(WORKER_PROTOCOL_VERSION_V2),
  code: z.enum(["incompatible_protocol_version", "invalid_payload", "internal_error"]),
  messageKey: z.string(),
});

export const fromWorkerMessageSchemaV2 = z.discriminatedUnion("type", [
  structuralProjectionsMessageSchemaV2,
  tickProjectionsMessageSchemaV2,
  snapshotReadyMessageSchemaV2,
  workerErrorMessageSchemaV2,
]);

export type ToWorkerMessageV2 =
  | { readonly type: "load_state"; readonly protocolVersion: 3; readonly gameSaveId: string; readonly revision: number; readonly state: SimulationStateV2; readonly recentEvents?: readonly DomainEventV2[] }
  | { readonly type: "command"; readonly protocolVersion: 3; readonly command: SimulationCommand }
  | { readonly type: "request_snapshot"; readonly protocolVersion: 3 }
  | { readonly type: "retry_save"; readonly protocolVersion: 3 }
  | { readonly type: "request_resync"; readonly protocolVersion: 3 }
  | { readonly type: "tick"; readonly protocolVersion: 3; readonly nowMs: number }
  | { readonly type: "snapshot_persisted"; readonly protocolVersion: 3; readonly revision: number; readonly attemptId: string }
  | { readonly type: "snapshot_persist_failed"; readonly protocolVersion: 3; readonly code: "network_error" | "server_error" | "revision_conflict"; readonly attemptId: string };

export type FromWorkerMessageV2 =
  | { readonly type: "structural_projections"; readonly protocolVersion: 3; readonly sequence: number; readonly structural: StructuralProjectionsV2 }
  | { readonly type: "tick_projections"; readonly protocolVersion: 3; readonly sequence: number; readonly structuralSequence: number; readonly tick: TickProjectionsV2 }
  | {
      readonly type: "snapshot_ready";
      readonly protocolVersion: 3;
      readonly gameSaveId: string;
      readonly expectedRevision: number;
      readonly reason: SnapshotReasonV2;
      readonly state: SimulationStateV2;
      readonly events: readonly DomainEventV2[];
      readonly attemptId: string;
    }
  | {
      readonly type: "worker_error";
      readonly protocolVersion: 3;
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

/**
 * Valida en runtime un mensaje que llega del Worker a React (S11 §5.1): un
 * payload que no cumple el esquema (versión de proyección incompatible,
 * `postMessage` corrupto, bug de serialización) nunca se trata como
 * proyección válida — React debe detenerse o pedir resincronización, no
 * representar un estado a medias.
 */
export function parseFromWorkerMessageV2(raw: unknown): ParseResultV2<FromWorkerMessageV2> {
  const result = fromWorkerMessageSchemaV2.safeParse(raw);
  if (!result.success) return { success: false, error: result.error.message };
  return { success: true, data: result.data as unknown as FromWorkerMessageV2 };
}
