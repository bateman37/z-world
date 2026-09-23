import { describe, expect, it } from "vitest";
import type { SimulationStateV2 } from "@z-world/contracts";
import { createInitialState } from "../create-initial-state.js";
import { migrateV1ToV2 } from "./migrate-v1-to-v2.js";
import { validateSimulationStateV2Invariants } from "./invariants.js";

function baseState(): SimulationStateV2 {
  const v1 = createInitialState("invariants-base-seed");
  return migrateV1ToV2(v1).state;
}

describe("validateSimulationStateV2Invariants", () => {
  it("no reporta violaciones sobre un estado recién migrado", () => {
    const report = validateSimulationStateV2Invariants(baseState());
    expect(report.ok).toBe(true);
  });

  it("detecta cantidades negativas en lotes de recursos", () => {
    const state = baseState();
    const withBadLot: SimulationStateV2 = {
      ...state,
      resourceLots: {
        ...state.resourceLots,
        "lot-1": {
          id: "lot-1",
          family: "wood_and_planks",
          quantity: -5,
          unit: "kilogram",
          location: { kind: "world_point", point: { x: 0, y: 0 } },
          condition: 1,
          reservedByJobId: null,
        },
      },
    };
    const report = validateSimulationStateV2Invariants(withBadLot);
    expect(report.ok).toBe(false);
    expect(report.violations.some((v) => v.code === "negative_quantity")).toBe(true);
  });

  it("detecta contención circular entre contenedores", () => {
    const state = baseState();
    const withCycle: SimulationStateV2 = {
      ...state,
      containers: {
        ...state.containers,
        "container-a": {
          id: "container-a",
          location: { kind: "container", containerId: "container-b" },
          contentIds: [],
        } as unknown as SimulationStateV2["containers"][string],
        "container-b": {
          id: "container-b",
          location: { kind: "container", containerId: "container-a" },
          contentIds: [],
        } as unknown as SimulationStateV2["containers"][string],
      },
    };
    const report = validateSimulationStateV2Invariants(withCycle);
    expect(report.ok).toBe(false);
    expect(report.violations.some((v) => v.code === "circular_containment")).toBe(true);
  });

  it("detecta referencias a contenedores inexistentes", () => {
    const state = baseState();
    const withOrphan: SimulationStateV2 = {
      ...state,
      containers: {
        ...state.containers,
        "container-c": {
          id: "container-c",
          location: { kind: "container", containerId: "does-not-exist" },
          contentIds: [],
        } as unknown as SimulationStateV2["containers"][string],
      },
    };
    const report = validateSimulationStateV2Invariants(withOrphan);
    expect(report.ok).toBe(false);
    expect(report.violations.some((v) => v.code === "orphan_container_reference")).toBe(true);
  });

  it("detecta doble reserva exclusiva del mismo objeto de mundo", () => {
    const state = baseState();
    const withDoubleReservation: SimulationStateV2 = {
      ...state,
      reservations: {
        ...state.reservations,
        "res-1": {
          id: "res-1",
          jobId: "job-1",
          targetKind: "world_object",
          targetId: "object-1",
        } as unknown as SimulationStateV2["reservations"][string],
        "res-2": {
          id: "res-2",
          jobId: "job-2",
          targetKind: "world_object",
          targetId: "object-1",
        } as unknown as SimulationStateV2["reservations"][string],
      },
    };
    const report = validateSimulationStateV2Invariants(withDoubleReservation);
    expect(report.ok).toBe(false);
    expect(report.violations.some((v) => v.code === "double_exclusive_reservation")).toBe(true);
  });

  it("detecta reservas que referencian trabajos inexistentes", () => {
    const state = baseState();
    const withOrphanReservation: SimulationStateV2 = {
      ...state,
      reservations: {
        ...state.reservations,
        "res-3": {
          id: "res-3",
          jobId: "no-such-job",
          targetKind: "world_object",
          targetId: "object-2",
        } as unknown as SimulationStateV2["reservations"][string],
      },
    };
    const report = validateSimulationStateV2Invariants(withOrphanReservation);
    expect(report.ok).toBe(false);
    expect(report.violations.some((v) => v.code === "orphan_reservation")).toBe(true);
  });

  it("detecta un cierre instalado que coincide con un objeto portátil", () => {
    const state = baseState();
    const [firstWorldObject] = Object.values(state.worldObjects);
    if (!firstWorldObject) {
      throw new Error("El fixture de prueba no generó ningún WorldObject portado.");
    }
    const withConflict: SimulationStateV2 = {
      ...state,
      world: {
        ...state.world,
        installedClosures: {
          ...state.world.installedClosures,
          [firstWorldObject.id]: {
            id: firstWorldObject.id,
          } as unknown as SimulationStateV2["world"]["installedClosures"][string],
        },
      },
    };
    const report = validateSimulationStateV2Invariants(withConflict);
    expect(report.ok).toBe(false);
    expect(report.violations.some((v) => v.code === "closure_as_portable_object")).toBe(true);
  });
});
