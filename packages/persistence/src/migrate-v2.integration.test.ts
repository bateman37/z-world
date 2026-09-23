import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createInitialState, migrateV1ToV2 } from "@z-world/simulation-core";
import { parseSimulationStateV2 } from "@z-world/contracts";
import { createPrismaClient, type PrismaClient } from "./client.js";
import { createGame, loadGame, saveMigratedV2Snapshot } from "./repository.js";

const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/zworld_test";

let prisma: PrismaClient;

beforeAll(() => {
  prisma = createPrismaClient(TEST_DATABASE_URL);
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  await prisma.domainEventRecord.deleteMany();
  await prisma.simulationSnapshot.deleteMany();
  await prisma.gameSave.deleteMany();
});

describe("migración V1→V2 sobre persistencia PostgreSQL real (S1, esqueleto)", () => {
  it("persiste el snapshot V2 migrado sin destruir ni alterar el snapshot V1 vigente", async () => {
    const v1 = createInitialState("persist-migration-seed-1");
    const { gameSaveId } = await createGame(prisma, { state: v1, initialEvents: [] });

    const { state: v2 } = migrateV1ToV2(v1);
    const migrated = await saveMigratedV2Snapshot(prisma, {
      gameSaveId,
      state: v2,
      reason: "migrated_v1_to_v2_skeleton",
    });
    expect(migrated.created).toBe(true);

    const stillV1 = await loadGame(prisma, gameSaveId);
    expect(stillV1.state.seed).toBe(v1.seed);
    expect(stillV1.state.schemaVersion).toBe(v1.schemaVersion);
    expect(stillV1.revision).toBe(0);

    const snapshots = await prisma.simulationSnapshot.findMany({ where: { gameSaveId } });
    expect(snapshots).toHaveLength(2);
    const v2Row = snapshots.find((s) => s.id === migrated.snapshotId);
    expect(v2Row?.schemaVersion).toBe(v2.schemaVersion);
    expect(parseSimulationStateV2(v2Row?.state).success).toBe(true);
  });

  it("es idempotente: llamar dos veces no duplica el snapshot migrado", async () => {
    const v1 = createInitialState("persist-migration-seed-2");
    const { gameSaveId } = await createGame(prisma, { state: v1, initialEvents: [] });
    const { state: v2 } = migrateV1ToV2(v1);

    const first = await saveMigratedV2Snapshot(prisma, {
      gameSaveId,
      state: v2,
      reason: "migrated_v1_to_v2_skeleton",
    });
    const second = await saveMigratedV2Snapshot(prisma, {
      gameSaveId,
      state: v2,
      reason: "migrated_v1_to_v2_skeleton",
    });

    expect(first.created).toBe(true);
    expect(second.created).toBe(false);
    expect(second.snapshotId).toBe(first.snapshotId);

    const snapshots = await prisma.simulationSnapshot.findMany({ where: { gameSaveId } });
    expect(snapshots).toHaveLength(2);
  });

  it("hace rollback si la partida no existe, sin dejar filas huérfanas", async () => {
    const v1 = createInitialState("persist-migration-seed-3");
    const { state: v2 } = migrateV1ToV2(v1);

    await expect(
      saveMigratedV2Snapshot(prisma, {
        gameSaveId: "id-inexistente-00000000-0000-0000-0000-000000000000",
        state: v2,
        reason: "migrated_v1_to_v2_skeleton",
      }),
    ).rejects.toThrow();

    const snapshots = await prisma.simulationSnapshot.findMany();
    expect(snapshots).toHaveLength(0);
  });
});
