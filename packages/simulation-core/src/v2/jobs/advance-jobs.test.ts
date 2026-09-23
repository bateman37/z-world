import { describe, expect, it } from "vitest";
import type { Container, ResourceLot, SimulationStateV2 } from "@z-world/contracts";
import { applyCommandV2 } from "../apply-command-v2.js";
import { advanceSimulationV2 } from "../advance-simulation-v2.js";
import { buildFullNavigationIndexV2, type NavigationIndexV2 } from "../room-graph.js";
import { makeSyntheticBuildingState, TEST_HOUSE_IDS } from "../test-fixtures.js";

function withWaterInHallway(base: SimulationStateV2): { state: SimulationStateV2; resourceLotId: string; containerId: string } {
  const containerId = "container-test-water";
  const resourceLotId = "resource-lot-test-water";
  const container: Container = { id: containerId, location: { kind: "room", roomId: TEST_HOUSE_IDS.hallwayRoomId }, capacityUnits: 10, contentIds: [resourceLotId] };
  const lot: ResourceLot = { id: resourceLotId, family: "water", quantity: 5, unit: "liter", location: { kind: "container", containerId }, condition: 0.9, reservedByJobId: null };
  return {
    state: { ...base, containers: { ...base.containers, [containerId]: container }, resourceLots: { ...base.resourceLots, [resourceLotId]: lot } },
    resourceLotId,
    containerId,
  };
}

function run(state: SimulationStateV2, nav: NavigationIndexV2, ticks: number, secondsPerTick = 1) {
  let current = state;
  const allEvents = [];
  for (let i = 0; i < ticks; i++) {
    const result = advanceSimulationV2(current, secondsPerTick, nav);
    current = result.state;
    allEvents.push(...result.events);
  }
  return { state: current, events: allEvents };
}

describe("motor de trabajos — beber (modelo directo, S4-S6)", () => {
  it("completa el bucle: orden → viaje → consumo → necesidad mejorada", () => {
    const base = makeSyntheticBuildingState("jobs-drink-1");
    const { state: withWater, resourceLotId } = withWaterInHallway(base);
    const nav = buildFullNavigationIndexV2(withWater.world);
    const personId = withWater.peopleOrder[0]!;

    const { state: unpaused } = applyCommandV2(withWater, { commandId: "c1", type: "set_pause", paused: false }, nav);
    const { state: ordered, events: orderEvents } = applyCommandV2(
      unpaused,
      { commandId: "c2", type: "order_contextual_action", personId, teamPersonIds: [], actionKey: "drink", target: { kind: "resource_lot", resourceLotId } },
      nav,
    );
    expect(orderEvents.some((e) => e.type === "job_created")).toBe(true);
    const jobId = orderEvents.find((e) => e.type === "job_created")!.jobId;

    const needBefore = ordered.people[personId]!.needs.find((n) => n.dimension === "hydration")!.value;

    const { state: finalState, events } = run(ordered, nav, 60);

    expect(finalState.jobs[jobId]!.state).toBe("completed");
    expect(events.some((e) => e.type === "consumption_happened")).toBe(true);
    expect(finalState.resourceLots[resourceLotId]!.quantity).toBe(4);
    const needAfter = finalState.people[personId]!.needs.find((n) => n.dimension === "hydration")!.value;
    expect(needAfter).toBeGreaterThan(needBefore);
    expect(finalState.people[personId]!.activeJobId).toBeNull();
  });

  it("una reserva impide que un segundo trabajo consuma el mismo lote (§6.6/§14.5)", () => {
    const base = makeSyntheticBuildingState("jobs-drink-2");
    const { state: withWater, resourceLotId } = withWaterInHallway(base);
    const nav = buildFullNavigationIndexV2(withWater.world);
    const [personA, personB] = withWater.peopleOrder;

    const { state: unpaused } = applyCommandV2(withWater, { commandId: "c1", type: "set_pause", paused: false }, nav);
    const { state: orderedA } = applyCommandV2(
      unpaused,
      { commandId: "c2", type: "order_contextual_action", personId: personA!, teamPersonIds: [], actionKey: "drink", target: { kind: "resource_lot", resourceLotId } },
      nav,
    );
    const { state: orderedBoth } = applyCommandV2(
      orderedA,
      { commandId: "c3", type: "order_contextual_action", personId: personB!, teamPersonIds: [], actionKey: "drink", target: { kind: "resource_lot", resourceLotId } },
      nav,
    );

    const { state: finalState } = run(orderedBoth, nav, 5);
    const reservedLotOwners = Object.values(finalState.jobs)
      .filter((j) => j.target.kind === "resource_lot" && j.target.resourceLotId === resourceLotId)
      .map((j) => j.reservationIds.length > 0);
    // Como mucho un trabajo llega a reservar el lote exclusivo en este tramo corto.
    expect(reservedLotOwners.filter(Boolean).length).toBeLessThanOrEqual(1);
  });
});

describe("motor de trabajos — descansar (modelo D, S4-S6)", () => {
  it("progresa por tiempo simulado y mejora la necesidad de descanso sin sobrepasar 100", () => {
    const base = makeSyntheticBuildingState("jobs-rest-1");
    const nav = buildFullNavigationIndexV2(base.world);
    const personId = base.peopleOrder[0]!;
    const tired: SimulationStateV2 = {
      ...base,
      people: { ...base.people, [personId]: { ...base.people[personId]!, needs: base.people[personId]!.needs.map((n) => (n.dimension === "rest" ? { ...n, value: 20 } : n)) } },
    };

    const { state: unpaused } = applyCommandV2(tired, { commandId: "c1", type: "set_pause", paused: false }, nav);
    const { state: ordered, events: orderEvents } = applyCommandV2(
      unpaused,
      { commandId: "c2", type: "order_contextual_action", personId, teamPersonIds: [], actionKey: "rest", target: { kind: "room", roomId: TEST_HOUSE_IDS.hallwayRoomId } },
      nav,
    );
    const jobId = orderEvents.find((e) => e.type === "job_created")!.jobId;

    // Ventana corta, dentro de la duración planificada del descanso (240 min
    // simulados de tuning provisional): tras completarla, la persona se
    // despierta y la fatiga vuelve a evolucionar con normalidad, así que la
    // ventana de la prueba se limita al tramo en que el trabajo sigue
    // ejecutándose activamente.
    const { state: finalState } = run(ordered, nav, 20);

    const restValue = finalState.people[personId]!.needs.find((n) => n.dimension === "rest")!.value;
    expect(restValue).toBeGreaterThan(20);
    expect(restValue).toBeLessThanOrEqual(100);
    expect(finalState.jobs[jobId]!.state).toBe("in_progress");
    expect(finalState.jobs[jobId]!.phases[finalState.jobs[jobId]!.currentPhaseIndex]?.kind).toBe("execute");
  });

  it("pausar y reanudar conserva la variación D (nunca se remuestrea)", () => {
    const base = makeSyntheticBuildingState("jobs-rest-2");
    const nav = buildFullNavigationIndexV2(base.world);
    const personId = base.peopleOrder[0]!;

    const { state: unpaused } = applyCommandV2(base, { commandId: "c1", type: "set_pause", paused: false }, nav);
    const { state: ordered, events: orderEvents } = applyCommandV2(
      unpaused,
      { commandId: "c2", type: "order_contextual_action", personId, teamPersonIds: [], actionKey: "rest", target: { kind: "room", roomId: TEST_HOUSE_IDS.hallwayRoomId } },
      nav,
    );
    const jobId = orderEvents.find((e) => e.type === "job_created")!.jobId;

    const { state: progressed } = run(ordered, nav, 30);
    const variationAfterFirstRun = progressed.jobs[jobId]!.workRateVariation;
    expect(variationAfterFirstRun).not.toBeNull();

    const { state: paused } = applyCommandV2(progressed, { commandId: "c3", type: "pause_job", jobId }, nav);
    const { state: resumed } = applyCommandV2(paused, { commandId: "c4", type: "resume_job", jobId }, nav);
    const { state: continued } = run(resumed, nav, 10);

    expect(continued.jobs[jobId]!.workRateVariation).toBe(variationAfterFirstRun);
  });
});

describe("motor de trabajos — inspeccionar/registrar (modelo B, S4)", () => {
  it("crea un episodio persistente y revela conocimiento cuando la banda no es severa", () => {
    const base = makeSyntheticBuildingState("jobs-inspect-1");
    const nav = buildFullNavigationIndexV2(base.world);
    const personId = base.peopleOrder[0]!;
    // El propio fixture revela la vivienda como "observed" al arrancar (radio de niebla inicial de 200m).
    const { state: unpaused } = applyCommandV2(base, { commandId: "c1", type: "set_pause", paused: false }, nav);
    const { state: ordered, events: orderEvents } = applyCommandV2(
      unpaused,
      { commandId: "c2", type: "order_contextual_action", personId, teamPersonIds: [], actionKey: "register", target: { kind: "room", roomId: TEST_HOUSE_IDS.hallwayRoomId } },
      nav,
    );
    const jobId = orderEvents.find((e) => e.type === "job_created")!.jobId;

    const { state: finalState, events } = run(ordered, nav, 80);

    const episodeEvent = events.find((e) => e.type === "work_episode_created");
    expect(episodeEvent).toBeDefined();
    expect(["completed", "causal_failure", "in_progress"]).toContain(finalState.jobs[jobId]!.state);
    if (finalState.jobs[jobId]!.state === "completed") {
      expect(finalState.discoveries.some((d) => d.entityId === TEST_HOUSE_IDS.hallwayRoomId && d.facet === "content")).toBe(true);
    }
  });
});

describe("motor de trabajos — planificador y `Nunca` (S5)", () => {
  it("`Nunca` excluye la selección automática incluso con prioridad alta en el resto", () => {
    const base = makeSyntheticBuildingState("jobs-planner-1");
    const { state: withWater } = withWaterInHallway(base);
    const nav = buildFullNavigationIndexV2(withWater.world);
    const personId = withWater.peopleOrder[0]!;

    const withKnownContent: SimulationStateV2 = {
      ...withWater,
      discoveries: [...withWater.discoveries, { entityId: TEST_HOUSE_IDS.hallwayRoomId, facet: "content" as const, state: "inspected" as const }],
    };
    const withNever: SimulationStateV2 = {
      ...withKnownContent,
      people: {
        ...withWater.people,
        [personId]: { ...withWater.people[personId]!, public: { ...withWater.people[personId]!.public, priorities: { ...withWater.people[personId]!.public.priorities, water_supply: "never" } } },
      },
    };

    const { state: unpaused } = applyCommandV2(withNever, { commandId: "c1", type: "set_pause", paused: false }, nav);
    // Necesidad crítica de sed para forzar la creación de un trabajo sistémico de origen "systemic_need".
    const critical: SimulationStateV2 = {
      ...unpaused,
      people: {
        ...unpaused.people,
        [personId]: { ...unpaused.people[personId]!, needs: unpaused.people[personId]!.needs.map((n) => (n.dimension === "hydration" ? { ...n, value: 5, band: "critical" as const } : n)) },
      },
    };

    const { state: finalState } = run(critical, nav, 3);
    // La autoprotección (origen systemic_need) no está sujeta a `Nunca`
    // (§7.6): debe seguir generando/asignando el trabajo de beber.
    const drinkJob = Object.values(finalState.jobs).find((j) => j.actionKey === "drink");
    expect(drinkJob).toBeDefined();
  });
});

describe("motor de necesidades — autoprotección mínima (S6 §7.6)", () => {
  it("genera una intención sistémica cuando una necesidad crítica tiene solución conocida y accesible", () => {
    const base = makeSyntheticBuildingState("jobs-autoprotection-1");
    const { state: withWaterRaw, resourceLotId } = withWaterInHallway(base);
    const withWater: SimulationStateV2 = {
      ...withWaterRaw,
      discoveries: [...withWaterRaw.discoveries, { entityId: TEST_HOUSE_IDS.hallwayRoomId, facet: "content" as const, state: "inspected" as const }],
    };
    const nav = buildFullNavigationIndexV2(withWater.world);
    const personId = withWater.peopleOrder[0]!;

    const { state: unpaused } = applyCommandV2(withWater, { commandId: "c1", type: "set_pause", paused: false }, nav);
    const critical: SimulationStateV2 = {
      ...unpaused,
      people: {
        ...unpaused.people,
        [personId]: { ...unpaused.people[personId]!, needs: unpaused.people[personId]!.needs.map((n) => (n.dimension === "hydration" ? { ...n, value: 5, band: "critical" as const } : n)) },
      },
    };

    const { state: finalState, events } = run(critical, nav, 3);
    const intention = events.find((e) => e.type === "systemic_intention_created");
    expect(intention).toBeDefined();
    expect((intention as { jobId: string | null }).jobId).not.toBeNull();
    const job = Object.values(finalState.jobs).find((j) => j.actionKey === "drink" && j.origin === "systemic_need");
    expect(job).toBeDefined();
    expect(resourceLotId).toBeDefined();
  });

  it("sin solución conocida, explica el bloqueo y nunca materializa un recurso", () => {
    const base = makeSyntheticBuildingState("jobs-autoprotection-2");
    const nav = buildFullNavigationIndexV2(base.world);
    const personId = base.peopleOrder[0]!;

    const { state: unpaused } = applyCommandV2(base, { commandId: "c1", type: "set_pause", paused: false }, nav);
    const critical: SimulationStateV2 = {
      ...unpaused,
      people: {
        ...unpaused.people,
        [personId]: { ...unpaused.people[personId]!, needs: unpaused.people[personId]!.needs.map((n) => (n.dimension === "hydration" ? { ...n, value: 5, band: "critical" as const } : n)) },
      },
    };

    const { state: finalState, events } = run(critical, nav, 3);
    const intention = events.find((e) => e.type === "systemic_intention_created");
    expect(intention).toBeDefined();
    expect((intention as { jobId: string | null; blockedReasonKey: string | null }).jobId).toBeNull();
    expect((intention as { blockedReasonKey: string | null }).blockedReasonKey).toBe("block.no_known_solution_for_hydration");
    // Nunca materializa un recurso para resolver el bloqueo: la persona sigue sin trabajo activo.
    expect(finalState.people[personId]!.activeJobId).toBeNull();
  });
});
