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
          qualityKnown: true,
          quality: 1,
          provenance: null,
          decayStartedAtSimSeconds: null,
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

  // --- Invariantes nuevas de S3 (runtime jugable, navegación, descubrimiento) ---

  it("detecta una posición de persona fuera de los límites del mundo", () => {
    const state = baseState();
    const [firstPersonId] = state.peopleOrder;
    const person = state.people[firstPersonId!]!;
    const withOutOfBounds: SimulationStateV2 = {
      ...state,
      people: { ...state.people, [firstPersonId!]: { ...person, public: { ...person.public, position: { x: 999999, y: 0 } } } },
    };
    const report = validateSimulationStateV2Invariants(withOutOfBounds);
    expect(report.ok).toBe(false);
    expect(report.violations.some((v) => v.code === "person_position_outside_bounds")).toBe(true);
  });

  it("detecta divergencia entre `location.point` y `public.position` cuando `location` es exterior", () => {
    const state = baseState();
    const [firstPersonId] = state.peopleOrder;
    const person = state.people[firstPersonId!]!;
    const withDivergence: SimulationStateV2 = {
      ...state,
      people: {
        ...state.people,
        [firstPersonId!]: { ...person, location: { kind: "world_point", point: { x: person.public.position.x + 50, y: person.public.position.y } } },
      },
    };
    const report = validateSimulationStateV2Invariants(withDivergence);
    expect(report.ok).toBe(false);
    expect(report.violations.some((v) => v.code === "position_location_divergence")).toBe(true);
  });

  it("detecta una orden activa cuyo destino no coincide con el final de su ruta", () => {
    const state = baseState();
    const [firstPersonId] = state.peopleOrder;
    const person = state.people[firstPersonId!]!;
    const withBadOrder: SimulationStateV2 = {
      ...state,
      people: {
        ...state.people,
        [firstPersonId!]: {
          ...person,
          public: {
            ...person.public,
            activeMovementOrder: {
              commandId: "cmd-x",
              destination: { x: 500, y: 500 },
              path: [person.public.position, { x: 1, y: 1 }],
              totalDistanceMeters: 10,
              travelledDistanceMeters: 0,
              startedAtSimSeconds: 0,
            },
          },
        },
      },
    };
    const report = validateSimulationStateV2Invariants(withBadOrder);
    expect(report.ok).toBe(false);
    expect(report.violations.some((v) => v.code === "movement_destination_mismatch")).toBe(true);
  });

  it("detecta una abertura que declara conectar con el exterior sin conectar ninguna estancia", () => {
    const state = baseState();
    const withBadOpening: SimulationStateV2 = {
      ...state,
      world: {
        ...state.world,
        openings: {
          ...state.world.openings,
          "opening-bad": {
            id: "opening-bad",
            position: { x: 0, y: 0 },
            connectsRoomId: null,
            connectsOtherRoomId: null,
            connectsToExterior: true,
            widthClass: "normal",
            installedClosureId: null,
          },
        },
      },
    };
    const report = validateSimulationStateV2Invariants(withBadOpening);
    expect(report.ok).toBe(false);
    expect(report.violations.some((v) => v.code === "exterior_opening_without_room")).toBe(true);
  });

  it("detecta un registro de descubrimiento duplicado para la misma entidad y faceta", () => {
    const state = baseState();
    const withDuplicate: SimulationStateV2 = {
      ...state,
      discoveries: [
        { entityId: "some-place", facet: "exterior", state: "sighted" },
        { entityId: "some-place", facet: "exterior", state: "observed" },
      ],
    };
    const report = validateSimulationStateV2Invariants(withDuplicate);
    expect(report.ok).toBe(false);
    expect(report.violations.some((v) => v.code === "duplicate_discovery_record")).toBe(true);
  });

  it("detecta un registro de descubrimiento que referencia una estancia inexistente", () => {
    const state = baseState();
    const withOrphanDiscovery: SimulationStateV2 = {
      ...state,
      discoveries: [{ entityId: "no-such-room", facet: "rooms", state: "observed" }],
    };
    const report = validateSimulationStateV2Invariants(withOrphanDiscovery);
    expect(report.ok).toBe(false);
    expect(report.violations.some((v) => v.code === "orphan_discovery_room")).toBe(true);
  });

  it("detecta una niebla con dimensiones incoherentes con los límites del mundo", () => {
    const state = baseState();
    const withBadFog: SimulationStateV2 = { ...state, fog: { ...state.fog, columns: state.fog.columns + 5 } };
    const report = validateSimulationStateV2Invariants(withBadFog);
    expect(report.ok).toBe(false);
    expect(report.violations.some((v) => v.code === "fog_cell_count_mismatch" || v.code === "fog_dimensions_mismatch")).toBe(true);
  });
});
