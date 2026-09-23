import { describe, expect, it } from "vitest";
import { buildWalkabilityGridV2 } from "./navigation-v2.js";
import { buildNavigationIndexV2, findRoomContainingPoint } from "./room-graph.js";
import { findGridPathV2, findPathV2, resolveNavAnchor } from "./pathfinding-v2.js";
import { makeSyntheticBuildingState, TEST_HOUSE_IDS } from "./test-fixtures.js";

function buildNav(seed: string) {
  const state = makeSyntheticBuildingState(seed);
  const grid = buildWalkabilityGridV2(state.world);
  const nav = buildNavigationIndexV2(state.world, grid);
  return { state, grid, nav };
}

describe("findGridPathV2", () => {
  it("encuentra una ruta directa entre dos puntos exteriores transitables", () => {
    const { grid } = buildNav("path-v2-seed-1");
    const path = findGridPathV2(grid, { x: -20, y: 0 }, { x: -10, y: 0 });
    expect(path).not.toBeNull();
    expect(path![0]).toBeDefined();
    expect(path![path!.length - 1]).toBeDefined();
  });

  it("devuelve null si el destino cae dentro de la huella de un edificio (no transitable)", () => {
    const { grid } = buildNav("path-v2-seed-2");
    const path = findGridPathV2(grid, { x: -20, y: 0 }, { x: 15, y: 0 });
    expect(path).toBeNull();
  });
});

describe("findRoomContainingPoint / resolveNavAnchor", () => {
  it("reconoce un punto dentro del pasillo como perteneciente a esa estancia", () => {
    const { state, nav } = buildNav("path-v2-seed-3");
    const roomId = findRoomContainingPoint(nav, state.world, { x: 12, y: 0 });
    expect(roomId).toBe(TEST_HOUSE_IDS.hallwayRoomId);
  });

  it("resuelve un punto exterior como ancla exterior", () => {
    const { state, nav } = buildNav("path-v2-seed-4");
    const anchor = resolveNavAnchor(nav, state.world, { x: -30, y: -30 });
    expect(anchor.kind).toBe("exterior");
  });
});

describe("findPathV2 (híbrido exterior/interior)", () => {
  it("traza una ruta de exterior a una estancia, cruzando la puerta exterior y la interior", () => {
    const { state, nav } = buildNav("path-v2-seed-5");
    const start = resolveNavAnchor(nav, state.world, { x: -20, y: 0 });
    const goal = resolveNavAnchor(nav, state.world, { x: 18, y: 0 }); // dentro del dormitorio
    expect(goal.kind).toBe("room");

    const result = findPathV2(nav, state.world, start, goal);
    expect(result).not.toBeNull();
    expect(result!.waypoints.length).toBeGreaterThan(1);
    expect(result!.totalDistanceMeters).toBeGreaterThan(0);

    const lastCheckpoint = result!.locationCheckpoints[result!.locationCheckpoints.length - 1]!;
    expect(lastCheckpoint.location).toEqual({ kind: "room", roomId: TEST_HOUSE_IDS.bedroomRoomId });
  });

  it("traza una ruta entre dos estancias del mismo edificio sin tocar la rejilla exterior", () => {
    const { state, nav } = buildNav("path-v2-seed-6");
    const start = { kind: "room" as const, roomId: TEST_HOUSE_IDS.hallwayRoomId, point: { x: 12, y: 0 } };
    const goal = { kind: "room" as const, roomId: TEST_HOUSE_IDS.bedroomRoomId, point: { x: 18, y: 0 } };
    const result = findPathV2(nav, state.world, start, goal);
    expect(result).not.toBeNull();
    expect(result!.locationCheckpoints.every((c) => c.location.kind === "room")).toBe(true);
  });

  it("traza una ruta de una estancia hacia el exterior (salir por una conexión válida)", () => {
    const { state, nav } = buildNav("path-v2-seed-7");
    const start = { kind: "room" as const, roomId: TEST_HOUSE_IDS.bedroomRoomId, point: { x: 18, y: 0 } };
    const goal = resolveNavAnchor(nav, state.world, { x: -25, y: 0 });
    const result = findPathV2(nav, state.world, start, goal);
    expect(result).not.toBeNull();
    const lastCheckpoint = result!.locationCheckpoints[result!.locationCheckpoints.length - 1]!;
    expect(lastCheckpoint.location).toEqual({ kind: "exterior" });
  });

  it("es determinista: la misma entrada produce siempre la misma ruta", () => {
    const { state, nav } = buildNav("path-v2-seed-8");
    const start = resolveNavAnchor(nav, state.world, { x: -20, y: 0 });
    const goal = resolveNavAnchor(nav, state.world, { x: 18, y: 0 });
    const a = findPathV2(nav, state.world, start, goal);
    const b = findPathV2(nav, state.world, start, goal);
    expect(a).toEqual(b);
  });
});
