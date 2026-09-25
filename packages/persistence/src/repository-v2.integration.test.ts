import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createInitialStateV2 } from "@z-world/simulation-core";
import { createPrismaClient, type PrismaClient } from "./client.js";
import { createGameV2, loadGameV2, RevisionConflictError, saveSnapshotV2 } from "./repository.js";

const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/zworld_test";

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
 * Persistencia de partidas V2 sobre PostgreSQL real (S2 de WEB-002 §9): una
 * partida nueva conserva semilla, versión de generador, configuración
 * (implícita en `world.generatorVersion`/`seed`) y el resultado generado; la
 * recarga recupera exactamente el mismo mundo, sin regenerarlo.
 */
describe("persistencia de SimulationStateV2 (S2, PostgreSQL real)", () => {
  it("crea una partida V2 de forma atómica y la recupera exactamente igual, sin regenerarla", async () => {
    const state = createInitialStateV2("persist-v2-seed-1");
    const created = await createGameV2(prisma, { state, initialEvents: [] });
    expect(created.revision).toBe(0);

    const loaded = await loadGameV2(prisma, created.gameSaveId);
    expect(loaded.state).toEqual(state);
    expect(loaded.revision).toBe(0);
  });

  it("guarda el `generatorVersion` en el registro de la partida", async () => {
    const state = createInitialStateV2("persist-v2-seed-2");
    const created = await createGameV2(prisma, { state, initialEvents: [] });
    const row = await prisma.gameSave.findUnique({ where: { id: created.gameSaveId } });
    expect(row?.generatorVersion).toBe(state.world.generatorVersion);
    expect(row?.seed).toBe(state.seed);
    expect(row?.schemaVersion).toBe(2);
  });

  it("guarda snapshot + revisión con control optimista, igual que la ruta V1", async () => {
    const state = createInitialStateV2("persist-v2-seed-3");
    const { gameSaveId } = await createGameV2(prisma, { state, initialEvents: [] });

    const next = { ...state, clock: { ...state.clock, elapsedSimSeconds: state.clock.elapsedSimSeconds + 60 } };
    const saved = await saveSnapshotV2(prisma, { gameSaveId, expectedRevision: 0, state: next, events: [], reason: "manual_save", attemptId: crypto.randomUUID() });
    expect(saved.revision).toBe(1);

    const reloaded = await loadGameV2(prisma, gameSaveId);
    expect(reloaded.state.clock.elapsedSimSeconds).toBe(state.clock.elapsedSimSeconds + 60);
  });

  it("rechaza explícitamente una revisión obsoleta, sin fusión silenciosa", async () => {
    const state = createInitialStateV2("persist-v2-seed-4");
    const { gameSaveId } = await createGameV2(prisma, { state, initialEvents: [] });
    await saveSnapshotV2(prisma, { gameSaveId, expectedRevision: 0, state, events: [], reason: "manual_save", attemptId: crypto.randomUUID() });

    await expect(
      saveSnapshotV2(prisma, { gameSaveId, expectedRevision: 0, state, events: [], reason: "manual_save", attemptId: crypto.randomUUID() }),
    ).rejects.toThrow(RevisionConflictError);
  });

  it("dos partidas generadas con la misma semilla son idénticas también tras persistirse y recargarse", async () => {
    const stateA = createInitialStateV2("persist-v2-seed-same");
    const stateB = createInitialStateV2("persist-v2-seed-same");
    const createdA = await createGameV2(prisma, { name: "a", state: stateA, initialEvents: [] });
    const createdB = await createGameV2(prisma, { name: "b", state: stateB, initialEvents: [] });

    const loadedA = await loadGameV2(prisma, createdA.gameSaveId);
    const loadedB = await loadGameV2(prisma, createdB.gameSaveId);
    expect(loadedA.state.world).toEqual(loadedB.state.world);
    expect(loadedA.state.people).toEqual(loadedB.state.people);
  });
});
