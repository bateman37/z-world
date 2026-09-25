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
      attemptId: crypto.randomUUID(),
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
    await saveSnapshotV2(prisma, { gameSaveId: created.gameSaveId, expectedRevision: 0, state: firstSave, events: [], reason: "manual_save", attemptId: crypto.randomUUID() });

    const { state: secondSave } = applyCommandV2(firstSave, { commandId: "cmd-d", type: "set_speed", speed: 4 }, nav);
    await expect(
      saveSnapshotV2(prisma, { gameSaveId: created.gameSaveId, expectedRevision: 0, state: secondSave, events: [], reason: "manual_save", attemptId: crypto.randomUUID() }),
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
      const saved = await saveSnapshotV2(prisma, { gameSaveId: created.gameSaveId, expectedRevision: revision, state: next, events: [], reason: "manual_save", attemptId: crypto.randomUUID() });
      current = next;
      revision = saved.revision;
    }

    const reloaded = await loadGameV2(prisma, created.gameSaveId);
    expect(reloaded.state.seed).toBe(initial.seed);
    expect(reloaded.state.world.generatorVersion).toBe(initial.world.generatorVersion);
    expect(reloaded.revision).toBe(3);
  });

  /**
   * S11 §4.2/§10.3: identidad e idempotencia del intento de guardado, sobre
   * PostgreSQL real. Cubre el reintento del mismo lote ya confirmado (la
   * respuesta se perdió tras el commit) frente a una escritura distinta con
   * `expectedRevision` obsoleta, que debe seguir rechazándose.
   */
  it("reintentar el mismo lote (misma attemptId) tras un commit ya aplicado responde idempotentemente, sin duplicar snapshot ni eventos", async () => {
    const initial = createInitialStateV2("persist-runtime-v2-seed-idem-1");
    const nav = buildFullNavigationIndexV2(initial.world);
    const created = await createGameV2(prisma, { state: initial, initialEvents: [] });

    const { state: next, events } = applyCommandV2(initial, { commandId: "cmd-idem", type: "set_pause", paused: false }, nav);
    const attemptId = crypto.randomUUID();
    const params = { gameSaveId: created.gameSaveId, expectedRevision: 0, state: next, events, reason: "manual_save", attemptId } as const;

    const first = await saveSnapshotV2(prisma, params);
    expect(first.revision).toBe(1);

    // Reintento exacto del mismo lote: el cliente cree que la escritura
    // falló (perdió la respuesta) y reintenta con la misma attemptId.
    const retried = await saveSnapshotV2(prisma, params);
    expect(retried.revision).toBe(first.revision);

    const snapshotCount = await prisma.simulationSnapshot.count({ where: { gameSaveId: created.gameSaveId } });
    expect(snapshotCount).toBe(2); // revision 0 (creación) + revision 1 (este intento), nunca un tercero.
    const eventCount = await prisma.domainEventRecord.count({ where: { gameSaveId: created.gameSaveId } });
    expect(eventCount).toBe(events.length);

    const reloaded = await loadGameV2(prisma, created.gameSaveId);
    expect(reloaded.revision).toBe(1);
    expect(reloaded.state).toEqual(next);
  });

  it("una escritura distinta (otra attemptId) sobre una revisión ya obsoleta sigue rechazándose, aunque la anterior fuera idempotente", async () => {
    const initial = createInitialStateV2("persist-runtime-v2-seed-idem-2");
    const nav = buildFullNavigationIndexV2(initial.world);
    const created = await createGameV2(prisma, { state: initial, initialEvents: [] });

    const { state: next } = applyCommandV2(initial, { commandId: "cmd-a", type: "set_pause", paused: false }, nav);
    await saveSnapshotV2(prisma, { gameSaveId: created.gameSaveId, expectedRevision: 0, state: next, events: [], reason: "manual_save", attemptId: crypto.randomUUID() });

    // Cliente obsoleto de otra pestaña: expectedRevision 0 ya no es la vigente (1), y su attemptId es nueva.
    const { state: staleNext } = applyCommandV2(initial, { commandId: "cmd-b", type: "set_speed", speed: 4 }, nav);
    await expect(
      saveSnapshotV2(prisma, { gameSaveId: created.gameSaveId, expectedRevision: 0, state: staleNext, events: [], reason: "manual_save", attemptId: crypto.randomUUID() }),
    ).rejects.toBeInstanceOf(RevisionConflictError);
  });

  it("snapshot + eventos + revisión se confirman atómicamente: tras el guardado existen exactamente los eventos del lote, en secuencia, y la partida apunta al snapshot nuevo", async () => {
    const initial = createInitialStateV2("persist-runtime-v2-seed-atomic");
    const nav = buildFullNavigationIndexV2(initial.world);
    const created = await createGameV2(prisma, { state: initial, initialEvents: [] });

    const personId = initial.peopleOrder[0]!;
    const { state: paused } = applyCommandV2(initial, { commandId: "cmd-a", type: "set_pause", paused: false }, nav);
    const { state: moving, events: moveEvents } = applyCommandV2(
      paused,
      { commandId: "cmd-b", type: "order_direct_move", personId, destination: initial.world.arrivalPoint },
      nav,
    );
    const { state: advanced, events: advanceEvents } = advanceSimulationV2(moving, 5, nav);
    const allEvents = [...moveEvents, ...advanceEvents];

    const saved = await saveSnapshotV2(prisma, {
      gameSaveId: created.gameSaveId,
      expectedRevision: 0,
      state: advanced,
      events: allEvents,
      reason: "order_settled",
      attemptId: crypto.randomUUID(),
    });

    const row = await prisma.gameSave.findUniqueOrThrow({ where: { id: created.gameSaveId } });
    expect(row.revision).toBe(saved.revision);
    const currentSnapshot = await prisma.simulationSnapshot.findUniqueOrThrow({ where: { id: row.currentSnapshotId! } });
    expect(currentSnapshot.revision).toBe(saved.revision);

    const persisted = await prisma.domainEventRecord.findMany({ where: { gameSaveId: created.gameSaveId }, orderBy: { sequence: "asc" } });
    expect(persisted).toHaveLength(allEvents.length);
    const sequences = persisted.map((e) => e.sequence);
    expect(sequences).toEqual([...sequences].sort((a, b) => a - b)); // monotónico
    expect(new Set(sequences).size).toBe(sequences.length); // sin duplicados
  });
});
