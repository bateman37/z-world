"use server";

import { createInitialState } from "@z-world/simulation-core";
import type { DomainEvent, SimulationStateV1 } from "@z-world/contracts";
import {
  createGame,
  listGames,
  loadGame,
  RevisionConflictError,
  saveSnapshot,
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
