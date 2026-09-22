import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createInitialState } from "@z-world/simulation-core";
import { applyCommand } from "@z-world/simulation-core";
import { createPrismaClient, type PrismaClient } from "./client.js";
import { createGame, listGames, loadGame, RevisionConflictError, saveSnapshot } from "./repository.js";

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

describe("persistencia PostgreSQL/Prisma (integración real)", () => {
  it("crea una partida de forma atómica con snapshot inicial y eventos", async () => {
    const state = createInitialState("integration-seed-1");
    const { events } = applyCommand(state, { commandId: "cmd-init", type: "set_pause", paused: false });

    const created = await createGame(prisma, { state, initialEvents: events });
    expect(created.revision).toBe(0);

    const games = await listGames(prisma);
    expect(games).toHaveLength(1);
    expect(games[0]!.seed).toBe("integration-seed-1");
  });

  it("carga el último snapshot válido de una partida", async () => {
    const state = createInitialState("integration-seed-2");
    const { gameSaveId } = await createGame(prisma, { state, initialEvents: [] });

    const loaded = await loadGame(prisma, gameSaveId);
    expect(loaded.revision).toBe(0);
    expect(loaded.state.seed).toBe("integration-seed-2");
    expect(Object.keys(loaded.state.people)).toHaveLength(6);
  });

  it("actualiza la revisión atómicamente al guardar", async () => {
    const state = createInitialState("integration-seed-3");
    const { gameSaveId } = await createGame(prisma, { state, initialEvents: [] });

    const { state: nextState, events } = applyCommand(state, {
      commandId: "cmd-3",
      type: "update_priority",
      personId: state.peopleOrder[0]!,
      priorityId: "medicine_priority",
      value: 1,
    });

    const saved = await saveSnapshot(prisma, {
      gameSaveId,
      expectedRevision: 0,
      state: nextState,
      events,
      reason: "manual_save",
    });
    expect(saved.revision).toBe(1);

    const reloaded = await loadGame(prisma, gameSaveId);
    expect(reloaded.revision).toBe(1);
    expect(reloaded.state.people[state.peopleOrder[0]!]!.public.priorities.medicine_priority).toBe(1);
  });

  it("rechaza una revisión obsoleta sin sobrescribir en silencio", async () => {
    const state = createInitialState("integration-seed-4");
    const { gameSaveId } = await createGame(prisma, { state, initialEvents: [] });

    await saveSnapshot(prisma, { gameSaveId, expectedRevision: 0, state, events: [], reason: "manual_save" });

    await expect(
      saveSnapshot(prisma, { gameSaveId, expectedRevision: 0, state, events: [], reason: "manual_save" }),
    ).rejects.toBeInstanceOf(RevisionConflictError);
  });

  it("persiste un movimiento a mitad de ruta y lo reanuda exactamente tras recargar", async () => {
    const state0 = createInitialState("integration-seed-5");
    const personId = state0.peopleOrder[0]!;
    const person0 = state0.people[personId]!;
    const destination = { x: person0.public.position.x + 5, y: person0.public.position.y };

    const { state: ordered } = applyCommand(state0, {
      commandId: "cmd-5",
      type: "order_direct_move",
      personId,
      destination,
    });

    const { gameSaveId } = await createGame(prisma, { state: ordered, initialEvents: [] });
    const reloaded = await loadGame(prisma, gameSaveId);

    expect(reloaded.state.people[personId]!.public.activeMovementOrder).toEqual(
      ordered.people[personId]!.public.activeMovementOrder,
    );
  });

  it("produce un error explícito ante un snapshot corrupto/incompatible, sin regenerar por semilla", async () => {
    const state = createInitialState("integration-seed-6");
    const { gameSaveId } = await createGame(prisma, { state, initialEvents: [] });

    await prisma.simulationSnapshot.updateMany({
      where: { gameSaveId },
      data: { state: { not: "a valid state" } as unknown as object },
    });

    await expect(loadGame(prisma, gameSaveId)).rejects.toThrow(/corrupto o incompatible/);
  });

  it("hace rollback si la transacción de guardado falla", async () => {
    const state = createInitialState("integration-seed-7");
    const { gameSaveId } = await createGame(prisma, { state, initialEvents: [] });

    await expect(
      saveSnapshot(prisma, {
        gameSaveId: "id-inexistente-00000000-0000-0000-0000-000000000000",
        expectedRevision: 0,
        state,
        events: [],
        reason: "manual_save",
      }),
    ).rejects.toThrow();

    const reloaded = await loadGame(prisma, gameSaveId);
    expect(reloaded.revision).toBe(0);
  });
});
