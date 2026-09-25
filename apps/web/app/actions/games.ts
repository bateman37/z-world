"use server";

import { createInitialState, createInitialStateV2, migrateV1ToV2 } from "@z-world/simulation-core";
import { parseSimulationStateV2 } from "@z-world/contracts";
import type { DomainEvent, DomainEventV2, SimulationStateV1, SimulationStateV2 } from "@z-world/contracts";
import {
  createGame,
  createGameV2,
  listGames,
  loadGame,
  loadGameV2,
  listRecentDomainEventsV2,
  promoteV1ToV2,
  RevisionConflictError,
  saveSnapshot,
  saveSnapshotV2,
  type GameSaveSummary,
} from "@z-world/persistence";
import { prisma } from "@/lib/prisma";

export interface CreateGameResult {
  readonly gameSaveId: string;
  readonly revision: number;
  readonly state: SimulationStateV1;
}

/**
 * Crea una partida nueva a partir de una semilla. Falla explícitamente si
 * PostgreSQL no está disponible: no hay una partida "volátil" de reserva
 * (§6.4 de WEB-001).
 */
export async function createGameAction(seed: string, name?: string): Promise<CreateGameResult> {
  const normalizedSeed = seed.trim().length > 0 ? seed.trim() : crypto.randomUUID();
  const state = createInitialState(normalizedSeed);
  const initialEvents: DomainEvent[] = [
    {
      type: "game_created",
      eventId: `evt-${state.sequences.nextDomainEventSequence}`,
      simSeconds: state.clock.elapsedSimSeconds,
      causedByCommandId: null,
      seed: normalizedSeed,
    },
  ];
  const { gameSaveId, revision } = await createGame(prisma, { name, state, initialEvents });
  return { gameSaveId, revision, state };
}

export interface CreateGameV2Result {
  readonly gameSaveId: string;
  readonly revision: number;
  readonly state: SimulationStateV2;
}

/**
 * Crea una partida nueva con el generador semántico determinista de S2
 * (WEB-002 §7/§9.1 del encargo): produce directamente un `SimulationStateV2`
 * válido y lo persiste de una sola vez, nunca a través de la ruta V1/
 * migración. Es el flujo real de creación de partida para el pueblo
 * semántico, no una utilidad aislada de pruebas.
 */
export async function createGameV2Action(seed: string, name?: string): Promise<CreateGameV2Result> {
  const normalizedSeed = seed.trim().length > 0 ? seed.trim() : crypto.randomUUID();
  const state = createInitialStateV2(normalizedSeed);
  const initialEvents: DomainEventV2[] = [
    {
      type: "game_created",
      eventId: `evt-${state.sequences.nextDomainEventSequence}`,
      simSeconds: state.clock.elapsedSimSeconds,
      causedByCommandId: null,
      seed: normalizedSeed,
    },
  ];
  const { gameSaveId, revision } = await createGameV2(prisma, { name, state, initialEvents });
  return { gameSaveId, revision, state };
}

export async function loadGameV2Action(gameSaveId: string): Promise<{ state: SimulationStateV2; revision: number; recentEvents: readonly DomainEventV2[] }> {
  const [{ state, revision }, recentEvents] = await Promise.all([loadGameV2(prisma, gameSaveId), listRecentDomainEventsV2(prisma, gameSaveId)]);
  return { state, revision, recentEvents };
}

export async function listGamesAction(): Promise<readonly GameSaveSummary[]> {
  return listGames(prisma);
}

export async function loadGameAction(gameSaveId: string): Promise<{ state: SimulationStateV1; revision: number }> {
  return loadGame(prisma, gameSaveId);
}

export interface SaveSnapshotActionResult {
  readonly ok: true;
  readonly revision: number;
}
export interface SaveSnapshotActionConflict {
  readonly ok: false;
  readonly code: "revision_conflict";
  readonly actualRevision: number;
}

export async function saveSnapshotAction(params: {
  readonly gameSaveId: string;
  readonly expectedRevision: number;
  readonly state: SimulationStateV1;
  readonly events: readonly DomainEvent[];
  readonly reason: string;
}): Promise<SaveSnapshotActionResult | SaveSnapshotActionConflict> {
  try {
    const { revision } = await saveSnapshot(prisma, params);
    return { ok: true, revision };
  } catch (error) {
    if (error instanceof RevisionConflictError) {
      return { ok: false, code: "revision_conflict", actualRevision: error.actualRevision };
    }
    throw error;
  }
}

export interface MigrationPreview {
  readonly degradations: readonly string[];
}

/**
 * Vista previa de la migración V1→V2, sin persistir nada (S11 §4.6.2): la
 * home la usa para explicar qué se conserva y qué degradaciones conocidas
 * existen antes de que la persona confirme. `migrateV1ToV2` es pura, así
 * que ejecutarla aquí no tiene efecto sobre la partida ni sobre el
 * generador de IDs/PRNG persistido.
 */
export async function previewMigrationV1ToV2Action(gameSaveId: string): Promise<MigrationPreview> {
  const { state: v1 } = await loadGame(prisma, gameSaveId);
  const { degradations } = migrateV1ToV2(v1);
  return { degradations };
}

export interface MigrationResultAction {
  readonly gameSaveId: string;
  readonly revision: number;
  readonly alreadyMigrated: boolean;
  readonly degradations: readonly string[];
}

/**
 * Ejecuta y promociona la migración V1→V2 (S11 §4.6): valida el snapshot V2
 * resultante (Zod + invariantes) antes de escribir nada, para que un fallo
 * de validación deje la partida abriendo tal cual como V1, nunca a medias.
 * Idempotente: repetir sobre una partida ya migrada no crea una segunda
 * migración (`promoteV1ToV2` lo resuelve por `schemaVersion`).
 */
export async function migrateGameToV2Action(gameSaveId: string): Promise<MigrationResultAction> {
  const { state: v1 } = await loadGame(prisma, gameSaveId);
  const { state: v2, degradations } = migrateV1ToV2(v1);

  const validated = parseSimulationStateV2(v2);
  if (!validated.success || !validated.data) {
    throw new Error(`La migración produjo un estado V2 inválido, no se promociona: ${validated.error ?? "forma desconocida."}`);
  }

  const { revision, alreadyMigrated } = await promoteV1ToV2(prisma, { gameSaveId, state: validated.data });
  return { gameSaveId, revision, alreadyMigrated, degradations };
}

/**
 * Persiste un snapshot del runtime V2 (S3 de WEB-002). Misma forma y mismo
 * control optimista de revisión que la ruta V1: rechaza explícitamente una
 * revisión obsoleta en vez de fusionar o sobrescribir en silencio.
 */
export async function saveSnapshotV2Action(params: {
  readonly gameSaveId: string;
  readonly expectedRevision: number;
  readonly state: SimulationStateV2;
  readonly events: readonly DomainEventV2[];
  readonly reason: string;
  readonly attemptId: string;
}): Promise<SaveSnapshotActionResult | SaveSnapshotActionConflict> {
  try {
    const { revision } = await saveSnapshotV2(prisma, params);
    return { ok: true, revision };
  } catch (error) {
    if (error instanceof RevisionConflictError) {
      return { ok: false, code: "revision_conflict", actualRevision: error.actualRevision };
    }
    throw error;
  }
}
