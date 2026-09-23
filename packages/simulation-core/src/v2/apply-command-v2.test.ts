import { describe, expect, it } from "vitest";
import type { PriorityId } from "@z-world/contracts";
import { applyCommandV2 } from "./apply-command-v2.js";
import { buildFullNavigationIndexV2 } from "./room-graph.js";
import { makeSyntheticBuildingState, TEST_HOUSE_IDS } from "./test-fixtures.js";

function setup(seed: string) {
  const state = makeSyntheticBuildingState(seed);
  const nav = buildFullNavigationIndexV2(state.world);
  const personId = state.peopleOrder[0]!;
  return { state, nav, personId };
}

describe("applyCommandV2 — order_direct_move", () => {
  it("acepta una orden de movimiento exterior válida y calcula una ruta real", () => {
    const { state, nav, personId } = setup("cmd-v2-seed-1");
    const { state: next, events } = applyCommandV2(state, { commandId: "cmd-1", type: "order_direct_move", personId, destination: { x: -25, y: -10 } }, nav);

    expect(events.map((e) => e.type)).toEqual(["move_order_accepted", "movement_started"]);
    const order = next.people[personId]!.public.activeMovementOrder;
    expect(order).not.toBeNull();
    expect(order!.path.length).toBeGreaterThan(0);
    expect(next.people[personId]!.public.operationalState).toBe("moving");
  });

  it("acepta una orden hacia el interior de una estancia conocida y planifica el cruce de aberturas", () => {
    const { state, nav, personId } = setup("cmd-v2-seed-2");
    const { state: next, events } = applyCommandV2(state, { commandId: "cmd-2", type: "order_direct_move", personId, destination: { x: 18, y: 0 } }, nav);

    expect(events.some((e) => e.type === "move_order_rejected")).toBe(false);
    const order = next.people[personId]!.public.activeMovementOrder;
    expect(order?.locationCheckpoints?.some((c) => c.location.kind === "room" && c.location.roomId === TEST_HOUSE_IDS.bedroomRoomId)).toBe(true);
  });

  it("rechaza un destino fuera de los límites del mundo", () => {
    const { state, nav, personId } = setup("cmd-v2-seed-3");
    const { events } = applyCommandV2(state, { commandId: "cmd-3", type: "order_direct_move", personId, destination: { x: 10000, y: 10000 } }, nav);
    expect(events[0]).toMatchObject({ type: "move_order_rejected", code: "destination_outside_world" });
  });

  it("rechaza un destino oculto por la niebla", () => {
    const { state, nav, personId } = setup("cmd-v2-seed-4");
    const hiddenState = { ...state, fog: { ...state.fog, cells: state.fog.cells.map(() => 0) } };
    const { events } = applyCommandV2(hiddenState, { commandId: "cmd-4", type: "order_direct_move", personId, destination: { x: -25, y: -10 } }, nav);
    expect(events[0]).toMatchObject({ type: "move_order_rejected", code: "destination_hidden" });
  });

  it("rechaza una segunda orden mientras la primera sigue activa", () => {
    const { state, nav, personId } = setup("cmd-v2-seed-5");
    const { state: afterFirst } = applyCommandV2(state, { commandId: "cmd-5a", type: "order_direct_move", personId, destination: { x: -25, y: -10 } }, nav);
    const { events } = applyCommandV2(afterFirst, { commandId: "cmd-5b", type: "order_direct_move", personId, destination: { x: -30, y: -30 } }, nav);
    expect(events[0]).toMatchObject({ type: "move_order_rejected", code: "person_already_ordered" });
  });

  it("rechaza un destino sin ruta transitable conocida (rodeado de obstáculo)", () => {
    const { state, personId } = setup("cmd-v2-seed-6");
    const obstacleWorld = {
      ...state.world,
      terrainAreas: {
        ...state.world.terrainAreas,
        wall: {
          id: "wall",
          kind: "obstacle" as const,
          polygon: [{ x: -35, y: -60 }, { x: -25, y: -60 }, { x: -25, y: 60 }, { x: -35, y: 60 }],
          transitable: false,
          traversalCostMultiplier: 1,
          placeId: null,
        },
      },
    };
    const enclosedState = { ...state, world: obstacleWorld };
    const enclosedNav = buildFullNavigationIndexV2(obstacleWorld);
    const { events } = applyCommandV2(enclosedState, { commandId: "cmd-6", type: "order_direct_move", personId, destination: { x: -40, y: 0 } }, enclosedNav);
    expect(events[0]).toMatchObject({ type: "move_order_rejected", code: "no_known_route" });
  });
});

describe("applyCommandV2 — otros comandos", () => {
  it("cancel_direct_order limpia la orden activa y emite movement_cancelled", () => {
    const { state, nav, personId } = setup("cmd-v2-seed-7");
    const { state: moving } = applyCommandV2(state, { commandId: "cmd-7a", type: "order_direct_move", personId, destination: { x: -25, y: -10 } }, nav);
    const { state: cancelled, events } = applyCommandV2(moving, { commandId: "cmd-7b", type: "cancel_direct_order", personId }, nav);
    expect(events).toEqual([expect.objectContaining({ type: "movement_cancelled" })]);
    expect(cancelled.people[personId]!.public.activeMovementOrder).toBeNull();
  });

  it("set_pause y set_speed modifican el reloj y emiten speed_or_pause_changed", () => {
    const { state, nav } = setup("cmd-v2-seed-8");
    const { state: paused, events: pauseEvents } = applyCommandV2(state, { commandId: "cmd-8a", type: "set_pause", paused: false }, nav);
    expect(pauseEvents[0]).toMatchObject({ type: "speed_or_pause_changed", speed: 1 });
    const { state: fast, events: speedEvents } = applyCommandV2(paused, { commandId: "cmd-8b", type: "set_speed", speed: 4 }, nav);
    expect(speedEvents[0]).toMatchObject({ type: "speed_or_pause_changed", speed: 4 });
    expect(fast.clock.speed).toBe(4);
  });

  it("update_priority conserva la edición ya existente de prioridades", () => {
    const { state, nav, personId } = setup("cmd-v2-seed-9");
    const priorityId = Object.keys(state.people[personId]!.public.priorities)[0]! as PriorityId;
    const { state: next, events } = applyCommandV2(state, { commandId: "cmd-9", type: "update_priority", personId, priorityId, value: 5 }, nav);
    expect(events[0]).toMatchObject({ type: "priority_changed", priorityId, value: 5 });
    expect(next.people[personId]!.public.priorities[priorityId]).toBe(5);
  });
});
