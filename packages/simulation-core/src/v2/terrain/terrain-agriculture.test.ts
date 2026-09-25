import { describe, expect, it } from "vitest";
import type { Anchor, LinearFeature, ResourceLot, SimulationCommand, SimulationStateV2, TerrainArea, WorldObject } from "@z-world/contracts";
import { parseSimulationStateV2 } from "@z-world/contracts";
import { applyCommandV2 } from "../apply-command-v2.js";
import { advanceSimulationV2 } from "../advance-simulation-v2.js";
import { buildFullNavigationIndexV2, type NavigationIndexV2 } from "../room-graph.js";
import { makeSyntheticBuildingState } from "../test-fixtures.js";
import { makeResourceLot, makeWorldObject } from "../generator/buildings.js";
import { validateSimulationStateV2Invariants } from "../invariants.js";
import { derivePerimeterNetworks } from "./perimeter.js";
import { evaluateCultivationSuitability } from "./suitability.js";

/**
 * Pruebas de S10 (`DEC-0020`): entorno mutable inicial (limpieza,
 * carretera, barrera/perímetro) y ciclo agrícola completo. Reutiliza el
 * mundo sintético de `test-fixtures.ts` (terreno abierto en x,y∈[-60,60])
 * y añade solo las entidades adicionales que cada prueba necesita, en vez
 * de depender del generador real (más lento y menos legible para aislar
 * cada mecánica).
 */

function violations(state: SimulationStateV2): string[] {
  return validateSimulationStateV2Invariants(state).violations.map((v) => `${v.code}: ${v.message}`);
}

interface World {
  state: SimulationStateV2;
  nav: NavigationIndexV2;
  p1: string;
}

function world(seed = "s10-terrain"): World {
  const base = makeSyntheticBuildingState(seed);
  const p1 = base.peopleOrder[0]!;
  // Solo una persona activa, dentro de los límites del mundo sintético (S8/S9 filtran igual: el resto del reparto y su
  // mobiliario/objetos proceden del generador real completo que usa `createInitialStateV2` bajo el capó).
  const people = {
    [p1]: {
      ...base.people[p1]!,
      needs: base.people[p1]!.needs.map((n) => ({ ...n, value: 100, band: "stable" as const })),
      public: {
        ...base.people[p1]!.public,
        position: { x: 0, y: 0 },
        activeMovementOrder: null,
        operationalState: "awaiting_orders" as const,
        priorities: { ...base.people[p1]!.public.priorities, agriculture_priority: 1 as const, logging: 1 as const, logistics: 1 as const, construction_fortification: 1 as const },
      },
      location: { kind: "world_point" as const, point: { x: 0, y: 0 } },
    },
  };
  let state: SimulationStateV2 = { ...base, people, peopleOrder: [p1], worldObjects: {}, containers: {}, furniture: {}, resourceLots: {}, discoveries: [] };
  state = applyCommandV2(state, { commandId: "unpause", type: "set_pause", paused: false }, buildFullNavigationIndexV2(state.world)).state;
  return { state, nav: buildFullNavigationIndexV2(state.world), p1 };
}

const STEP = 5;

function run(state: SimulationStateV2, nav: NavigationIndexV2, ticks: number, secondsPerTick = STEP, until?: (s: SimulationStateV2) => boolean) {
  let current = state;
  let currentNav = nav;
  for (let i = 0; i < ticks; i++) {
    const result = advanceSimulationV2(current, secondsPerTick, currentNav);
    current = result.state;
    currentNav = result.nav;
    if (until?.(current)) break;
  }
  return { state: current, nav: currentNav };
}

function order(state: SimulationStateV2, nav: NavigationIndexV2, command: Omit<Extract<SimulationCommand, { type: "order_contextual_action" }>, "type" | "teamPersonIds" | "commandId"> & { commandId?: string }) {
  const result = applyCommandV2(state, { commandId: command.commandId ?? `cmd-${Math.random()}`, type: "order_contextual_action", teamPersonIds: [], ...command }, nav);
  return result.state;
}

function designate(state: SimulationStateV2, nav: NavigationIndexV2, kind: Extract<SimulationCommand, { type: "create_area_designation" }>["kind"], polygon: readonly { x: number; y: number }[], wayCrossingMode?: "full_block" | "pedestrian_gap" | "handcart_gate") {
  const result = applyCommandV2(state, { commandId: `designate-${kind}-${Math.random()}`, type: "create_area_designation", designationId: `designation-${kind}-${Math.random()}`, kind, polygon: [...polygon], wayCrossingMode }, nav);
  return result.state;
}

describe("S10 — despejar vegetación y escombros", () => {
  it("despeja un área de matorral: produce madera, actualiza cobertura y sobrevive a interrupción/reanudación", () => {
    const w = world();
    const vegetation: TerrainArea = { id: "area-vegetation", kind: "dense_vegetation", polygon: [{ x: -40, y: -40 }, { x: -30, y: -40 }, { x: -30, y: -30 }, { x: -40, y: -30 }], transitable: true, traversalCostMultiplier: 1.8, placeId: null, coverage: "vegetation" };
    let state: SimulationStateV2 = { ...w.state, world: { ...w.state.world, terrainAreas: { ...w.state.world.terrainAreas, [vegetation.id]: vegetation } } };
    const nav = buildFullNavigationIndexV2(state.world);

    state = designate(state, nav, "clear_area", vegetation.polygon);
    const job = Object.values(state.jobs).find((j) => j.actionKey === "clear_vegetation");
    expect(job).toBeTruthy();

    // Interrumpe a mitad de trabajo (cancela la persona asignada) y comprueba progreso parcial antes de reanudar.
    const mid = run(state, nav, 6, STEP, (s) => (s.jobs[job!.id]?.progressRatio ?? 0) > 0.1).state;
    expect(mid.jobs[job!.id]!.progressRatio).toBeGreaterThan(0);
    expect(mid.jobs[job!.id]!.state).toBe("in_progress");

    const done = run(mid, nav, 40, STEP, (s) => s.jobs[job!.id]?.state === "completed").state;
    expect(done.jobs[job!.id]!.state).toBe("completed");
    expect(done.world.terrainAreas[vegetation.id]!.coverage).toBe("none");
    const woodLots = Object.values(done.resourceLots).filter((l) => l.family === "wood_and_planks");
    expect(woodLots.length).toBeGreaterThan(0);
    expect(woodLots[0]!.quantity).toBeGreaterThan(0);
    expect(violations(done)).toEqual([]);

    // Guardar/recargar a mitad de trabajo conserva exactamente el progreso.
    const reparsed = parseSimulationStateV2(JSON.parse(JSON.stringify(mid)));
    expect(reparsed.success).toBe(true);
    expect(reparsed.data!.jobs[job!.id]!.progressRatio).toBe(mid.jobs[job!.id]!.progressRatio);
  });

  it("una designación de escombros solo despeja áreas con esa cobertura, nunca vegetación", () => {
    const w = world();
    const debris: TerrainArea = { id: "area-debris", kind: "open_ground", polygon: [{ x: 30, y: 30 }, { x: 40, y: 30 }, { x: 40, y: 40 }, { x: 30, y: 40 }], transitable: true, traversalCostMultiplier: 1, placeId: null, coverage: "debris" };
    const state: SimulationStateV2 = { ...w.state, world: { ...w.state.world, terrainAreas: { ...w.state.world.terrainAreas, [debris.id]: debris } } };
    const nav = buildFullNavigationIndexV2(state.world);
    const afterCut = designate(state, nav, "cut_vegetation", debris.polygon);
    expect(Object.values(afterCut.jobs).some((j) => j.actionKey === "clear_vegetation")).toBe(false); // cut_vegetation ignora escombros.
    const afterClear = designate(state, nav, "clear_area", debris.polygon);
    const job = Object.values(afterClear.jobs).find((j) => j.actionKey === "clear_debris");
    expect(job).toBeTruthy();
    const done = run(afterClear, nav, 40, STEP, (s) => s.jobs[job!.id]?.state === "completed").state;
    expect(done.world.terrainAreas[debris.id]!.coverage).toBe("none");
    expect(Object.values(done.resourceLots).some((l) => l.family === "rubble")).toBe(true);
  });
});

describe("S10 — carretera mutable", () => {
  it("despejar conserva la función viaria; retirarla la elimina y cambia el coste de navegación", () => {
    const w = world();
    const road: LinearFeature = { id: "line-road", kind: "road", polyline: [{ x: -50, y: 0 }, { x: 50, y: 0 }], widthMeters: 6, wayState: "obstructed", placeId: null };
    let state: SimulationStateV2 = { ...w.state, world: { ...w.state.world, linearFeatures: { ...w.state.world.linearFeatures, [road.id]: road } } };
    let nav = buildFullNavigationIndexV2(state.world);

    state = order(state, nav, { personId: w.p1, actionKey: "clear_road", target: { kind: "linear_feature", linearFeatureId: road.id } });
    let job = Object.values(state.jobs).find((j) => j.actionKey === "clear_road")!;
    let res = run(state, nav, 30, STEP, (s) => s.jobs[job.id]?.state === "completed");
    state = res.state;
    nav = res.nav;
    expect(state.world.linearFeatures[road.id]!.wayState).toBe("cleared");
    expect(violations(state)).toEqual([]);

    // Retirar la función exige confirmación irreversible.
    const blocked = order(state, nav, { personId: w.p1, actionKey: "remove_way_function", target: { kind: "linear_feature", linearFeatureId: road.id } });
    const blockedJob = Object.values(blocked.jobs).find((j) => j.actionKey === "remove_way_function" && j.id !== job.id);
    const res2 = run(blocked, nav, 4, STEP);
    expect(res2.state.jobs[blockedJob!.id]!.blockReasonKey).toBe("block.irreversible_not_confirmed");

    const confirmed = order(state, nav, { personId: w.p1, actionKey: "remove_way_function", target: { kind: "linear_feature", linearFeatureId: road.id }, confirmIrreversible: true });
    job = Object.values(confirmed.jobs).find((j) => j.actionKey === "remove_way_function")!;
    res = run(confirmed, nav, 60, STEP, (s) => s.jobs[job.id]?.state === "completed");
    expect(res.state.world.linearFeatures[road.id]!.wayState).toBe("function_removed");
    expect(violations(res.state)).toEqual([]);
  });
});

describe("S10 — barrera y perímetro derivado", () => {
  it("un tramo construido no cierra nada hasta formar un lazo completo entre anclajes", () => {
    const w = world();
    const anchors: Record<string, Anchor> = {
      a1: { id: "a1", position: { x: -10, y: -10 }, kind: "post" },
      a2: { id: "a2", position: { x: 10, y: -10 }, kind: "post" },
      a3: { id: "a3", position: { x: 10, y: 10 }, kind: "post" },
    };
    const state: SimulationStateV2 = { ...w.state, world: { ...w.state.world, anchors } };

    const openSegments = { seg1: { id: "seg1", fromAnchorId: "a1", toAnchorId: "a2", crossesWayId: null, wayCrossingMode: null, built: true, createdByJobId: null } };
    const openWorld = { ...state.world, barrierSegments: openSegments };
    expect(Object.values(derivePerimeterNetworks(openWorld)).every((n) => !n.closed)).toBe(true);

    const closedSegments = {
      ...openSegments,
      seg2: { id: "seg2", fromAnchorId: "a2", toAnchorId: "a3", crossesWayId: null, wayCrossingMode: null, built: true, createdByJobId: null },
      seg3: { id: "seg3", fromAnchorId: "a3", toAnchorId: "a1", crossesWayId: null, wayCrossingMode: null, built: true, createdByJobId: null },
    };
    const closedWorld = { ...state.world, barrierSegments: closedSegments };
    const networks = derivePerimeterNetworks(closedWorld);
    expect(Object.values(networks).some((n) => n.closed)).toBe(true);
  });

  it("construye un tramo real entre dos anclajes consumiendo materiales reservados", () => {
    const w = world();
    const anchors: Record<string, Anchor> = {
      a1: { id: "a1", position: { x: -5, y: 20 }, kind: "post" },
      a2: { id: "a2", position: { x: 5, y: 20 }, kind: "post" },
    };
    const wood = makeResourceLot({ id: "lot-wood", family: "wood_and_planks", quantity: 60, unit: "kilogram", location: { kind: "world_point", point: { x: 0, y: 20 } }, condition: 0.8 });
    let state: SimulationStateV2 = { ...w.state, world: { ...w.state.world, anchors }, resourceLots: { [wood.id]: wood } };
    const nav = buildFullNavigationIndexV2(state.world);

    state = designate(state, nav, "build_barrier", [anchors.a1!.position, anchors.a2!.position]);
    const segmentId = Object.keys(state.world.barrierSegments)[0]!;
    expect(state.world.barrierSegments[segmentId]!.built).toBe(false);
    const job = Object.values(state.jobs).find((j) => j.actionKey === "build_barrier")!;
    const res = run(state, nav, 30, STEP, (s) => s.jobs[job.id]?.state === "completed");
    expect(res.state.world.barrierSegments[segmentId]!.built).toBe(true);
    // 10 m de distancia × 3 kg/m = 30 kg consumidos del lote de 60 kg; el resto queda disponible, nunca se destruye de más.
    expect(res.state.resourceLots["lot-wood"]!.quantity).toBe(30);
    expect(violations(res.state)).toEqual([]);
  });
});

describe("S10 — ciclo agrícola completo", () => {
  function seedAndTool(state: SimulationStateV2, parcelId: string): SimulationStateV2 {
    const seeds = makeResourceLot({ id: "lot-seeds", family: "seeds", quantity: 5, unit: "kilogram", location: { kind: "field_edge", parcelId }, condition: 0.8 });
    const water = makeResourceLot({ id: "lot-water", family: "water", quantity: 50, unit: "liter", location: { kind: "field_edge", parcelId }, condition: 1 });
    const tool: WorldObject = makeWorldObject({ id: "tool-agri", variant: "tool_set.agriculture", location: { kind: "field_edge", parcelId }, condition: 0.8, quality: 0.5, functionalState: "functional" });
    return { ...state, resourceLots: { ...state.resourceLots, [seeds.id]: seeds, [water.id]: water }, worldObjects: { ...state.worldObjects, [tool.id]: tool } };
  }

  it("evalúa la aptitud del terreno con razones estructuradas, nunca un booleano desnudo", () => {
    const w = world();
    const nav = buildFullNavigationIndexV2(w.state.world);
    void nav;
    const valid = evaluateCultivationSuitability(w.state, [{ x: -20, y: -20 }, { x: -10, y: -20 }, { x: -10, y: -10 }, { x: -20, y: -10 }]);
    expect(valid.verdict).toBe("valid");
    const outOfBounds = evaluateCultivationSuitability(w.state, [{ x: 500, y: 500 }, { x: 510, y: 500 }, { x: 510, y: 510 }]);
    expect(outOfBounds.verdict).toBe("blocked_physical");
    expect(outOfBounds.reasons.length).toBeGreaterThan(0);
  });

  it("prepara, siembra, cuida, pausa (sin crecimiento), avanza a ×10 y cosecha una parcela libre sobre terreno físicamente válido", () => {
    const w = world();
    const polygon = [{ x: -20, y: -20 }, { x: -10, y: -20 }, { x: -10, y: -10 }, { x: -20, y: -10 }];
    let state = w.state;
    let nav = buildFullNavigationIndexV2(state.world);

    state = designate(state, nav, "prepare_soil", polygon);
    const parcelId = Object.keys(state.world.parcels)[0]!;
    const plotId = state.world.parcels[parcelId]!.cultivationPlotId!;
    expect(state.cultivationPlots[plotId]!.state).toBe("unprepared");
    const prepJob = Object.values(state.jobs).find((j) => j.actionKey === "prepare_soil")!;
    let res = run(state, nav, 30, STEP, (s) => s.jobs[prepJob.id]?.state === "completed");
    state = res.state;
    nav = res.nav;
    expect(state.cultivationPlots[plotId]!.state).toBe("prepared");

    // Sembrar sin semillas presentes bloquea el trabajo con un motivo causal.
    const noSeeds = order(state, nav, { personId: w.p1, actionKey: "sow", target: { kind: "cultivation_plot", cultivationPlotId: plotId }, cropId: "test_fast_vegetables" });
    const sowJobId = Object.values(noSeeds.jobs).find((j) => j.actionKey === "sow")!.id;
    const blockedRes = run(noSeeds, nav, 4, STEP);
    expect(blockedRes.state.jobs[sowJobId]!.blockReasonKey).toBe("block.missing_seeds");

    state = seedAndTool(state, parcelId);
    state = order(state, nav, { personId: w.p1, actionKey: "sow", target: { kind: "cultivation_plot", cultivationPlotId: plotId }, cropId: "test_fast_vegetables" });
    const sowJob = Object.values(state.jobs).find((j) => j.actionKey === "sow")!;
    res = run(state, nav, 30, STEP, (s) => s.jobs[sowJob.id]?.state === "completed");
    state = res.state;
    nav = res.nav;
    expect(state.cultivationPlots[plotId]!.state).toBe("growing");
    const cycleId = state.cultivationPlots[plotId]!.activeCropCycleId!;
    expect(state.cropCycles[cycleId]!.seedsSownKg).toBeGreaterThan(0);
    expect(state.resourceLots["lot-seeds"]!.quantity).toBeLessThan(5);

    // Pausada, el cultivo no avanza aunque pase tiempo real.
    const paused = applyCommandV2(state, { commandId: "pause", type: "set_pause", paused: true }, nav).state;
    const stillPaused = run(paused, nav, 100, STEP).state;
    expect(stillPaused.cultivationPlots[plotId]!.state).toBe("growing");

    const unpaused = applyCommandV2(stillPaused, { commandId: "unpause", type: "set_pause", paused: false }, nav).state;
    // Cuidar el cultivo antes de que madure (agua real consumida).
    const tended = order(unpaused, nav, { personId: w.p1, actionKey: "tend_crop", target: { kind: "cultivation_plot", cultivationPlotId: plotId } });
    const tendJob = Object.values(tended.jobs).find((j) => j.actionKey === "tend_crop")!;
    res = run(tended, nav, 10, STEP, (s) => s.jobs[tendJob.id]?.state === "completed");
    state = res.state;
    nav = res.nav;
    expect(state.cropCycles[cycleId]!.careEvents.length).toBeGreaterThan(0);

    // Avanza a ×10 hasta alcanzar el hito de cosechable.
    const fast = applyCommandV2(state, { commandId: "fast", type: "set_speed", speed: 10 }, nav).state;
    res = run(fast, nav, 60, STEP, (s) => s.cultivationPlots[plotId]?.state === "harvestable");
    state = res.state;
    nav = res.nav;
    expect(state.cultivationPlots[plotId]!.state).toBe("harvestable");

    state = order(state, nav, { personId: w.p1, actionKey: "harvest", target: { kind: "cultivation_plot", cultivationPlotId: plotId } });
    const harvestJob = Object.values(state.jobs).find((j) => j.actionKey === "harvest")!;
    res = run(state, nav, 30, STEP, (s) => s.jobs[harvestJob.id]?.state === "completed");
    state = res.state;
    expect(state.cultivationPlots[plotId]!.state).toBe("harvested");
    const harvestLots = Object.values(state.resourceLots).filter((l): l is ResourceLot => l.family === "fresh_food");
    expect(harvestLots.length).toBeGreaterThan(0);
    expect(harvestLots[0]!.quantity).toBeGreaterThan(0);
    expect(harvestLots[0]!.location).toEqual({ kind: "field_edge", parcelId });
    expect(violations(state)).toEqual([]);

    const reparsed = parseSimulationStateV2(JSON.parse(JSON.stringify(state)));
    expect(reparsed.success).toBe(true);
  });

  it("un cultivo descuidado durante toda su ventana de cuidado se pierde (abandono) y la parcela vuelve a `unprepared`", () => {
    const w = world();
    const polygon = [{ x: 10, y: -30 }, { x: 20, y: -30 }, { x: 20, y: -20 }, { x: 10, y: -20 }];
    let state = w.state;
    let nav = buildFullNavigationIndexV2(state.world);
    state = designate(state, nav, "prepare_soil", polygon);
    const parcelId = Object.keys(state.world.parcels)[0]!;
    const plotId = state.world.parcels[parcelId]!.cultivationPlotId!;
    let job = Object.values(state.jobs).find((j) => j.actionKey === "prepare_soil")!;
    let res = run(state, nav, 30, STEP, (s) => s.jobs[job.id]?.state === "completed");
    state = res.state;
    nav = res.nav;

    state = seedAndTool(state, parcelId);
    // Consume el agua del borde para que no quede disponible para futuros cuidados (abandono deliberado del cultivo).
    state = { ...state, resourceLots: { ...state.resourceLots, "lot-water": { ...state.resourceLots["lot-water"]!, quantity: 0 } } };
    state = order(state, nav, { personId: w.p1, actionKey: "sow", target: { kind: "cultivation_plot", cultivationPlotId: plotId }, cropId: "test_fast_vegetables" });
    job = Object.values(state.jobs).find((j) => j.actionKey === "sow")!;
    res = run(state, nav, 30, STEP, (s) => s.jobs[job.id]?.state === "completed");
    state = res.state;
    nav = res.nav;

    const fast = applyCommandV2(state, { commandId: "fast", type: "set_speed", speed: 10 }, nav).state;
    res = run(fast, nav, 400, STEP, (s) => s.cultivationPlots[plotId]?.state === "unprepared");
    expect(res.state.cultivationPlots[plotId]!.state).toBe("unprepared");
    expect(res.state.cultivationPlots[plotId]!.activeCropCycleId).toBeNull();
  });
});
