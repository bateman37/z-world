import type { DomainEvent, SimulationStateV1 } from "@z-world/contracts";
import { parseSimulationStateV1 } from "@z-world/contracts";
import type { PrismaClient } from "../generated/index.js";

export class RevisionConflictError extends Error {
  constructor(
    public readonly gameSaveId: string,
    public readonly expectedRevision: number,
    public readonly actualRevision: number,
  ) {
    super(
      `Conflicto de revisión en la partida ${gameSaveId}: esperada ${expectedRevision}, actual ${actualRevision}.`,
    );
    this.name = "RevisionConflictError";
  }
}

export class CorruptOrIncompatibleSnapshotError extends Error {
  constructor(gameSaveId: string, reason: string) {
    super(`Snapshot corrupto o incompatible para la partida ${gameSaveId}: ${reason}`);
    this.name = "CorruptOrIncompatibleSnapshotError";
  }
}

export interface GameSaveSummary {
  readonly id: string;
  readonly name: string | null;
  readonly seed: string;
  readonly revision: number;
  readonly simSeconds: number;
  readonly updatedAt: Date;
  readonly lastUsedAt: Date;
}

function eventSequenceFromId(eventId: string): number {
  const parts = eventId.split("-");
  const raw = parts[parts.length - 1];
  const value = raw === undefined ? Number.NaN : Number.parseInt(raw, 10);
  if (Number.isNaN(value)) {
    throw new Error(`ID de evento con formato inesperado, no se pudo derivar secuencia: ${eventId}`);
  }
  return value;
}

/**
 * Crea una partida nueva: registro `GameSave`, primer snapshot (revisión 0)
 * y eventos iniciales, todo en una única transacción (§9.2).
 */
export async function createGame(
  prisma: PrismaClient,
  params: { readonly name?: string; readonly state: SimulationStateV1; readonly initialEvents: readonly DomainEvent[] },
): Promise<{ readonly gameSaveId: string; readonly revision: number }> {
  return prisma.$transaction(async (tx) => {
    const gameSave = await tx.gameSave.create({
      data: {
        name: params.name ?? null,
        seed: params.state.seed,
        generatorVersion: params.state.generatorVersion,
        schemaVersion: params.state.schemaVersion,
        revision: 0,
      },
    });

    const snapshot = await tx.simulationSnapshot.create({
      data: {
        gameSaveId: gameSave.id,
        revision: 0,
        schemaVersion: params.state.schemaVersion,
        reason: "game_created",
        state: params.state as unknown as object,
        simSeconds: params.state.clock.elapsedSimSeconds,
      },
    });

    await tx.gameSave.update({
      where: { id: gameSave.id },
      data: { currentSnapshotId: snapshot.id },
    });

    if (params.initialEvents.length > 0) {
      await tx.domainEventRecord.createMany({
        data: params.initialEvents.map((event) => ({
          gameSaveId: gameSave.id,
          sequence: eventSequenceFromId(event.eventId),
          type: event.type,
          simSeconds: event.simSeconds,
          causedByCommandId: event.causedByCommandId,
          payload: event as unknown as object,
        })),
      });
    }

    return { gameSaveId: gameSave.id, revision: 0 };
  });
}

/** Carga el último snapshot válido de una partida, validando esquema y contenido. */
export async function loadGame(
  prisma: PrismaClient,
  gameSaveId: string,
): Promise<{ readonly state: SimulationStateV1; readonly revision: number }> {
  const gameSave = await prisma.gameSave.findUnique({
    where: { id: gameSaveId },
    include: { currentSnapshot: true },
  });

  if (!gameSave || !gameSave.currentSnapshot) {
    throw new CorruptOrIncompatibleSnapshotError(gameSaveId, "no existe snapshot vigente para esta partida.");
  }

  const parsed = parseSimulationStateV1(gameSave.currentSnapshot.state);
  if (!parsed.success || !parsed.data) {
    throw new CorruptOrIncompatibleSnapshotError(gameSaveId, parsed.error ?? "forma desconocida.");
  }

  await prisma.gameSave.update({ where: { id: gameSaveId }, data: { lastUsedAt: new Date() } });

  return { state: parsed.data, revision: gameSave.revision };
}

/**
 * Guarda snapshot + eventos pendientes con control optimista de revisión
 * (§9.2/§9.3). Rechaza si `expectedRevision` no coincide con la revisión
 * actual en base de datos: un cliente obsoleto nunca sobrescribe en
 * silencio el estado de otra sesión.
 */
export async function saveSnapshot(
  prisma: PrismaClient,
  params: {
    readonly gameSaveId: string;
    readonly expectedRevision: number;
    readonly state: SimulationStateV1;
    readonly events: readonly DomainEvent[];
    readonly reason: string;
  },
): Promise<{ readonly revision: number }> {
  return prisma.$transaction(async (tx) => {
    const current = await tx.gameSave.findUnique({ where: { id: params.gameSaveId } });
    if (!current) {
      throw new CorruptOrIncompatibleSnapshotError(params.gameSaveId, "la partida no existe.");
    }
    if (current.revision !== params.expectedRevision) {
      throw new RevisionConflictError(params.gameSaveId, params.expectedRevision, current.revision);
    }

    const nextRevision = current.revision + 1;

    const snapshot = await tx.simulationSnapshot.create({
      data: {
        gameSaveId: params.gameSaveId,
        revision: nextRevision,
        schemaVersion: params.state.schemaVersion,
        reason: params.reason,
        state: params.state as unknown as object,
        simSeconds: params.state.clock.elapsedSimSeconds,
      },
    });

    if (params.events.length > 0) {
      await tx.domainEventRecord.createMany({
        data: params.events.map((event) => ({
          gameSaveId: params.gameSaveId,
          sequence: eventSequenceFromId(event.eventId),
          type: event.type,
          simSeconds: event.simSeconds,
          causedByCommandId: event.causedByCommandId,
          payload: event as unknown as object,
        })),
      });
    }

    await tx.gameSave.update({
      where: { id: params.gameSaveId },
      data: { revision: nextRevision, currentSnapshotId: snapshot.id, lastUsedAt: new Date() },
    });

    return { revision: nextRevision };
  });
}

export async function listGames(prisma: PrismaClient): Promise<readonly GameSaveSummary[]> {
  const rows = await prisma.gameSave.findMany({
    orderBy: { lastUsedAt: "desc" },
    include: { currentSnapshot: { select: { simSeconds: true } } },
  });
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    seed: row.seed,
    revision: row.revision,
    simSeconds: row.currentSnapshot?.simSeconds ?? 0,
    updatedAt: row.updatedAt,
    lastUsedAt: row.lastUsedAt,
  }));
}

export async function listDomainEventSequence(prisma: PrismaClient, gameSaveId: string): Promise<readonly number[]> {
  const rows = await prisma.domainEventRecord.findMany({
    where: { gameSaveId },
    orderBy: { sequence: "asc" },
    select: { sequence: true },
  });
  return rows.map((r) => r.sequence);
}
