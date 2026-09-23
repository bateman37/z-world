import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { advanceSimulationV2, applyCommandV2, buildFullNavigationIndexV2, createInitialStateV2 } from "@z-world/simulation-core";
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
 * Persistencia del runtime V2 sobre PostgreSQL real (S3 de WEB-002 §9): los
 * cambios que produce el propio reductor/avance puro (movimiento, reloj,
 * niebla, descubrimiento) sobreviven exactos a guardar y recargar, con el
 * mismo control optimista de revisión que V1/S2. Usa `applyCommandV2`/
 * `advanceSimulationV2` reales, no un estado editado a mano.
 */
describe("persistencia del runtime V2 (S3, PostgreSQL real)", () => {
  it("guarda y recarga exactamente el estado tras una orden de movimiento y avance real", async () => {
    const initial = createInitialStateV2("persist-runtime-v2-seed-1");
    const nav = buildFullNavigationIndexV2(initial.world);
    const created = await createGameV2(prisma, { state: initial, initialEvents: [] });

    const personId = initial.peopleOrder[0]!;
    const { state: paused } = applyCommandV2(initial, { commandId: "cmd-a", type: "set_pause", paused: false }, nav);
    const { state: moving, events: moveEvents } = applyCommandV2(
      paused,
      { commandId: "cmd-b", type: "order_direct_move", personId, destination: initial.world.arrivalPoint },
      nav,
    );
    const { state: advanced, events: advanceEvents } = advanceSimulationV2(moving, 0.2, nav);

    const saved = await saveSnapshotV2(prisma, {
      gameSaveId: created.gameSaveId,
      expectedRevision: created.revision,
      state: advanced,
      events: [...moveEvents, ...advanceEvents],
      reason: "order_settled",
    });
    expect(saved.revision).toBe(1);

    const reloaded = await loadGameV2(prisma, created.gameSaveId);
    expect(reloaded.state).toEqual(advanced);
    expect(reloaded.revision).toBe(1);
    expect(reloaded.state.seed).toBe(initial.seed);
    expect(reloaded.state.world.generatorVersion).toBe(initial.world.generatorVersion);
  });

  it("mantiene el control optimista de revisión: rechaza un guardado con revisión obsoleta", async () => {
    const initial = createInitialStateV2("persist-runtime-v2-seed-2");
    const nav = buildFullNavigationIndexV2(initial.world);
    const created = await createGameV2(prisma, { state: initial, initialEvents: [] });

    const { state: firstSave } = applyCommandV2(initial, { commandId: "cmd-c", type: "set_pause", paused: false }, nav);
    await saveSnapshotV2(prisma, { gameSaveId: created.gameSaveId, expectedRevision: 0, state: firstSave, events: [], reason: "manual_save" });

    const { state: secondSave } = applyCommandV2(firstSave, { commandId: "cmd-d", type: "set_speed", speed: 4 }, nav);
    await expect(
      saveSnapshotV2(prisma, { gameSaveId: created.gameSaveId, expectedRevision: 0, state: secondSave, events: [], reason: "manual_save" }),
    ).rejects.toBeInstanceOf(RevisionConflictError);
  });

  it("no altera semilla ni versión del generador a través de varios guardados sucesivos", async () => {
    const initial = createInitialStateV2("persist-runtime-v2-seed-3");
    const nav = buildFullNavigationIndexV2(initial.world);
    const created = await createGameV2(prisma, { state: initial, initialEvents: [] });

    let current = initial;
    let revision = created.revision;
    for (let i = 0; i < 3; i++) {
      const { state: next } = applyCommandV2(current, { commandId: `cmd-loop-${i}`, type: "set_speed", speed: (i % 2 === 0 ? 2 : 1) as 1 | 2 }, nav);
      const saved = await saveSnapshotV2(prisma, { gameSaveId: created.gameSaveId, expectedRevision: revision, state: next, events: [], reason: "manual_save" });
      current = next;
      revision = saved.revision;
    }

    const reloaded = await loadGameV2(prisma, created.gameSaveId);
    expect(reloaded.state.seed).toBe(initial.seed);
    expect(reloaded.state.world.generatorVersion).toBe(initial.world.generatorVersion);
    expect(reloaded.revision).toBe(3);
  });
});
