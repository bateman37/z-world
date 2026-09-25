import { describe, it, expect } from "vitest";
import {
  createInitialStateV2,
  buildFullNavigationIndexV2,
  applyCommandV2,
  advanceSimulationV2,
  type NavigationIndexV2,
} from "@z-world/simulation-core";
import type { SimulationCommand, SimulationStateV2 } from "@z-world/contracts";
import { structuralProjectionsV2Schema, tickProjectionsV2Schema } from "@z-world/contracts";
import { buildWorkerProjectionsV2, splitWorkerProjectionsV2 } from "./build-projections-v2.js";

/**
 * Harness de rendimiento exigido por S11 (§9 del encargo de cierre):
 * mide, sobre un escenario real generado (nunca sintético ni recortado a
 * propósito), el coste de las operaciones que el runtime jugable repite
 * en cada tick/comando — construir proyecciones, validarlas con Zod y
 * aplicar un comando — para tener una referencia documentada de
 * rendimiento, no una promesa de garantía. Se ejecuta una sola vez
 * (`npx vitest run packages/application/src/s11-performance-harness.test.ts`)
 * y sus resultados reales quedan transcritos en `docs/STATUS.md` §
 * «S11 — harness de rendimiento», nunca inventados.
 *
 * Escenario: un pueblo semántico completo (S2) de la semilla fija
 * "s11-perf-harness-seed-1", con la niebla totalmente descubierta (peor
 * caso realista de tamaño de proyección: una partida larga sin fronteras
 * de conocimiento que oculten nada) y una carga de trabajos, zonas y
 * designaciones añadida encima para acercarse a un pueblo activo, no a
 * un mundo recién generado y vacío de trabajos.
 */
describe("S11 — harness de rendimiento (§9)", () => {
  it("construye un escenario cargado y mide proyección/validación/aplicación", () => {
    const seed = "s11-perf-harness-seed-1";
    let state: SimulationStateV2 = createInitialStateV2(seed);
    const nav: NavigationIndexV2 = buildFullNavigationIndexV2(state.world);

    // Peor caso de tamaño de proyección: toda la niebla descubierta (una partida larga real).
    state = { ...state, fog: { ...state.fog, cells: state.fog.cells.map(() => 2) } };

    // Carga representativa de un pueblo activo: varias zonas, una designación y algunas
    // órdenes directas, además de dejar correr el bucle causal real (necesidades, trabajos
    // autónomos) durante un tramo simulado con tráfico de tick_projections real.
    let commandSeq = 0;
    function apply(commandWithoutId: (id: string) => SimulationCommand): void {
      commandSeq += 1;
      const result = applyCommandV2(state, commandWithoutId(`perf-cmd-${commandSeq}`), nav);
      state = result.state;
    }
    apply((commandId) => ({ type: "set_pause", paused: false, commandId }));
    apply((commandId) => ({ type: "draw_zone", zoneId: "perf-zone-1", polygon: [{ x: -20, y: -20 }, { x: 20, y: -20 }, { x: 20, y: 20 }, { x: -20, y: 20 }], policy: "habitual", commandId }));
    apply((commandId) => ({ type: "draw_zone", zoneId: "perf-zone-2", polygon: [{ x: 30, y: 30 }, { x: 60, y: 30 }, { x: 60, y: 60 }, { x: 30, y: 60 }], policy: "precaution", commandId }));
    apply((commandId) => ({ type: "create_area_designation", designationId: "perf-designation-1", kind: "systematic_recon", polygon: [{ x: -50, y: -50 }, { x: 50, y: -50 }, { x: 50, y: 50 }, { x: -50, y: 50 }], commandId }));
    for (const personId of state.peopleOrder) {
      apply((commandId) => ({ type: "order_direct_move", personId, destination: { x: (Math.random() - 0.5) * 40, y: (Math.random() - 0.5) * 40 }, commandId }));
    }

    // ~2 horas simuladas (240 ticks de 30 s) de bucle causal real: movimiento, necesidades,
    // trabajos autónomos y reservas se acumulan como en una partida jugada de verdad.
    let currentNav = nav;
    const tickApplyDurationsMs: number[] = [];
    for (let i = 0; i < 240; i++) {
      const t0 = performance.now();
      const result = advanceSimulationV2(state, 30, currentNav);
      tickApplyDurationsMs.push(performance.now() - t0);
      state = result.state;
      currentNav = result.nav;
    }

    // --- Tamaño y volumen del escenario ---
    const stateJson = JSON.stringify(state);
    const entityCounts = {
      people: state.peopleOrder.length,
      jobs: Object.keys(state.jobs).length,
      zones: Object.keys(state.workZones).length,
      designations: Object.keys(state.designations).length,
      worldObjects: Object.keys(state.worldObjects).length,
      resourceLots: Object.keys(state.resourceLots).length,
      furniture: Object.keys(state.furniture).length,
      containers: Object.keys(state.containers).length,
      transportMeans: Object.keys(state.transportMeans).length,
      places: Object.keys(state.world.places).length,
      buildings: Object.keys(state.world.buildings).length,
      rooms: Object.keys(state.world.rooms).length,
      openings: Object.keys(state.world.openings).length,
      anchors: Object.keys(state.world.anchors).length,
      barrierSegments: Object.keys(state.world.barrierSegments).length,
      cultivationPlots: Object.keys(state.cultivationPlots).length,
      reservations: Object.keys(state.reservations).length,
      domainEventSequence: state.sequences.nextDomainEventSequence,
    };

    // --- Coste de proyección (construir + partir en canales) ---
    const projectionDurationsMs: number[] = [];
    let fullProjections = buildWorkerProjectionsV2({ state, gameSaveId: "perf-harness", revision: 1, saveStatus: "saved", lastSavedSimSeconds: state.clock.elapsedSimSeconds, operationalLog: [] });
    for (let i = 0; i < 20; i++) {
      const t0 = performance.now();
      fullProjections = buildWorkerProjectionsV2({ state, gameSaveId: "perf-harness", revision: 1, saveStatus: "saved", lastSavedSimSeconds: state.clock.elapsedSimSeconds, operationalLog: [] });
      projectionDurationsMs.push(performance.now() - t0);
    }
    const { structural, tick } = splitWorkerProjectionsV2(fullProjections);
    const structuralJson = JSON.stringify(structural);
    const tickJson = JSON.stringify(tick);

    // --- Coste de validación Zod de los dos canales reales del protocolo ---
    const structuralValidationDurationsMs: number[] = [];
    const tickValidationDurationsMs: number[] = [];
    for (let i = 0; i < 20; i++) {
      const t0 = performance.now();
      structuralProjectionsV2Schema.parse(structural);
      structuralValidationDurationsMs.push(performance.now() - t0);
      const t1 = performance.now();
      tickProjectionsV2Schema.parse(tick);
      tickValidationDurationsMs.push(performance.now() - t1);
    }

    // --- Coste de aplicación de un comando representativo (orden directa) ---
    const applyDurationsMs: number[] = [];
    for (let i = 0; i < 20; i++) {
      const personId = state.peopleOrder[i % state.peopleOrder.length]!;
      const t0 = performance.now();
      applyCommandV2(state, { commandId: `perf-apply-${i}`, type: "order_direct_move", personId, destination: { x: (Math.random() - 0.5) * 30, y: (Math.random() - 0.5) * 30 } }, currentNav);
      applyDurationsMs.push(performance.now() - t0);
    }

    function stats(values: readonly number[]): { readonly avg: number; readonly max: number; readonly p95: number } {
      const sorted = [...values].sort((a, b) => a - b);
      const avg = sorted.reduce((a, b) => a + b, 0) / sorted.length;
      const p95 = sorted[Math.floor(sorted.length * 0.95)] ?? sorted[sorted.length - 1]!;
      return { avg: Number(avg.toFixed(3)), max: Number(sorted[sorted.length - 1]!.toFixed(3)), p95: Number(p95.toFixed(3)) };
    }

    const report = {
      scenario: {
        seed,
        simulatedSecondsAdvanced: 240 * 30,
        fogFullyDiscovered: true,
        commandsApplied: commandSeq,
      },
      entityCounts,
      stateSizeBytes: {
        fullInternalStateJson: stateJson.length,
        structuralProjectionJson: structuralJson.length,
        tickProjectionJson: tickJson.length,
      },
      messageFrequencyPolicy: {
        tickChannel: "cada tick real y tras cada comando aplicado (sin límite de cadencia propio)",
        structuralChannel: "como máximo cada STRUCTURAL_CADENCE_REAL_MS=1000ms de tiempo real, o al forzarse (load_state/resync/cambio estructural), ver worker-session-v2.ts",
      },
      projectionBuildMs: stats(projectionDurationsMs),
      structuralValidationMs: stats(structuralValidationDurationsMs),
      tickValidationMs: stats(tickValidationDurationsMs),
      commandApplyMs: stats(applyDurationsMs),
      simulationTickAdvanceMs: stats(tickApplyDurationsMs),
    };

    // eslint-disable-next-line no-console
    console.log("S11_PERFORMANCE_HARNESS_REPORT", JSON.stringify(report, null, 2));

    // Umbrales provisionales de humo (S11 §9): solo detectan una regresión
    // grave (10-100×), no certifican un límite de producción definitivo.
    // Ver `docs/STATUS.md` para los valores reales medidos y su lectura.
    expect(report.projectionBuildMs.p95).toBeLessThan(200);
    expect(report.structuralValidationMs.p95).toBeLessThan(100);
    expect(report.tickValidationMs.p95).toBeLessThan(100);
    expect(report.commandApplyMs.p95).toBeLessThan(200);
  });
});
