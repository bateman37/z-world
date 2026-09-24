import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { DomainEventV2, SimulationStateV2 } from "@z-world/contracts";
import {
  advanceSimulationV2,
  applyCommandV2,
  buildFullNavigationIndexV2,
  createInitialStateV2,
  validateSimulationStateV2Invariants,
  type NavigationIndexV2,
} from "@z-world/simulation-core";
import { createPrismaClient, type PrismaClient } from "./client.js";
import { createGameV2, loadGameV2, saveSnapshotV2 } from "./repository.js";

const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/zworld_test";

let prisma: PrismaClient;

beforeAll(() => {
  prisma = createPrismaClient(TEST_DATABASE_URL);
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  await prisma.domainEventRecord.deleteMany();
  await prisma.simulationSnapshot.deleteMany();
  await prisma.gameSave.deleteMany();
});

/**
 * Persistencia de S8 (Puerta B) sobre PostgreSQL real (`jsonb`): un
 * traslado guardado a mitad de ruta —con su `LoadBundle`, sus reservas de
 * carga, medio y personas, el medio en manos de su operadora y el estado
 * logístico del `Job`— se recarga exacto y continúa produciendo
 * exactamente los mismos eventos y el mismo resultado que seguir en
 * memoria; una cancelación a mitad deja carga y medio donde estaban
 * también tras recargar; los eventos de S8 quedan registrados; y un
 * snapshot con la forma anterior a S8 sigue cargando con defaults seguros.
 * Pueblo real generado por `web-002-semantic-v3`.
 */

const STEP = 4 / 72;

function prepare(seed: string): { state: SimulationStateV2; nav: NavigationIndexV2; bucketId: string; cartId: string; containerId: string; p1: string; p2: string } {
  const base = createInitialStateV2(seed);
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
  const discoveries = [...base.discoveries, ...rooms.map((r) => ({ entityId: r.id, facet: "rooms" as const, state: "observed" as const })), { entityId: backStorage.id, facet: "content" as const, state: "inspected" as const }];
  let state: SimulationStateV2 = { ...base, people, discoveries, fog: { ...base.fog, cells: base.fog.cells.map(() => 1) } };
  const nav = buildFullNavigationIndexV2(state.world);
  state = applyCommandV2(state, { commandId: "unpause", type: "set_pause", paused: false }, nav).state;
  return { state, nav, bucketId: bucket.id, cartId: cart.id, containerId: container.id, p1, p2 };
}

function orderCart(setup: ReturnType<typeof prepare>) {
  const result = applyCommandV2(
    setup.state,
    {
      type: "order_contextual_action",
      commandId: "cmd-cart",
      actionKey: "transport",
      personId: setup.p1,
      teamPersonIds: [setup.p2],
      target: { kind: "world_object", worldObjectId: setup.bucketId },
      transportMethod: "handcart",
      transportMeansId: setup.cartId,
      transportDestination: { kind: "container", containerId: setup.containerId },
    },
    setup.nav,
  );
  const created = result.events.find((e) => e.type === "job_created")!;
  return { state: result.state, events: [...result.events], jobId: created.type === "job_created" ? created.jobId : "" };
}

function runUntil(state: SimulationStateV2, nav: NavigationIndexV2, predicate: (s: SimulationStateV2) => boolean, maxTicks = 20000) {
  let current = state;
  const events: DomainEventV2[] = [];
  for (let i = 0; i < maxTicks && !predicate(current); i++) {
    const r = advanceSimulationV2(current, STEP, nav);
    current = r.state;
    events.push(...r.events);
  }
  return { state: current, events };
}

async function persistedEventTypes(gameSaveId: string): Promise<string[]> {
  const rows = await prisma.domainEventRecord.findMany({ where: { gameSaveId }, orderBy: { sequence: "asc" } });
  return rows.map((r) => r.type);
}

describe("persistencia de traslados S8 (PostgreSQL real)", () => {
  it("guardar a mitad de ruta con el carro cargado y recargar continúa exactamente igual hasta la transferencia y el porte final", async () => {
    const setup = prepare("persist-s8-cart-1");
    const created = await createGameV2(prisma, { state: setup.state, initialEvents: [] });
    const order = orderCart(setup);
    const mid = runUntil(order.state, setup.nav, (s) => (s.jobs[order.jobId]!.transport!.travelledLoadedMeters ?? 0) > 10);
    const midJob = mid.state.jobs[order.jobId]!;
    expect(midJob.transport!.step).toBe("traverse");
    const bundleId = midJob.transport!.loadBundleId!;
    expect(mid.state.loadBundles[bundleId]!.location).toEqual({ kind: "mounted_on_transport", transportId: setup.cartId });
    expect(mid.state.transportMeans[setup.cartId]!.location).toEqual({ kind: "carried_by_person", personId: setup.p1 });
    const reservationKinds = Object.values(mid.state.reservations).filter((r) => r.jobId === order.jobId).map((r) => r.targetKind).sort();
    expect(reservationKinds).toEqual(["person", "person", "transport_means", "world_object"]);
    expect(validateSimulationStateV2Invariants(mid.state).ok).toBe(true);

    await saveSnapshotV2(prisma, { gameSaveId: created.gameSaveId, expectedRevision: 0, state: mid.state, events: [...order.events, ...mid.events], reason: "order_settled" });
    const reloaded = await loadGameV2(prisma, created.gameSaveId);
    expect(reloaded.state).toEqual(mid.state);

    const finished = (s: SimulationStateV2) => {
      const next = s.jobs[order.jobId]!.transport!.nextJobId;
      return next !== null && s.jobs[next]!.state === "completed";
    };
    const inMemory = runUntil(mid.state, setup.nav, finished);
    const afterReload = runUntil(reloaded.state, setup.nav, finished);
    expect(afterReload.events).toEqual(inMemory.events);
    expect(afterReload.state).toEqual(inMemory.state);
    expect(afterReload.state.worldObjects[setup.bucketId]!.location).toEqual({ kind: "container", containerId: setup.containerId });

    await saveSnapshotV2(prisma, { gameSaveId: created.gameSaveId, expectedRevision: 1, state: afterReload.state, events: afterReload.events, reason: "order_settled" });
    const final = await loadGameV2(prisma, created.gameSaveId);
    expect(final.state).toEqual(afterReload.state);
    const types = await persistedEventTypes(created.gameSaveId);
    for (const type of ["transport_planned", "transport_means_retrieved", "load_prepared", "transport_noise_emitted", "load_transferred", "access_traversed", "load_delivered", "transport_means_parked"]) {
      expect(types).toContain(type);
    }
    expect(Object.keys(final.state.transferPoints)).toHaveLength(1);
    expect(Object.keys(final.state.reservations)).toHaveLength(0);
  }, 120_000);

  it("cancelar a mitad de ruta y recargar conserva carga montada, carro abandonado y posiciones; sin reservas colgando", async () => {
    const setup = prepare("probe-seed-92");
    const created = await createGameV2(prisma, { state: setup.state, initialEvents: [] });
    const order = orderCart(setup);
    const mid = runUntil(order.state, setup.nav, (s) => (s.jobs[order.jobId]!.transport!.travelledLoadedMeters ?? 0) > 10);
    const operatorAt = mid.state.people[setup.p1]!.public.position;
    const cancelled = applyCommandV2(mid.state, { commandId: "cancel", type: "cancel_job", jobId: order.jobId }, setup.nav);
    await saveSnapshotV2(prisma, { gameSaveId: created.gameSaveId, expectedRevision: 0, state: cancelled.state, events: [...order.events, ...mid.events, ...cancelled.events], reason: "order_settled" });
    const loaded = (await loadGameV2(prisma, created.gameSaveId)).state;
    const cart = loaded.transportMeans[setup.cartId]!;
    expect(cart.location).toEqual({ kind: "world_point", point: operatorAt });
    const bundle = loaded.loadBundles[cart.currentLoadBundleId!]!;
    expect(bundle.state).toBe("deposited");
    expect(loaded.worldObjects[setup.bucketId]!.location).toEqual({ kind: "in_load_bundle", loadBundleId: bundle.id });
    expect(Object.keys(loaded.reservations)).toHaveLength(0);
    expect(loaded.jobs[order.jobId]!.state).toBe("cancelled");
    expect(validateSimulationStateV2Invariants(loaded).ok).toBe(true);
    const types = await persistedEventTypes(created.gameSaveId);
    expect(types).toContain("load_deposited");
    expect(types).toContain("transport_means_parked");
  }, 120_000);

  it("un snapshot con la forma anterior a S8 (sin campos de transporte) sigue cargando con defaults seguros", async () => {
    const modern = createInitialStateV2("persist-s8-compat-1");
    const legacy = JSON.parse(JSON.stringify(modern)) as Record<string, unknown>;
    // Forma S7: sin `Job.transport`, cargas y puntos de transferencia con la forma esquelética de S1.
    legacy.jobs = {};
    legacy.loadBundles = {
      "load-bundle-legacy": { id: "load-bundle-legacy", method: "hand_carry", carriedByPersonIds: [], transportMeansId: null, contentObjectIds: [], contentResourceLotIds: [], totalWeightKg: 0, location: { kind: "world_point", point: modern.world.arrivalPoint } },
    };
    legacy.transferPoints = { "transfer-point-legacy": { id: "transfer-point-legacy", location: { kind: "world_point", point: modern.world.arrivalPoint }, labelKey: "transfer_point.legacy" } };
    const created = await createGameV2(prisma, { state: legacy as unknown as SimulationStateV2, initialEvents: [] });
    const loaded = await loadGameV2(prisma, created.gameSaveId);
    const bundle = loaded.state.loadBundles["load-bundle-legacy"]!;
    expect(bundle.contentFurnitureIds).toEqual([]);
    expect(bundle.state).toBe("loaded");
    expect(bundle.allocation).toEqual({});
    const point = loaded.state.transferPoints["transfer-point-legacy"]!;
    expect(point.kind).toBe("staging_area");
    expect(point.openingId).toBeNull();
  });

  it("un trabajo S7 guardado sin `transport` carga con `transport: null` y sigue avanzando", async () => {
    const initial = createInitialStateV2("persist-s8-compat-2");
    const nav = buildFullNavigationIndexV2(initial.world);
    const personId = initial.peopleOrder[1]!;
    const pack = Object.values(initial.containers).find((c) => c.hostWorldObjectId === `${personId}-pack`)!;
    const vesselId = pack.contentIds.find((id) => initial.worldObjects[id]?.family === "personal_liquid_container")!;
    let state = applyCommandV2(initial, { commandId: "unpause", type: "set_pause", paused: false }, nav).state;
    const ordered = applyCommandV2(state, { type: "order_contextual_action", commandId: "r", actionKey: "retrieve_from_storage", personId, teamPersonIds: [], target: { kind: "container", containerId: pack.id }, storageItem: { kind: "world_object", id: vesselId } }, nav);
    state = ordered.state;
    const legacy = JSON.parse(JSON.stringify(state)) as { jobs: Record<string, Record<string, unknown>> };
    for (const j of Object.values(legacy.jobs)) delete j.transport;
    const created = await createGameV2(prisma, { state: legacy as unknown as SimulationStateV2, initialEvents: [] });
    const loaded = (await loadGameV2(prisma, created.gameSaveId)).state;
    expect(Object.values(loaded.jobs).every((j) => j.transport === null)).toBe(true);
    const after = runUntil(loaded, nav, (s) => Object.values(s.jobs).every((j) => j.state === "completed"), 200);
    expect(after.state.worldObjects[vesselId]!.location).toEqual({ kind: "carried_by_person", personId });
  });
});
