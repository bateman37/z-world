import { describe, expect, it } from "vitest";
import { buildWalkabilityGridV2, isCellWalkableV2, nearestWalkableCellV2, worldToCellV2 } from "./navigation-v2.js";
import { makeSyntheticBuildingState } from "./test-fixtures.js";

describe("buildWalkabilityGridV2", () => {
  it("marca transitable el terreno abierto y bloquea la huella del edificio", () => {
    const state = makeSyntheticBuildingState("nav-v2-seed-1");
    const grid = buildWalkabilityGridV2(state.world);

    const openGroundCell = worldToCellV2(grid, { x: -30, y: -30 })!;
    expect(isCellWalkableV2(grid, openGroundCell.col, openGroundCell.row)).toBe(true);

    const insideBuildingCell = worldToCellV2(grid, { x: 15, y: 0 })!;
    expect(isCellWalkableV2(grid, insideBuildingCell.col, insideBuildingCell.row)).toBe(false);
  });

  it("bloquea un curso de agua y da coste reducido a una carretera", () => {
    const state = makeSyntheticBuildingState("nav-v2-seed-2");
    const worldWithLines = {
      ...state.world,
      linearFeatures: {
        road: { id: "road", kind: "road" as const, polyline: [{ x: -40, y: 20 }, { x: 40, y: 20 }], widthMeters: 12, wayState: "transitable" as const, placeId: null },
        river: { id: "river", kind: "watercourse" as const, polyline: [{ x: -40, y: -20 }, { x: 40, y: -20 }], widthMeters: 12, wayState: null, placeId: null },
      },
    };
    const grid = buildWalkabilityGridV2(worldWithLines);

    const onRoad = worldToCellV2(grid, { x: 0, y: 20 })!;
    expect(isCellWalkableV2(grid, onRoad.col, onRoad.row)).toBe(true);
    expect(grid.costMultiplier[onRoad.row * grid.columns + onRoad.col]).toBeLessThan(1);

    const onRiver = worldToCellV2(grid, { x: 0, y: -20 })!;
    expect(isCellWalkableV2(grid, onRiver.col, onRiver.row)).toBe(false);
  });

  it("mantiene un tamaño de rejilla acotado y razonable para un mundo de ~9 km²", () => {
    const state = makeSyntheticBuildingState("nav-v2-seed-3");
    const bigWorld = { ...state.world, bounds: { minX: -1500, minY: -1500, maxX: 1500, maxY: 1500 } };
    const start = performance.now();
    const grid = buildWalkabilityGridV2(bigWorld);
    const elapsedMs = performance.now() - start;

    expect(grid.columns).toBe(600);
    expect(grid.rows).toBe(600);
    expect(elapsedMs).toBeLessThan(5000);
  });
});

describe("nearestWalkableCellV2", () => {
  it("encuentra una celda transitable cercana a un punto dentro de un edificio", () => {
    const state = makeSyntheticBuildingState("nav-v2-seed-4");
    const grid = buildWalkabilityGridV2(state.world);
    const cell = nearestWalkableCellV2(grid, { x: 15, y: 0 });
    expect(cell).not.toBeNull();
    if (cell) expect(isCellWalkableV2(grid, cell.col, cell.row)).toBe(true);
  });
});
