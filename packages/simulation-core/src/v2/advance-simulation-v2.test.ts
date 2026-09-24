import { describe, expect, it } from "vitest";
import { applyCommandV2 } from "./apply-command-v2.js";
import { advanceSimulationV2 } from "./advance-simulation-v2.js";
import { buildFullNavigationIndexV2 } from "./room-graph.js";
import { makeSyntheticBuildingState, TEST_HOUSE_IDS } from "./test-fixtures.js";

function setupMovingPerson(seed: string, destination: { x: number; y: number }) {
  const initial = makeSyntheticBuildingState(seed);
  const nav = buildFullNavigationIndexV2(initial.world);
  const personId = initial.peopleOrder[0]!;
  const { state: paused } = applyCommandV2(initial, { commandId: "cmd-a", type: "set_pause", paused: false }, nav);
  const { state: moving } = applyCommandV2(paused, { commandId: "cmd-b", type: "order_direct_move", personId, destination }, nav);
  return { state: moving, nav, personId };
}

describe("advanceSimulationV2", () => {
  it("no avanza nada si sim seconds a avanzar es 0", () => {
    const { state, nav } = setupMovingPerson("adv-v2-seed-1", { x: -25, y: -10 });
    const paused = { ...state, clock: { ...state.clock, speed: 0 as const } };
    const { state: next, events } = advanceSimulationV2(paused, 5, nav);
    expect(events).toEqual([]);
    expect(next.clock.elapsedSimSeconds).toBe(paused.clock.elapsedSimSeconds);
  });

  it("avanza la posición de la persona a lo largo de la ruta y mantiene `location` sincronizado con `position`", () => {
    const { state, nav, personId } = setupMovingPerson("adv-v2-seed-2", { x: -25, y: -10 });
    const { state: next } = advanceSimulationV2(state, 0.05, nav);
    const person = next.people[personId]!;
    expect(person.location).toEqual({ kind: "world_point", point: person.public.position });
    expect(person.public.activeMovementOrder!.travelledDistanceMeters).toBeGreaterThan(0);
  });

  it("completa la orden al llegar y emite movement_completed", () => {
    const { state, nav, personId } = setupMovingPerson("adv-v2-seed-3", { x: -5, y: 0 });
    let current = state;
    let completed = false;
    for (let i = 0; i < 60 && !completed; i++) {
      const result = advanceSimulationV2(current, 1, nav);
      current = result.state;
      if (result.events.some((e) => e.type === "movement_completed")) completed = true;
    }
    expect(completed).toBe(true);
    expect(current.people[personId]!.public.activeMovementOrder).toBeNull();
    expect(current.people[personId]!.public.operationalState).toBe("arrival_completed");
  });

  it("al entrar a una estancia emite room_entered y sincroniza `location` con la estancia, no con un punto exterior", () => {
    const { state, nav, personId } = setupMovingPerson("adv-v2-seed-4", { x: 18, y: 0 });
    let current = state;
    let enteredRoomId: string | null = null;
    for (let i = 0; i < 60 && !enteredRoomId; i++) {
      const result = advanceSimulationV2(current, 1, nav);
      current = result.state;
      const entered = result.events.find((e) => e.type === "room_entered");
      if (entered && entered.type === "room_entered") enteredRoomId = entered.roomId;
    }
    expect(enteredRoomId).toBe(TEST_HOUSE_IDS.bedroomRoomId);
    expect(current.people[personId]!.location).toEqual({ kind: "room", roomId: TEST_HOUSE_IDS.bedroomRoomId });
  });

  it("una persona dentro de una estancia no actúa como observadora de niebla exterior", () => {
    const { state, nav } = setupMovingPerson("adv-v2-seed-5", { x: 18, y: 0 });
    let current = state;
    for (let i = 0; i < 60; i++) {
      current = advanceSimulationV2(current, 1, nav).state;
    }
    expect(current.people[current.peopleOrder[0]!]!.location.kind).toBe("room");

    const farAwayCellIndex = 0;
    expect(current.fog.cells[farAwayCellIndex]).not.toBe(2);
  });

  it("es determinista: la misma secuencia de avances produce el mismo estado", () => {
    const a = setupMovingPerson("adv-v2-seed-6", { x: -25, y: -10 });
    const b = setupMovingPerson("adv-v2-seed-6", { x: -25, y: -10 });
    const resultA = advanceSimulationV2(a.state, 3, a.nav);
    const resultB = advanceSimulationV2(b.state, 3, b.nav);
    expect(resultA.state).toEqual(resultB.state);
  });
});

describe("advanceSimulationV2 — redondeo persistible del movimiento (S7)", () => {
  it("con pasos muy pequeños llega siempre al destino (el redondeo a 6 decimales nunca deja el recorrido a punto de terminar)", () => {
    // Distancia irracional (√(17²+13²)) y pasos de una fracción de segundo real.
    const { state, nav, personId } = setupMovingPerson("adv-v2-seed-round", { x: -17.123457, y: 13.654321 });
    let current = state;
    for (let i = 0; i < 4000 && current.people[personId]!.public.activeMovementOrder; i++) {
      current = advanceSimulationV2(current, 0.03, nav).state;
    }
    const person = current.people[personId]!;
    expect(person.public.activeMovementOrder).toBeNull();
    expect(Math.round(person.public.position.x * 1_000_000) / 1_000_000).toBe(person.public.position.x);
  });
});
