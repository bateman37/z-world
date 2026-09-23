import { describe, expect, it } from "vitest";
import type { DomainEventV2, SimulationStateV2 } from "@z-world/contracts";
import { applyCommandV2 } from "../apply-command-v2.js";
import { advanceSimulationV2 } from "../advance-simulation-v2.js";
import { buildFullNavigationIndexV2 } from "../room-graph.js";
import { createInitialStateV2 } from "../create-initial-state-v2.js";
import { validateSimulationStateV2Invariants } from "../invariants.js";
import { locationWorldPoint } from "../objects/storage.js";

/**
 * Caso obligatorio de SET-010 §3.8 sobre un pueblo realmente generado
 * (`web-002-semantic-v3`, semilla estable `probe-seed-92`), sin mocks de
 * geometría: el carro de mano generado ante el supermercado COM-02 recoge
 * el cubo real que hay al pie de la bomba comunal, llega hasta el acceso
 * exterior del supermercado (no cabe por las puertas interiores, más
 * estrechas), descarga allí en un punto de transferencia real, y una nueva
 * etapa a pulso con su propia reserva lo lleva por las puertas interiores
 * hasta el contenedor real del almacén trasero («despensa» del comercio).
 *
 * Solo se simula lo que el E2E hace recorriendo el pueblo: la comunidad ya
 * ha visto el terreno (niebla levantada) y ha registrado el almacén trasero.
 */
const SEED = "probe-seed-92";
const STEP = 4 / 72;

function prepared(): { state: SimulationStateV2; supermarketBuildingId: string; backStorageContainerId: string; bucketId: string; cartId: string; p1: string; p2: string } {
  const base = createInitialStateV2(SEED);
  const arrival = base.world.arrivalPoint;
  const supermarket = Object.values(base.world.places)
    .filter((p) => p.profileId === "COM-02" && p.buildingId)
    .sort((a, b) => Math.hypot(a.position.x - arrival.x, a.position.y - arrival.y) - Math.hypot(b.position.x - arrival.x, b.position.y - arrival.y))[0]!;
  const rooms = Object.values(base.world.rooms).filter((r) => base.world.floors[r.floorId]!.buildingId === supermarket.buildingId);
  const backStorage = rooms.find((r) => r.programRoleKey === "back_storage")!;
  const container = Object.values(base.containers).find((c) => c.location.kind === "room" && c.location.roomId === backStorage.id)!;
  const bucket = Object.values(base.worldObjects).find((o) => o.variant === "work_container.bucket" && o.location.kind === "world_point")!;
  const cart = Object.values(base.transportMeans).find((m) => m.provenance === "generated:s8_supermarket_cart")!;
  const cartPoint = cart.location.kind === "world_point" ? cart.location.point : arrival;
  const [p1, p2] = base.peopleOrder as [string, string];
  const people = Object.fromEntries(
    Object.entries(base.people).map(([id, p], i) => {
      const point = i < 2 ? { x: cartPoint.x + 1 + i, y: cartPoint.y } : p.public.position;
      return [id, { ...p, needs: p.needs.map((n) => ({ ...n, value: 100, band: "stable" as const })), location: { kind: "world_point" as const, point }, public: { ...p.public, position: point, activeMovementOrder: null, priorities: { ...p.public.priorities, logistics: 1 as const } } }];
    }),
  );
  const discoveries = [
    ...base.discoveries,
    ...rooms.map((r) => ({ entityId: r.id, facet: "rooms" as const, state: "observed" as const })),
    { entityId: backStorage.id, facet: "content" as const, state: "inspected" as const },
  ];
  const fog = { ...base.fog, cells: base.fog.cells.map(() => 1) };
  return { state: { ...base, people, discoveries, fog }, supermarketBuildingId: supermarket.buildingId!, backStorageContainerId: container.id, bucketId: bucket.id, cartId: cart.id, p1, p2 };
}

describe("S8 — caso obligatorio en el pueblo generado (v3)", () => {
  it("carro → acceso del supermercado → descarga física → nueva reserva y porte a pulso → puerta más estrecha → almacén trasero", () => {
    const setup = prepared();
    const nav = buildFullNavigationIndexV2(setup.state.world);
    let state = applyCommandV2(setup.state, { commandId: "unpause", type: "set_pause", paused: false }, nav).state;
    const ordered = applyCommandV2(
      state,
      {
        type: "order_contextual_action",
        commandId: "cmd-cart",
        actionKey: "transport",
        personId: setup.p1,
        teamPersonIds: [setup.p2],
        target: { kind: "world_object", worldObjectId: setup.bucketId },
        transportMethod: "handcart",
        transportMeansId: setup.cartId,
        transportDestination: { kind: "container", containerId: setup.backStorageContainerId },
      },
      nav,
    );
    const created = ordered.events.find((e) => e.type === "job_created")!;
    const firstJobId = created.type === "job_created" ? created.jobId : "";
    state = ordered.state;
    const events: DomainEventV2[] = [];
    let secondJobId: string | null = null;
    for (let i = 0; i < 20000; i++) {
      const r = advanceSimulationV2(state, STEP, nav);
      state = r.state;
      events.push(...r.events);
      secondJobId = state.jobs[firstJobId]!.transport!.nextJobId;
      if (secondJobId && ["completed", "cancelled", "causal_failure"].includes(state.jobs[secondJobId]!.state)) break;
      if (state.jobs[firstJobId]!.state === "blocked") break;
    }
    const first = state.jobs[firstJobId]!;
    expect(first.blockReasonKey).toBeNull();
    expect(first.state).toBe("completed");
    expect(first.transport!.method).toBe("handcart");
    const stop = first.transport!.stagedStop!;
    const access = state.world.openings[stop.openingId]!;
    expect(access.connectsToExterior).toBe(true);
    // «El carro llega hasta el portón»: se detiene ante el acceso de carga ancho por el que cabe, no ante la puerta de clientes.
    expect(["wide", "gate"]).toContain(access.widthClass);
    expect(state.world.floors[state.world.rooms[access.connectsRoomId!]!.floorId]!.buildingId).toBe(setup.supermarketBuildingId);
    const transferPoint = state.transferPoints[first.transport!.transferPointId!]!;
    expect(transferPoint.openingId).toBe(stop.openingId);
    expect(transferPoint.labelKey).toBe(access.widthClass === "gate" ? "transfer_point.gate" : "transfer_point.loading_access");
    // El carro queda estacionado junto al punto de transferencia, fuera del edificio.
    const cart = state.transportMeans[setup.cartId]!;
    expect(cart.location.kind).toBe("world_point");
    const cartPoint = locationWorldPoint(state, cart.location)!;
    const tpPoint = locationWorldPoint(state, transferPoint.location)!;
    expect(Math.hypot(cartPoint.x - tpPoint.x, cartPoint.y - tpPoint.y)).toBeLessThan(3);

    const second = state.jobs[secondJobId!]!;
    expect(second.state).toBe("completed");
    expect(second.transport!.method).toBe("hand_carry");
    expect(second.transport!.previousJobId).toBe(firstJobId);
    const crossedBySecond = events.filter((e) => e.type === "access_traversed" && e.jobId === secondJobId).map((e) => (e.type === "access_traversed" ? state.world.openings[e.openingId]!.widthClass : ""));
    // A pulso atraviesa el acceso exterior y al menos una puerta interior más estrecha que la que exigía el carro.
    expect(crossedBySecond.length).toBeGreaterThanOrEqual(2);
    expect(crossedBySecond.slice(1).every((w) => w === "normal")).toBe(true);
    expect(state.worldObjects[setup.bucketId]!.location).toEqual({ kind: "container", containerId: setup.backStorageContainerId });
    expect(Object.keys(state.reservations)).toHaveLength(0);
    expect(Object.keys(state.loadBundles)).toHaveLength(0);
    const report = validateSimulationStateV2Invariants(state);
    expect(report.violations.filter((v) => !v.code.startsWith("person_position"))).toEqual([]);
  }, 120_000);
});
