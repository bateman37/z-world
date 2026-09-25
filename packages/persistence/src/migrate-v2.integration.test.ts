import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createInitialState, migrateV1ToV2 } from "@z-world/simulation-core";
import { parseSimulationStateV2 } from "@z-world/contracts";
import { createPrismaClient, type PrismaClient } from "./client.js";
import { createGame, loadGame, loadGameV2, promoteV1ToV2, MIGRATION_SNAPSHOT_REASON } from "./repository.js";

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

/**
 * Migración V1→V2 operativa (S11 §4.6): a diferencia del esqueleto de S1
 * (que solo guardaba un snapshot V2 adicional sin promocionarlo), esta es
 * la ruta real de producto — tras `promoteV1ToV2`, la partida se carga
 * directamente como V2 desde `/village/[id]`, y el snapshot V1 anterior
 * sigue intacto en base como respaldo histórico consultable.
 */
describe("migración V1→V2 operativa sobre PostgreSQL real (S11)", () => {
  it("promociona la partida a V2 de forma atómica: queda vigente, jugable, y el snapshot V1 previo permanece intacto en base", async () => {
    const v1 = createInitialState("persist-migration-seed-1");
    const { gameSaveId } = await createGame(prisma, { state: v1, initialEvents: [] });

    const { state: v2, degradations } = migrateV1ToV2(v1);
    expect(degradations.length).toBeGreaterThan(0);
    expect(parseSimulationStateV2(v2).success).toBe(true);

    const promoted = await promoteV1ToV2(prisma, { gameSaveId, state: v2 });
    expect(promoted.alreadyMigrated).toBe(false);
    expect(promoted.revision).toBe(1);

    const row = await prisma.gameSave.findUniqueOrThrow({ where: { id: gameSaveId } });
    expect(row.schemaVersion).toBe(2);
    expect(row.revision).toBe(1);

    // Vigente y jugable como V2 real, sin regenerar la cohorte.
    const reloadedV2 = await loadGameV2(prisma, gameSaveId);
    expect(reloadedV2.state.seed).toBe(v1.seed);
    expect(reloadedV2.state.peopleOrder).toEqual(v1.peopleOrder);
    expect(reloadedV2.state.clock).toEqual(v1.clock);

    // El snapshot V1 (revisión 0) sigue en base, intacto, como respaldo histórico
    // consultable — nunca expuesto en la UI, pero verificable por integración.
    const snapshots = await prisma.simulationSnapshot.findMany({ where: { gameSaveId }, orderBy: { revision: "asc" } });
    expect(snapshots).toHaveLength(2);
    expect(snapshots[0]!.revision).toBe(0);
    expect(snapshots[0]!.schemaVersion).toBe(v1.schemaVersion);
    expect(snapshots[1]!.reason).toBe(MIGRATION_SNAPSHOT_REASON);
  });

  it("es idempotente: repetir la promoción no crea otra migración ni duplica objetos/eventos", async () => {
    const v1 = createInitialState("persist-migration-seed-2");
    const { gameSaveId } = await createGame(prisma, { state: v1, initialEvents: [] });
    const { state: v2 } = migrateV1ToV2(v1);

    const first = await promoteV1ToV2(prisma, { gameSaveId, state: v2 });
    const second = await promoteV1ToV2(prisma, { gameSaveId, state: v2 });

    expect(first.alreadyMigrated).toBe(false);
    expect(second.alreadyMigrated).toBe(true);
    expect(second.revision).toBe(first.revision);

    const snapshots = await prisma.simulationSnapshot.findMany({ where: { gameSaveId } });
    expect(snapshots).toHaveLength(2); // V1 original + V2 promovido, nunca un tercero.
  });

  it("si la partida no existe, hace rollback sin dejar filas huérfanas (la partida original sigue abriendo como V1 en el caso real)", async () => {
    const v1 = createInitialState("persist-migration-seed-3");
    const { state: v2 } = migrateV1ToV2(v1);

    await expect(
      promoteV1ToV2(prisma, { gameSaveId: "id-inexistente-00000000-0000-0000-0000-000000000000", state: v2 }),
    ).rejects.toThrow();

    const snapshots = await prisma.simulationSnapshot.findMany();
    expect(snapshots).toHaveLength(0);
  });

  it("una partida V1 sigue cargando como V1 mientras no se promociona", async () => {
    const v1 = createInitialState("persist-migration-seed-4");
    const { gameSaveId } = await createGame(prisma, { state: v1, initialEvents: [] });

    const stillV1 = await loadGame(prisma, gameSaveId);
    expect(stillV1.state.schemaVersion).toBe(v1.schemaVersion);
    expect(stillV1.revision).toBe(0);
  });
});
