import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { DomainEventV2, SimulationStateV2 } from "@z-world/contracts";
import { parseSimulationStateV2 } from "@z-world/contracts";
import { advanceSimulationV2, applyCommandV2, buildFullNavigationIndexV2, createInitialStateV2, type NavigationIndexV2 } from "@z-world/simulation-core";
import { createPrismaClient, type PrismaClient } from "./client.js";
import { createGameV2, loadGameV2, saveSnapshotV2, RevisionConflictError } from "./repository.js";

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
 * Persistencia de S10 (entorno mutable y agricultura, `DEC-0020`) sobre
 * PostgreSQL real, con el pueblo generado por semilla estable
 * (`probe-seed-92`): la parcela garantizada de `SET-011 §7.5` (semillas y
 * herramienta ya localizadas en su borde) recorre preparar → sembrar →
 * crecer → cosechable → cosechar, con guardado y recarga a mitad de cada
 * fase continuando exactamente igual; un conflicto optimista sobre las
 * semillas reservadas falla limpiamente; y un snapshot anterior a S10 (sin
 * `coverage`/`terrainAreaId`/`preparationProgress`/etc.) sigue cargando con
 * valores por defecto seguros y avanzando el reloj sin errores.
 */
const SEED = "probe-seed-92";
const STEP = 1 / 30;

function guaranteedPlot(state: SimulationStateV2) {
  const plot = Object.values(state.cultivationPlots)[0]!;
  const parcel = state.world.parcels[plot.parcelId]!;
  return { plot, parcel };
}

function prepare() {
  const base = createInitialStateV2(SEED);
  const { plot, parcel } = guaranteedPlot(base);
  const priorities = { agriculture_priority: 1 as const };
  const worker = base.peopleOrder[0]!;
  const round6 = (v: number) => Math.round(v * 1_000_000) / 1_000_000;
  const rawCentroid = parcel.polygon.reduce((acc, p) => ({ x: acc.x + p.x / parcel.polygon.length, y: acc.y + p.y / parcel.polygon.length }), { x: 0, y: 0 });
  const centroid = { x: round6(rawCentroid.x), y: round6(rawCentroid.y) };
  const people = Object.fromEntries(
    Object.entries(base.people).map(([id, p]) => {
      const here = id === worker;
      return [
        id,
        {
          ...p,
          needs: p.needs.map((n) => ({ ...n, value: 100, band: "stable" as const })),
          location: here ? { kind: "world_point" as const, point: centroid } : p.location,
          public: { ...p.public, position: here ? centroid : p.public.position, activeMovementOrder: null, priorities: { ...p.public.priorities, ...priorities } },
        },
      ];
    }),
  );
  let state: SimulationStateV2 = { ...base, people };
  const nav = buildFullNavigationIndexV2(state.world);
  state = applyCommandV2(state, { commandId: "unpause", type: "set_pause", paused: false }, nav).state;
  return { state, nav, worker, plotId: plot.id, parcelId: parcel.id };
}

function runUntil(state: SimulationStateV2, navIn: NavigationIndexV2, predicate: (s: SimulationStateV2) => boolean, maxTicks = 6000) {
  let current = state;
  let nav = navIn;
  const events: DomainEventV2[] = [];
  for (let i = 0; i < maxTicks && !predicate(current); i++) {
    const r = advanceSimulationV2(current, STEP, nav);
    current = r.state;
    nav = r.nav;
    events.push(...r.events);
  }
  return { state: current, events, nav };
}

function orderAction(state: SimulationStateV2, nav: NavigationIndexV2, commandId: string, command: { personId: string; actionKey: string; target: { kind: "cultivation_plot"; cultivationPlotId: string }; cropId?: string }) {
  const result = applyCommandV2(state, { type: "order_contextual_action", commandId, teamPersonIds: [], ...command }, nav);
  const created = result.events.find((e) => e.type === "job_created");
  return { state: result.state, events: [...result.events], jobId: created && created.type === "job_created" ? created.jobId : "" };
}

describe("persistencia del ciclo agrícola S10 (PostgreSQL real)", () => {
  it("prepara, siembra, crece y cosecha la parcela garantizada; cada fase sobrevive a guardar/recargar y continúa exactamente igual", async () => {
    const setup = prepare();
    let nav = setup.nav;
    const created = await createGameV2(prisma, { state: setup.state, initialEvents: [] });
    let revision = 0;

    // Fase 1: preparar suelo, guardar a mitad de progreso.
    const prep = orderAction(setup.state, nav, "cmd-prepare", { personId: setup.worker, actionKey: "prepare_soil", target: { kind: "cultivation_plot", cultivationPlotId: setup.plotId } });
    const midPrep = runUntil(prep.state, nav, (s) => s.jobs[prep.jobId]!.progressRatio > 0.3);
    expect(midPrep.state.jobs[prep.jobId]!.state).toBe("in_progress");
    await saveSnapshotV2(prisma, { gameSaveId: created.gameSaveId, expectedRevision: revision, state: midPrep.state, events: [...prep.events, ...midPrep.events], reason: "order_settled" });
    revision += 1;
    let reloaded = await loadGameV2(prisma, created.gameSaveId);
    expect(reloaded.state).toEqual(midPrep.state);

    const preparedDone = (s: SimulationStateV2) => s.cultivationPlots[setup.plotId]!.state === "prepared";
    const inMemoryPrepared = runUntil(midPrep.state, midPrep.nav, preparedDone);
    const reloadedNav = buildFullNavigationIndexV2(reloaded.state.world);
    const afterReloadPrepared = runUntil(reloaded.state, reloadedNav, preparedDone);
    expect(afterReloadPrepared.events).toEqual(inMemoryPrepared.events);
    expect(afterReloadPrepared.state).toEqual(inMemoryPrepared.state);
    let state = inMemoryPrepared.state;
    nav = inMemoryPrepared.nav;

    // Fase 2: sembrar (perfil acelerado, explícito y versionado, exclusivo de esta fixture — §10.3 del prompt de subhito).
    const sow = orderAction(state, nav, "cmd-sow", { personId: setup.worker, actionKey: "sow", target: { kind: "cultivation_plot", cultivationPlotId: setup.plotId }, cropId: "test_fast_vegetables" });
    const midSow = runUntil(sow.state, nav, (s) => s.jobs[sow.jobId]!.progressRatio > 0.3);
    expect(midSow.state.jobs[sow.jobId]!.state).toBe("in_progress");
    await saveSnapshotV2(prisma, { gameSaveId: created.gameSaveId, expectedRevision: revision, state: midSow.state, events: [...sow.events, ...midSow.events], reason: "order_settled" });
    revision += 1;
    reloaded = await loadGameV2(prisma, created.gameSaveId);
    expect(reloaded.state).toEqual(midSow.state);

    const growingDone = (s: SimulationStateV2) => s.cultivationPlots[setup.plotId]!.state === "growing";
    const inMemoryGrowing = runUntil(midSow.state, midSow.nav, growingDone);
    const afterReloadGrowing = runUntil(reloaded.state, buildFullNavigationIndexV2(reloaded.state.world), growingDone);
    expect(afterReloadGrowing.state).toEqual(inMemoryGrowing.state);
    state = inMemoryGrowing.state;
    nav = inMemoryGrowing.nav;
    const cycle = Object.values(state.cropCycles).find((c) => c.cultivationPlotId === setup.plotId)!;
    expect(cycle.seedsSownKg).toBeGreaterThan(0);
    expect(cycle.sownAreaM2).toBeGreaterThan(0);

    // Fase 3: crecimiento por reloj hasta cosechable a ×10; guarda y recarga a mitad de ese avance.
    state = applyCommandV2(state, { commandId: "fast", type: "set_speed", speed: 10 }, nav).state;
    const harvestableDone = (s: SimulationStateV2) => s.cultivationPlots[setup.plotId]!.state === "harvestable";
    const startSimSeconds = state.clock.elapsedSimSeconds;
    const growthMid = runUntil(state, nav, (s) => s.clock.elapsedSimSeconds - startSimSeconds > 200);
    await saveSnapshotV2(prisma, { gameSaveId: created.gameSaveId, expectedRevision: revision, state: growthMid.state, events: growthMid.events, reason: "order_settled" });
    revision += 1;
    reloaded = await loadGameV2(prisma, created.gameSaveId);
    expect(reloaded.state).toEqual(growthMid.state);
    const inMemoryHarvestable = runUntil(growthMid.state, growthMid.nav, harvestableDone);
    const afterReloadHarvestable = runUntil(reloaded.state, buildFullNavigationIndexV2(reloaded.state.world), harvestableDone);
    expect(afterReloadHarvestable.state).toEqual(inMemoryHarvestable.state);
    state = inMemoryHarvestable.state;
    nav = inMemoryHarvestable.nav;

    // Fase 4: cosechar. El lote de cosecha localizado sobrevive a guardar/recargar sin duplicarse.
    const harvest = orderAction(state, nav, "cmd-harvest", { personId: setup.worker, actionKey: "harvest", target: { kind: "cultivation_plot", cultivationPlotId: setup.plotId } });
    const done = runUntil(harvest.state, nav, (s) => s.jobs[harvest.jobId]!.state === "completed");
    await saveSnapshotV2(prisma, { gameSaveId: created.gameSaveId, expectedRevision: revision, state: done.state, events: [...harvest.events, ...done.events], reason: "order_settled" });
    revision += 1;
    reloaded = await loadGameV2(prisma, created.gameSaveId);
    const cycleId = Object.values(reloaded.state.cropCycles).find((c) => c.cultivationPlotId === setup.plotId)!.id;
    const harvestLots = Object.values(reloaded.state.resourceLots).filter((l) => l.family === "fresh_food" && l.provenance === `harvest:${cycleId}`);
    expect(harvestLots.length).toBe(1);
    expect(harvestLots[0]!.quantity).toBeGreaterThan(0);
    expect(reloaded.state.cultivationPlots[setup.plotId]!.state).toBe("harvested");
  });

  it("dos clientes que guardan tras consumir las mismas semillas: uno falla limpiamente con conflicto de revisión, sin duplicar ni perder el consumo", async () => {
    const setup = prepare();
    const created = await createGameV2(prisma, { state: setup.state, initialEvents: [] });

    const prep = orderAction(setup.state, setup.nav, "cmd-prepare", { personId: setup.worker, actionKey: "prepare_soil", target: { kind: "cultivation_plot", cultivationPlotId: setup.plotId } });
    const prepared = runUntil(prep.state, setup.nav, (s) => s.cultivationPlots[setup.plotId]!.state === "prepared");

    const sow = orderAction(prepared.state, prepared.nav, "cmd-sow", { personId: setup.worker, actionKey: "sow", target: { kind: "cultivation_plot", cultivationPlotId: setup.plotId }, cropId: "test_fast_vegetables" });
    const sownA = runUntil(sow.state, prepared.nav, (s) => s.cultivationPlots[setup.plotId]!.state === "growing");
    const sownB = runUntil(sow.state, prepared.nav, (s) => s.cultivationPlots[setup.plotId]!.state === "growing");

    await saveSnapshotV2(prisma, { gameSaveId: created.gameSaveId, expectedRevision: 0, state: sownA.state, events: [...sow.events, ...sownA.events], reason: "order_settled" });
    await expect(saveSnapshotV2(prisma, { gameSaveId: created.gameSaveId, expectedRevision: 0, state: sownB.state, events: [...sow.events, ...sownB.events], reason: "order_settled" })).rejects.toThrow(RevisionConflictError);

    const reloaded = await loadGameV2(prisma, created.gameSaveId);
    expect(reloaded.state).toEqual(sownA.state);
    const cycle = Object.values(reloaded.state.cropCycles)[0]!;
    expect(cycle.seedsSownKg).toBeGreaterThan(0);
  });

  it("un snapshot anterior a S10 (sin coverage/terrainAreaId/preparationProgress/built) carga con defaults seguros y sigue avanzando", async () => {
    const setup = prepare();
    const raw = JSON.parse(JSON.stringify(setup.state));
    for (const area of Object.values(raw.world.terrainAreas) as Record<string, unknown>[]) delete area.coverage;
    for (const parcel of Object.values(raw.world.parcels) as Record<string, unknown>[]) delete parcel.terrainAreaId;
    for (const segment of Object.values(raw.world.barrierSegments) as Record<string, unknown>[]) {
      delete segment.built;
      delete segment.createdByJobId;
    }
    for (const plot of Object.values(raw.cultivationPlots) as Record<string, unknown>[]) {
      delete plot.preparationProgress;
      delete plot.damageLevel;
    }
    for (const job of Object.values(raw.jobs) as Record<string, unknown>[]) delete job.cropId;

    const parsed = parseSimulationStateV2(raw);
    expect(parsed.success).toBe(true);
    const legacyState = parsed.data!;
    expect(Object.values(legacyState.world.terrainAreas).every((a) => a.coverage === null)).toBe(true);
    expect(Object.values(legacyState.cultivationPlots).every((p) => p.preparationProgress === 0 && p.damageLevel === 0)).toBe(true);

    const created = await createGameV2(prisma, { state: legacyState, initialEvents: [] });
    const reloaded = await loadGameV2(prisma, created.gameSaveId);
    expect(reloaded.state).toEqual(legacyState);

    const nav = buildFullNavigationIndexV2(reloaded.state.world);
    const advanced = advanceSimulationV2(reloaded.state, 5, nav);
    expect(advanced.state.clock.elapsedSimSeconds).toBeGreaterThan(reloaded.state.clock.elapsedSimSeconds);
  });
});
