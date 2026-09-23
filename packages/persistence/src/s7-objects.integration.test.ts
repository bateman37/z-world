import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { DomainEventV2, PersonStateV2, ResourceLot, SimulationCommand, SimulationStateV2 } from "@z-world/contracts";
import {
  advanceSimulationV2,
  applyCommandV2,
  buildFullNavigationIndexV2,
  createInitialStateV2,
  resolveHolderPersonId,
  validateSimulationStateV2Invariants,
  type NavigationIndexV2,
} from "@z-world/simulation-core";
import { createPrismaClient, type PrismaClient } from "./client.js";
import { createGameV2, loadGameV2, saveSnapshotV2 } from "./repository.js";

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
 * Persistencia de S7 (Puerta A) sobre PostgreSQL real: los resultados de
 * almacenar/retirar, la bomba probada/reparada/con agua extraída, la
 * carretilla/carro reparada o desmontada y el deterioro del alimento
 * fresco sobreviven exactos a guardar y recargar, sus eventos causales
 * quedan registrados, y un snapshot con la forma anterior a S7 sigue
 * cargando con defaults seguros. Usa el reductor/avance reales sobre un
 * pueblo generado por `web-002-semantic-v2`.
 */

function unpause(state: SimulationStateV2, nav: NavigationIndexV2): SimulationStateV2 {
  return applyCommandV2(state, { commandId: "unpause", type: "set_pause", paused: false }, nav).state;
}

function order(state: SimulationStateV2, nav: NavigationIndexV2, command: Omit<Extract<SimulationCommand, { type: "order_contextual_action" }>, "type" | "teamPersonIds">) {
  const result = applyCommandV2(state, { type: "order_contextual_action", teamPersonIds: [], ...command }, nav);
  const created = result.events.find((e) => e.type === "job_created");
  if (!created || created.type !== "job_created") throw new Error("No se creó el trabajo.");
  return { state: result.state, events: [...result.events], jobId: created.jobId };
}

function run(state: SimulationStateV2, nav: NavigationIndexV2, ticks: number, seconds: number) {
  let current = state;
  const events: DomainEventV2[] = [];
  for (let i = 0; i < ticks; i++) {
    const result = advanceSimulationV2(current, seconds, nav);
    current = result.state;
    events.push(...result.events);
  }
  return { state: current, events };
}

/** Coloca a una persona junto a un punto exterior y con necesidades cubiertas (preparación de la prueba, no parte de lo medido). */
function placePerson(state: SimulationStateV2, personId: string, point: { x: number; y: number }, repairPriority = true): SimulationStateV2 {
  const person = state.people[personId]!;
  const moved: PersonStateV2 = {
    ...person,
    needs: person.needs.map((n) => ({ ...n, value: 100, band: "stable" })),
    location: { kind: "world_point", point },
    public: { ...person.public, position: point, activeMovementOrder: null, priorities: repairPriority ? { ...person.public.priorities, repair: 1, water_supply: 1, dismantling_recycling: 1, logistics: 1 } : person.public.priorities },
  };
  return { ...state, people: { ...state.people, [personId]: moved } };
}

function carriedLot(id: string, family: ResourceLot["family"], quantity: number, personId: string): ResourceLot {
  return { id, family, quantity, unit: "kilogram", location: { kind: "carried_by_person", personId }, condition: 0.8, reservedByJobId: null, qualityKnown: true, quality: 1, provenance: "integration_test", decayStartedAtSimSeconds: null, conditionAtDecayStart: null };
}

async function persistedEventTypes(gameSaveId: string): Promise<string[]> {
  const rows = await prisma.domainEventRecord.findMany({ where: { gameSaveId }, orderBy: { sequence: "asc" } });
  return rows.map((r) => r.type);
}

describe("persistencia de objetos S7 (PostgreSQL real)", () => {
  it("retirar y volver a guardar una cantimplora de la propia mochila persiste ubicación, jerarquía y eventos", async () => {
    const initial = createInitialStateV2("persist-s7-store-1");
    const nav = buildFullNavigationIndexV2(initial.world);
    const created = await createGameV2(prisma, { state: initial, initialEvents: [] });
    const personId = initial.peopleOrder[0]!;
    const pack = Object.values(initial.containers).find((c) => c.hostWorldObjectId === `${personId}-pack`)!;
    const vesselId = pack.contentIds.find((id) => initial.worldObjects[id]?.family === "personal_liquid_container")!;

    let state = unpause(placePerson(initial, personId, initial.people[personId]!.public.position), nav);
    const retrieve = order(state, nav, { commandId: "r", personId, actionKey: "retrieve_from_storage", target: { kind: "container", containerId: pack.id }, storageItem: { kind: "world_object", id: vesselId } });
    const afterRetrieve = run(retrieve.state, nav, 10, 1);
    expect(afterRetrieve.state.worldObjects[vesselId]!.location).toEqual({ kind: "carried_by_person", personId });

    const store = order(afterRetrieve.state, nav, { commandId: "s", personId, actionKey: "store", target: { kind: "container", containerId: pack.id }, storageItem: { kind: "world_object", id: vesselId } });
    const afterStore = run(store.state, nav, 10, 1);
    state = afterStore.state;
    expect(state.worldObjects[vesselId]!.location).toEqual({ kind: "container", containerId: pack.id });
    expect(validateSimulationStateV2Invariants(state).ok).toBe(true);

    const saved = await saveSnapshotV2(prisma, {
      gameSaveId: created.gameSaveId,
      expectedRevision: 0,
      state,
      events: [...retrieve.events, ...afterRetrieve.events, ...store.events, ...afterStore.events],
      reason: "order_settled",
    });
    expect(saved.revision).toBe(1);
    const reloaded = await loadGameV2(prisma, created.gameSaveId);
    expect(reloaded.state).toEqual(state);
    const types = await persistedEventTypes(created.gameSaveId);
    expect(types).toContain("object_retrieved");
    expect(types).toContain("object_stored");
    expect(types).toContain("reservation_created");
  });

  it("la bomba probada, reparada con piezas concretas y con agua extraída persiste sin remuestrear", async () => {
    const initial = createInitialStateV2("persist-s7-pump-1");
    const nav = buildFullNavigationIndexV2(initial.world);
    const pump = Object.values(initial.worldObjects).find((o) => o.variant === "technical_installation.hand_pump")!;
    const pumpPoint = pump.location.kind === "world_point" ? pump.location.point : { x: 0, y: 0 };
    const personId = [...initial.peopleOrder].sort((a, b) => (initial.people[b]!.public.skills.mechanics ?? 0) - (initial.people[a]!.public.skills.mechanics ?? 0))[0]!;
    let state = placePerson(initial, personId, pumpPoint);
    state = { ...state, resourceLots: { ...state.resourceLots, "lot-it-parts": carriedLot("lot-it-parts", "mechanical_parts_i", 1, personId), "lot-it-sheet": carriedLot("lot-it-sheet", "sheet_metal", 1, personId) } };
    // Una bomba no averiada en esta semilla se fuerza a avería para ejercitar la reparación (la persistencia es lo medido).
    state = { ...state, worldObjects: { ...state.worldObjects, [pump.id]: { ...pump, functionalState: "broken", condition: 0.18, functions: [], inactiveFunctionReasons: { water_pumping: "worn_seal" } } } };
    const created = await createGameV2(prisma, { state, initialEvents: [] });
    state = unpause(state, nav);

    const allEvents: DomainEventV2[] = [];
    const test = order(state, nav, { commandId: "t", personId, actionKey: "test_installation", target: { kind: "world_object", worldObjectId: pump.id } });
    let step = run(test.state, nav, 40, 1);
    allEvents.push(...test.events, ...step.events);
    const repair = order(step.state, nav, { commandId: "rep", personId, actionKey: "repair", target: { kind: "world_object", worldObjectId: pump.id } });
    step = run(repair.state, nav, 80, 1);
    allEvents.push(...repair.events, ...step.events);
    const repairedPump = step.state.worldObjects[pump.id]!;
    const repairedEvent = step.events.find((e) => e.type === "object_repaired");
    expect(repairedEvent).toBeDefined();

    let draws = 0;
    if (repairedPump.functions.includes("water_pumping")) {
      const draw = order(step.state, nav, { commandId: "draw", personId, actionKey: "draw_water", target: { kind: "world_object", worldObjectId: pump.id } });
      step = run(draw.state, nav, 40, 1);
      allEvents.push(...draw.events, ...step.events);
      draws = step.events.filter((e) => e.type === "water_drawn").length;
      expect(draws).toBeGreaterThan(0);
    }
    state = step.state;
    expect(validateSimulationStateV2Invariants(state).ok).toBe(true);

    await saveSnapshotV2(prisma, { gameSaveId: created.gameSaveId, expectedRevision: 0, state, events: allEvents, reason: "order_settled" });
    const reloaded = await loadGameV2(prisma, created.gameSaveId);
    expect(reloaded.state).toEqual(state);
    expect(reloaded.state.worldObjects[pump.id]!.installedAt).toEqual(pump.installedAt);
    expect(reloaded.state.episodes).toEqual(state.episodes);
    const types = await persistedEventTypes(created.gameSaveId);
    expect(types).toContain("installation_tested");
    expect(types).toContain("object_repaired");
    if (draws > 0) expect(types).toContain("water_drawn");

    // Seguir desde la partida recargada da exactamente lo mismo que seguir sin recargar (sin remuestreo).
    const continuedFromMemory = run(state, nav, 5, 2).state;
    const continuedFromReload = run(reloaded.state, nav, 5, 2).state;
    expect(continuedFromReload).toEqual(continuedFromMemory);
  });

  it("la carretilla/carro desmontada persiste productos localizados y la pérdida permanente de su función", async () => {
    const initial = createInitialStateV2("persist-s7-cart-1");
    const nav = buildFullNavigationIndexV2(initial.world);
    const means = Object.values(initial.transportMeans)[0]!;
    const point = means.location.kind === "world_point" ? means.location.point : { x: 0, y: 0 };
    const personId = initial.peopleOrder[1]!;
    let state = placePerson(initial, personId, point);
    const created = await createGameV2(prisma, { state, initialEvents: [] });
    state = unpause(state, nav);
    // Desguace destructivo (modelo D, sin episodio B): resultado determinista para medir la persistencia.
    const dis = order(state, nav, { commandId: "dis", personId, actionKey: "disassemble_destructive", target: { kind: "transport_means", transportMeansId: means.id }, disassemblyScope: "destructive", confirmIrreversible: true });
    const step = run(dis.state, nav, 60, 1);
    expect(step.state.jobs[dis.jobId]!.state).toBe("completed");
    const disassembled = step.events.find((e) => e.type === "object_disassembled");
    expect(disassembled && disassembled.type === "object_disassembled" && disassembled.entityKind).toBe("transport_means");
    state = step.state;
    await saveSnapshotV2(prisma, { gameSaveId: created.gameSaveId, expectedRevision: 0, state, events: [...dis.events, ...step.events], reason: "order_settled" });
    const reloaded = await loadGameV2(prisma, created.gameSaveId);
    const reloadedMeans = reloaded.state.transportMeans[means.id]!;
    expect(reloadedMeans.functionalState).toBe("parts_only");
    expect(reloadedMeans.functions).toEqual([]);
    expect(reloadedMeans.inactiveFunctionReasons.hauling).toBe("disassembled");
    if (disassembled && disassembled.type === "object_disassembled") {
      for (const lotId of disassembled.producedResourceLotIds) expect(reloaded.state.resourceLots[lotId]).toEqual(state.resourceLots[lotId]);
    }
    expect(await persistedEventTypes(created.gameSaveId)).toContain("object_disassembled");
  });

  it("el deterioro del alimento fresco persiste y continúa idéntico tras recargar", async () => {
    const initial = createInitialStateV2("persist-s7-decay-1");
    const nav = buildFullNavigationIndexV2(initial.world);
    const personId = initial.peopleOrder[0]!;
    const fresh: ResourceLot = { id: "lot-it-fresh", family: "fresh_food", quantity: 2, unit: "unit", location: { kind: "carried_by_person", personId }, condition: 0.9, reservedByJobId: null, qualityKnown: true, quality: 1, provenance: "integration_test", decayStartedAtSimSeconds: initial.clock.elapsedSimSeconds, conditionAtDecayStart: 0.9 };
    let state: SimulationStateV2 = { ...initial, resourceLots: { ...initial.resourceLots, [fresh.id]: fresh } };
    state = placePerson(state, personId, initial.people[personId]!.public.position, false);
    const created = await createGameV2(prisma, { state, initialEvents: [] });
    state = unpause(state, nav);
    const step = run(state, nav, 25, 10); // 25 × 720 s = 5 h simuladas (×72 a velocidad 1)
    const decayedCondition = step.state.resourceLots[fresh.id]!.condition;
    expect(decayedCondition).toBeLessThan(0.9);
    await saveSnapshotV2(prisma, { gameSaveId: created.gameSaveId, expectedRevision: 0, state: step.state, events: step.events, reason: "manual_save" });
    const reloaded = await loadGameV2(prisma, created.gameSaveId);
    expect(reloaded.state.resourceLots[fresh.id]).toEqual(step.state.resourceLots[fresh.id]);
    const fromMemory = run(step.state, nav, 12, 50).state.resourceLots[fresh.id]!;
    const fromReload = run(reloaded.state, nav, 12, 50).state.resourceLots[fresh.id]!;
    expect(fromReload).toEqual(fromMemory);
    expect(fromReload.condition).toBeLessThan(decayedCondition);
    expect(resolveHolderPersonId(reloaded.state, reloaded.state.resourceLots[fresh.id]!.location)).toBe(personId);
  });

  it("un snapshot con la forma anterior a S7 (sin campos nuevos) sigue cargando con defaults seguros", async () => {
    const modern = createInitialStateV2("persist-s7-compat-1");
    const legacy = JSON.parse(JSON.stringify(modern)) as Record<string, Record<string, Record<string, unknown>>>;
    for (const obj of Object.values(legacy.worldObjects!)) delete obj.installedAt;
    for (const lot of Object.values(legacy.resourceLots!)) delete lot.conditionAtDecayStart;
    for (const means of Object.values(legacy.transportMeans!)) {
      for (const key of ["variant", "weightKg", "bulk", "quality", "functionalState", "handlingTags", "functions", "inactiveFunctionReasons", "missingParts", "repairProfileId", "disassemblyProfileId", "provenance", "knownEvidenceIds"]) delete means[key];
    }
    const created = await createGameV2(prisma, { state: legacy as unknown as SimulationStateV2, initialEvents: [] });
    const loaded = await loadGameV2(prisma, created.gameSaveId);
    const means = Object.values(loaded.state.transportMeans)[0]!;
    expect(means.functionalState).toBe("functional");
    expect(means.functions).toEqual(["hauling"]);
    expect(Object.values(loaded.state.worldObjects).every((o) => o.installedAt === null)).toBe(true);
    expect(Object.values(loaded.state.resourceLots).every((l) => l.conditionAtDecayStart === null || l.family === "fresh_food")).toBe(true);
    expect(validateSimulationStateV2Invariants(loaded.state).ok).toBe(true);
  });
});
