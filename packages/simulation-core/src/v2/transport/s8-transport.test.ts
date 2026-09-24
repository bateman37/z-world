import { describe, expect, it } from "vitest";
import type { Container, DomainEventV2, ResourceLot, SimulationCommand, SimulationStateV2, TransportMeans, WorldObject } from "@z-world/contracts";
import { parseSimulationStateV2, TRANSPORT_METHODS } from "@z-world/contracts";
import { TRANSPORT_METHOD_DEFINITIONS, validateTransportCatalog } from "@z-world/catalogs";
import { applyCommandV2 } from "../apply-command-v2.js";
import { advanceSimulationV2 } from "../advance-simulation-v2.js";
import { buildFullNavigationIndexV2, type NavigationIndexV2 } from "../room-graph.js";
import { makeSyntheticBuildingState, TEST_HOUSE_IDS } from "../test-fixtures.js";
import { validateSimulationStateV2Invariants } from "../invariants.js";
import { makeResourceLot, makeWorldObject } from "../generator/buildings.js";
import { makeTransportMeans } from "../generator/scenario.js";
import { resolveHolderPersonId } from "../objects/storage.js";
import { cappedContributions, teamWorkFactor, usefulCarrierLimit } from "./capacity.js";
import { summarizeCargo } from "./cargo.js";
import { needOf } from "../needs/evolve-needs.js";

/**
 * Pruebas de la Puerta B (S8): los cinco métodos activos con comportamiento
 * real, cargas físicas, medios localizados, cooperación con topes
 * 100/60/35/20, reservas de carga/medio/persona, fases logísticas, rutas
 * compatibles con accesos y terreno, `Auto` frente a método impuesto,
 * transferencia por etapas, cancelación con posiciones causales, fatiga y
 * ruido a lo largo de la ruta, y determinismo tras guardar/recargar.
 *
 * Mundo sintético (`test-fixtures.ts`): vivienda de dos estancias en x∈[10,20]
 * con puerta exterior (10,0) y puerta interior (15,0), ambas `normal`, sobre
 * terreno abierto; la persona principal empieza en (0,0).
 */

const S8_INVARIANTS = new Set([
  "container_content_location_mismatch",
  "container_over_capacity",
  "contained_item_not_listed",
  "orphan_container_content",
  "double_exclusive_reservation",
  "job_reservation_not_bidirectional",
  "bundle_content_also_contained",
  "bundle_content_location_mismatch",
  "bundle_content_missing",
  "bundle_means_mismatch",
  "bundled_item_not_listed",
  "means_orphan_bundle",
  "person_orphan_bundle",
  "orphan_location_load_bundle",
  "orphan_location_transfer_point",
  "orphan_location_transport",
  "negative_quantity",
]);

function violations(state: SimulationStateV2): string[] {
  return validateSimulationStateV2Invariants(state)
    .violations.filter((v) => S8_INVARIANTS.has(v.code))
    .map((v) => `${v.code}: ${v.message}`);
}

interface World {
  state: SimulationStateV2;
  nav: NavigationIndexV2;
  p1: string;
  p2: string;
  p3: string;
}

/** Mundo limpio: pertenencias de las personas, necesidades cubiertas, estancias conocidas y tres personas cerca del origen. */
function world(seed = "s8-transport"): World {
  const base = makeSyntheticBuildingState(seed);
  const worldObjects = Object.fromEntries(Object.values(base.worldObjects).filter((o) => resolveHolderPersonId(base, o.location)).map((o) => [o.id, o]));
  const withObjects = { ...base, worldObjects };
  const containers = Object.fromEntries(Object.values(base.containers).filter((c) => c.hostWorldObjectId && worldObjects[c.hostWorldObjectId]).map((c) => [c.id, c]));
  const resourceLots = Object.fromEntries(Object.values(base.resourceLots).filter((l) => resolveHolderPersonId({ ...withObjects, containers }, l.location)).map((l) => [l.id, l]));
  const [p1, p2, p3] = base.peopleOrder as [string, string, string];
  const people = Object.fromEntries(
    Object.entries(base.people).map(([id, p], i) => {
      const point = { x: 0, y: i === 0 ? 0 : i === 1 ? 2 : i === 2 ? -2 : 40 + i };
      return [
        id,
        {
          ...p,
          needs: p.needs.map((n) => ({ ...n, value: 100, band: "stable" as const })),
          location: { kind: "world_point" as const, point },
          public: { ...p.public, position: point, activeMovementOrder: null, operationalState: "awaiting_orders" as const, priorities: { ...p.public.priorities, logistics: 1 as const } },
        },
      ];
    }),
  );
  const discoveries = [
    { entityId: TEST_HOUSE_IDS.hallwayRoomId, facet: "rooms" as const, state: "observed" as const },
    { entityId: TEST_HOUSE_IDS.bedroomRoomId, facet: "rooms" as const, state: "observed" as const },
    { entityId: TEST_HOUSE_IDS.bedroomRoomId, facet: "content" as const, state: "inspected" as const },
  ];
  let state: SimulationStateV2 = { ...base, people, worldObjects, containers, resourceLots, furniture: {}, transportMeans: {}, discoveries };
  state = applyCommandV2(state, { commandId: "unpause", type: "set_pause", paused: false }, buildFullNavigationIndexV2(state.world)).state;
  return { state, nav: buildFullNavigationIndexV2(state.world), p1, p2, p3 };
}

function lot(id: string, family: ResourceLot["family"], quantity: number, location: ResourceLot["location"]): ResourceLot {
  return makeResourceLot({ id, family, quantity, unit: family === "water" ? "liter" : family === "fresh_food" || family === "preserved_food" ? "unit" : "kilogram", location, condition: 0.8, provenance: "test" });
}

function putLot(state: SimulationStateV2, l: ResourceLot): SimulationStateV2 {
  let containers = state.containers;
  if (l.location.kind === "container") {
    const c = containers[l.location.containerId]!;
    containers = { ...containers, [c.id]: { ...c, contentIds: [...c.contentIds, l.id] } };
  }
  return { ...state, containers, resourceLots: { ...state.resourceLots, [l.id]: l } };
}

function putObject(state: SimulationStateV2, obj: WorldObject): SimulationStateV2 {
  return { ...state, worldObjects: { ...state.worldObjects, [obj.id]: obj } };
}

function putMeans(state: SimulationStateV2, means: TransportMeans): SimulationStateV2 {
  return { ...state, transportMeans: { ...state.transportMeans, [means.id]: means } };
}

/** Caja de almacén real en el dormitorio (destino con capacidad). */
function withBedroomBox(state: SimulationStateV2, capacityUnits = 12): { state: SimulationStateV2; containerId: string } {
  const containerId = "container-s8-bedroom";
  const container: Container = { id: containerId, location: { kind: "room", roomId: TEST_HOUSE_IDS.bedroomRoomId }, capacityUnits, contentIds: [], hostFurnitureId: null, hostWorldObjectId: null, acceptedHandlingTags: null };
  return { state: { ...state, containers: { ...state.containers, [containerId]: container } }, containerId };
}

/** Un paso = 2 s simulados (a ×1, 1 s real son 72 s simulados: demasiado grueso para observar la mitad de una ruta). */
const STEP = 2 / 72;

function run(state: SimulationStateV2, nav: NavigationIndexV2, ticks: number, secondsPerTick = STEP, until?: (s: SimulationStateV2, events: readonly DomainEventV2[]) => boolean) {
  let current = state;
  const events: DomainEventV2[] = [];
  for (let i = 0; i < ticks; i++) {
    const result = advanceSimulationV2(current, secondsPerTick, nav);
    current = result.state;
    events.push(...result.events);
    if (until?.(current, events)) break;
  }
  return { state: current, events };
}

type TransportOrder = Omit<Extract<SimulationCommand, { type: "order_contextual_action" }>, "type" | "teamPersonIds" | "actionKey" | "commandId"> & { teamPersonIds?: string[]; commandId?: string };

function orderTransport(state: SimulationStateV2, nav: NavigationIndexV2, command: TransportOrder) {
  const result = applyCommandV2(state, { type: "order_contextual_action", actionKey: "transport", commandId: command.commandId ?? "cmd-transport", teamPersonIds: [], ...command }, nav);
  const created = result.events.find((e) => e.type === "job_created");
  if (!created || created.type !== "job_created") throw new Error("No se creó el trabajo de transporte.");
  return { state: result.state, jobId: created.jobId };
}

const done = (jobId: string) => (s: SimulationStateV2) => ["completed", "cancelled", "causal_failure"].includes(s.jobs[jobId]?.state ?? "");

describe("S8 — catálogo: exactamente cinco métodos activos, un único motor", () => {
  it("declara los cinco métodos activos de SET-010 §3.2 y ninguno del horizonte", () => {
    expect(TRANSPORT_METHOD_DEFINITIONS.map((d) => d.method).sort()).toEqual([...TRANSPORT_METHODS].sort());
    expect(TRANSPORT_METHOD_DEFINITIONS).toHaveLength(5);
    expect(validateTransportCatalog()).toEqual([]);
    // Carretilla y carro comparten motor: solo difieren en datos (superficies, anchura, volumen, etiquetas).
    const wheelbarrow = TRANSPORT_METHOD_DEFINITIONS.find((d) => d.method === "wheelbarrow")!;
    const handcart = TRANSPORT_METHOD_DEFINITIONS.find((d) => d.method === "handcart")!;
    expect(Object.keys(wheelbarrow).sort()).toEqual(Object.keys(handcart).sort());
    expect(handcart.surfaces.dense_vegetation).toBeNull();
    expect(wheelbarrow.surfaces.dense_vegetation).not.toBeNull();
  });
});

describe("S8 — cooperación real: topes 100/60/35/20 y límite por espacio", () => {
  it("aplica los topes exactos a la principal y a los ayudantes ordenados por aporte", () => {
    expect(cappedContributions([10, 4, 8, 6, 2])).toEqual([10, 4.8, 2.1, 0.8, 0]);
  });
  it("el factor de equipo nunca es una bonificación genérica: lo limitan capacidad y espacio", () => {
    expect(teamWorkFactor([6], 4)).toBe(1);
    expect(teamWorkFactor([6, 6], 4)).toBe(1.6);
    expect(teamWorkFactor([6, 6, 6, 6], 4)).toBe(2.15);
    expect(teamWorkFactor([6, 6, 6, 6], 2)).toBe(1.6);
    expect(teamWorkFactor([8, 1], 4)).toBeCloseTo(1.15, 6);
    const coordinated = TRANSPORT_METHOD_DEFINITIONS.find((d) => d.method === "coordinated_carry")!;
    expect(usefulCarrierLimit(coordinated, "bulky", "gate")).toBe(4);
    expect(usefulCarrierLimit(coordinated, "bulky", "wide")).toBe(2);
    expect(usefulCarrierLimit(coordinated, "large", null)).toBe(2);
  });
});

describe("S8 — carga física real", () => {
  it("suma peso real (con contenido), volumen, bulto y etiquetas; bloquea por peso y por bulto de forma independiente", () => {
    const { state, nav, p1 } = world();
    let s = putLot(state, lot("lot-metal", "sheet_metal", 40, { kind: "world_point", point: { x: -8, y: 0 } }));
    s = putObject(s, makeWorldObject({ id: "obj-box", variant: "storage_furniture.storage_box", location: { kind: "world_point", point: { x: -8, y: 1 } }, condition: 0.8, quality: 0.5, functionalState: "functional" }));
    const heavy = summarizeCargo(s, [{ kind: "resource_lot", id: "lot-metal" }])!;
    expect(heavy.totalWeightKg).toBe(40);
    expect(heavy.bulk).toBe("large");
    const bulky = summarizeCargo(s, [{ kind: "world_object", id: "obj-box" }])!;
    expect(bulky.totalWeightKg).toBe(4);
    expect(bulky.totalVolumeLiters).toBe(60);

    // A pulso: 40 kg de chapa bloquean por peso (el bulto cabe); la caja de 60 L bloquea por bulto (el peso cabe).
    const a = orderTransport(s, nav, { personId: p1, target: { kind: "resource_lot", resourceLotId: "lot-metal" }, transportMethod: "hand_carry", transportDestination: { kind: "world_point", point: { x: -20, y: 0 } } });
    const ra = run(a.state, nav, 5);
    expect(ra.state.jobs[a.jobId]!.state).toBe("blocked");
    expect(ra.state.jobs[a.jobId]!.blockReasonKey).toBe("block.load_too_heavy_for_method");
    const b = orderTransport(s, nav, { personId: p1, target: { kind: "world_object", worldObjectId: "obj-box" }, transportMethod: "hand_carry", transportDestination: { kind: "world_point", point: { x: -20, y: 0 } } });
    const rb = run(b.state, nav, 5);
    expect(rb.state.jobs[b.jobId]!.blockReasonKey).toBe("block.load_too_bulky_for_method");
  });

  it("hereda del contenido las etiquetas de manipulación (líquido, frágil, vertical), no las geométricas, y decide con ellas", () => {
    const { state, nav, p1 } = world();
    let s = putMeans(state, meansAt("means-barrow", "wheelbarrow", { x: -1, y: 1 }));
    const boxContainer: Container = { id: "container-box", location: { kind: "on_object", objectId: "obj-box" }, capacityUnits: 4, contentIds: ["obj-lantern", "obj-axe"], hostFurnitureId: null, hostWorldObjectId: "obj-box", acceptedHandlingTags: null };
    s = putObject(s, { ...makeWorldObject({ id: "obj-box", variant: "storage_furniture.storage_box", location: { kind: "world_point", point: { x: -8, y: 1 } }, condition: 0.8, quality: 0.5, functionalState: "functional" }), containerId: boxContainer.id });
    s = putObject(s, makeWorldObject({ id: "obj-lantern", variant: "light_source.lantern", location: { kind: "container", containerId: boxContainer.id }, condition: 0.9, quality: 0.5, functionalState: "functional" }));
    s = putObject(s, makeWorldObject({ id: "obj-axe", variant: "improvised_tool_or_weapon.wood_axe", location: { kind: "container", containerId: boxContainer.id }, condition: 0.9, quality: 0.5, functionalState: "functional" }));
    s = { ...s, containers: { ...s.containers, [boxContainer.id]: boxContainer } };
    s = putObject(s, makeWorldObject({ id: "obj-bucket", variant: "work_container.bucket", location: { kind: "world_point", point: { x: -8, y: -1 } }, condition: 0.9, quality: 0.5, functionalState: "functional" }));
    s = putLot(s, lot("lot-water", "water", 8, { kind: "on_object", objectId: "obj-bucket" }));

    const box = summarizeCargo(s, [{ kind: "world_object", id: "obj-box" }])!;
    expect(box.handlingTags).toEqual(expect.arrayContaining(["fragile", "keep_upright"]));
    expect(box.handlingTags).not.toContain("long"); // el hacha va dentro: la caja absorbe su geometría
    expect(summarizeCargo(s, [{ kind: "world_object", id: "obj-bucket" }])!.handlingTags).toContain("liquid");
    expect(summarizeCargo(s, [{ kind: "world_object", id: "obj-bucket" }])!.totalWeightKg).toBeGreaterThan(8);

    // La carretilla no admite cargas que deban ir verticales: por la etiqueta heredada del farol, no por la caja.
    const order = orderTransport(s, nav, { personId: p1, target: { kind: "world_object", worldObjectId: "obj-box" }, transportMethod: "wheelbarrow", transportMeansId: "means-barrow", transportDestination: { kind: "world_point", point: { x: -20, y: 0 } } });
    const r = run(order.state, nav, 5);
    expect(r.state.jobs[order.jobId]!.blockReasonKey).toBe("block.handling_incompatible_with_method");
    // Vacía de lo frágil, la misma caja sí va en carretilla.
    const emptied: SimulationStateV2 = { ...s, worldObjects: Object.fromEntries(Object.entries(s.worldObjects).filter(([id]) => id !== "obj-lantern")), containers: { ...s.containers, [boxContainer.id]: { ...boxContainer, contentIds: ["obj-axe"] } } };
    const ok = orderTransport(emptied, nav, { personId: p1, target: { kind: "world_object", worldObjectId: "obj-box" }, transportMethod: "wheelbarrow", transportMeansId: "means-barrow", transportDestination: { kind: "world_point", point: { x: -20, y: 0 } } });
    const rok = run(ok.state, nav, 20000, STEP, (st) => done(ok.jobId)(st));
    expect(rok.state.jobs[ok.jobId]!.state).toBe("completed");
  });
});

describe("S8 — a pulso, extremo a extremo por accesos reales", () => {
  it("lleva un lote a una caja del dormitorio atravesando dos puertas, sin teletransporte y liberando reservas", () => {
    const base = world();
    let s = putLot(base.state, lot("lot-wood", "wood_and_planks", 5, { kind: "world_point", point: { x: -10, y: 0 } }));
    const box = withBedroomBox(s);
    s = box.state;
    const order = orderTransport(s, base.nav, { personId: base.p1, target: { kind: "resource_lot", resourceLotId: "lot-wood" }, transportDestination: { kind: "container", containerId: box.containerId } });
    const seenLocations = new Set<string>();
    let current = order.state;
    const events: DomainEventV2[] = [];
    for (let i = 0; i < 12000 && !done(order.jobId)(current); i++) {
      const r = advanceSimulationV2(current, STEP, base.nav);
      current = r.state;
      events.push(...r.events);
      const l = current.resourceLots["lot-wood"];
      if (l) seenLocations.add(l.location.kind);
      expect(violations(current)).toEqual([]);
    }
    const job = current.jobs[order.jobId]!;
    expect(job.state).toBe("completed");
    expect(job.transport!.method).toBe("hand_carry");
    const planned = events.find((e) => e.type === "transport_planned");
    expect(planned && planned.type === "transport_planned" && planned.chosenBy).toBe("auto");
    expect(events.some((e) => e.type === "load_prepared")).toBe(true);
    const crossed = events.filter((e) => e.type === "access_traversed").map((e) => (e.type === "access_traversed" ? e.openingId : ""));
    expect(crossed).toEqual([TEST_HOUSE_IDS.exteriorOpeningId, TEST_HOUSE_IDS.interiorOpeningId]);
    expect(events.some((e) => e.type === "load_delivered")).toBe(true);
    // Fases: suelo → carga → contenedor; nunca aparece directamente en el destino.
    expect([...seenLocations]).toEqual(["world_point", "in_load_bundle", "container"]);
    expect(current.resourceLots["lot-wood"]!.location).toEqual({ kind: "container", containerId: box.containerId });
    expect(current.containers[box.containerId]!.contentIds).toContain("lot-wood");
    expect(Object.keys(current.loadBundles)).toHaveLength(0);
    expect(Object.values(current.reservations).filter((r) => r.jobId === order.jobId)).toHaveLength(0);
    expect(current.people[base.p1]!.activeJobId).toBeNull();
    // Ruido registrado a lo largo de la ruta, antes de la entrega (no solo al final).
    const noiseIndex = events.findIndex((e) => e.type === "transport_noise_emitted");
    const deliveredIndex = events.findIndex((e) => e.type === "load_delivered");
    expect(noiseIndex).toBeGreaterThan(-1);
    expect(noiseIndex).toBeLessThan(deliveredIndex);
  });
});

function meansAt(id: string, method: "wheelbarrow" | "handcart", point: { x: number; y: number }, condition = 0.9, capacityKg = 100): TransportMeans {
  return makeTransportMeans(id, method, { kind: "world_point", point }, capacityKg, condition);
}

describe("S8 — carretilla: medio localizado, viaja hasta la carga, carga, descarga y estaciona", () => {
  it("Auto elige la carretilla para 40 kg, la recupera donde está, la desgasta y la deja aparcada en destino", () => {
    const base = world();
    let s = putLot(base.state, lot("lot-metal", "sheet_metal", 40, { kind: "world_point", point: { x: -10, y: -10 } }));
    s = putMeans(s, meansAt("means-barrow", "wheelbarrow", { x: 5, y: -15 }));
    const order = orderTransport(s, base.nav, { personId: base.p1, target: { kind: "resource_lot", resourceLotId: "lot-metal" }, transportDestination: { kind: "world_point", point: { x: -30, y: -20 } } });
    const meansLocations: string[] = [];
    let current = order.state;
    const events: DomainEventV2[] = [];
    for (let i = 0; i < 18000 && !done(order.jobId)(current); i++) {
      const r = advanceSimulationV2(current, STEP, base.nav);
      current = r.state;
      events.push(...r.events);
      const kind = current.transportMeans["means-barrow"]!.location.kind;
      if (meansLocations[meansLocations.length - 1] !== kind) meansLocations.push(kind);
      expect(violations(current)).toEqual([]);
    }
    const job = current.jobs[order.jobId]!;
    expect(job.state).toBe("completed");
    expect(job.transport!.method).toBe("wheelbarrow");
    expect(job.transport!.transportMeansId).toBe("means-barrow");
    expect(meansLocations).toEqual(["world_point", "carried_by_person", "world_point"]);
    const types = events.map((e) => e.type);
    expect(types.indexOf("transport_means_retrieved")).toBeLessThan(types.indexOf("load_prepared"));
    expect(types.indexOf("load_prepared")).toBeLessThan(types.indexOf("load_delivered"));
    expect(types).toContain("transport_means_parked");
    const lotAfter = current.resourceLots["lot-metal"]!;
    expect(lotAfter.location.kind).toBe("world_point");
    const at = lotAfter.location.kind === "world_point" ? lotAfter.location.point : { x: 0, y: 0 };
    expect(Math.hypot(at.x + 30, at.y + 20)).toBeLessThan(6);
    const meansAfter = current.transportMeans["means-barrow"]!;
    expect(meansAfter.currentLoadBundleId).toBeNull();
    expect(meansAfter.condition).toBeLessThan(0.9);
    const parkedAt = meansAfter.location.kind === "world_point" ? meansAfter.location.point : { x: 0, y: 0 };
    expect(Math.hypot(parkedAt.x + 30, parkedAt.y + 20)).toBeLessThan(6);
  });

  it("un medio oculto por la niebla o averiado no existe para Auto; imponerlo explica el bloqueo", () => {
    const base = world();
    let s = putLot(base.state, lot("lot-metal", "sheet_metal", 40, { kind: "world_point", point: { x: -10, y: -10 } }));
    s = putMeans(s, meansAt("means-broken", "wheelbarrow", { x: 5, y: -15 }, 0.3));
    const imposed = orderTransport(s, base.nav, { personId: base.p1, target: { kind: "resource_lot", resourceLotId: "lot-metal" }, transportMethod: "wheelbarrow", transportDestination: { kind: "world_point", point: { x: -30, y: -20 } } });
    expect(run(imposed.state, base.nav, 5).state.jobs[imposed.jobId]!.blockReasonKey).toBe("block.means_not_functional");

    // Un carro funcional, pero en una celda que nadie ha visto: no existe para la comunidad.
    let hidden = putLot(base.state, lot("lot-metal", "sheet_metal", 40, { kind: "world_point", point: { x: -10, y: -10 } }));
    hidden = putMeans(hidden, meansAt("means-hidden", "handcart", { x: 52, y: 52 }));
    const fog = hidden.fog;
    const col = Math.floor((52 - fog.originX) / fog.resolutionMeters);
    const row = Math.floor((52 - fog.originY) / fog.resolutionMeters);
    const cells = [...fog.cells];
    cells[row * fog.columns + col] = 0;
    hidden = { ...hidden, fog: { ...fog, cells } };
    const cart = orderTransport(hidden, base.nav, { personId: base.p1, target: { kind: "resource_lot", resourceLotId: "lot-metal" }, transportMethod: "handcart", transportDestination: { kind: "world_point", point: { x: -30, y: -20 } } });
    expect(run(cart.state, base.nav, 5).state.jobs[cart.jobId]!.blockReasonKey).toBe("block.no_known_means");
    const auto = orderTransport(hidden, base.nav, { personId: base.p1, commandId: "auto", target: { kind: "resource_lot", resourceLotId: "lot-metal" }, transportDestination: { kind: "world_point", point: { x: -30, y: -20 } } });
    const autoJob = run(auto.state, base.nav, 5).state.jobs[auto.jobId]!;
    expect(autoJob.state).toBe("blocked");
    expect(autoJob.transport!.transportMeansId).toBeNull();
  });
});

describe("S8 — caso obligatorio: carro → acceso → descarga física → porte manual por una puerta más estrecha → contenedor", () => {
  it("el carro se detiene ante el acceso exterior, crea un punto de transferencia y una nueva etapa a pulso lo lleva al dormitorio", () => {
    const base = world();
    let s = putLot(base.state, lot("lot-food-a", "preserved_food", 6, { kind: "world_point", point: { x: -10, y: 0 } }));
    s = putLot(s, lot("lot-wood", "wood_and_planks", 12, { kind: "world_point", point: { x: -10, y: 1 } }));
    s = putMeans(s, meansAt("means-cart", "handcart", { x: -4, y: 6 }));
    const box = withBedroomBox(s);
    s = box.state;
    const order = orderTransport(s, base.nav, {
      personId: base.p1,
      teamPersonIds: [base.p2],
      target: { kind: "resource_lot", resourceLotId: "lot-food-a" },
      transportCargo: [{ kind: "resource_lot", id: "lot-wood" }],
      transportMethod: "handcart",
      transportDestination: { kind: "container", containerId: box.containerId },
    });
    let current = order.state;
    const events: DomainEventV2[] = [];
    let secondJobId: string | null = null;
    for (let i = 0; i < 1500; i++) {
      const r = advanceSimulationV2(current, STEP, base.nav);
      current = r.state;
      events.push(...r.events);
      expect(violations(current)).toEqual([]);
      secondJobId = current.jobs[order.jobId]!.transport!.nextJobId;
      if (secondJobId && done(secondJobId)(current)) break;
    }
    const first = current.jobs[order.jobId]!;
    expect(first.state).toBe("completed");
    expect(first.transport!.method).toBe("handcart");
    expect(first.transport!.stagedStop!.openingId).toBe(TEST_HOUSE_IDS.exteriorOpeningId);
    const transferId = first.transport!.transferPointId!;
    expect(current.transferPoints[transferId]!.openingId).toBe(TEST_HOUSE_IDS.exteriorOpeningId);
    // El carro nunca atraviesa la puerta normal: queda estacionado fuera, junto al punto de transferencia.
    expect(events.some((e) => e.type === "access_traversed" && e.jobId === order.jobId)).toBe(false);
    const cart = current.transportMeans["means-cart"]!;
    expect(cart.location.kind).toBe("world_point");
    expect(cart.currentLoadBundleId).toBeNull();
    const transferred = events.find((e) => e.type === "load_transferred");
    expect(transferred && transferred.type === "load_transferred" && transferred.nextJobId).toBe(secondJobId);
    // Segunda etapa: nueva reserva y porte a pulso por las dos puertas hasta la caja.
    const second = current.jobs[secondJobId!]!;
    expect(second.state).toBe("completed");
    expect(second.transport!.method).toBe("hand_carry");
    expect(second.transport!.previousJobId).toBe(order.jobId);
    expect(events.some((e) => e.type === "reservation_created" && e.jobId === secondJobId)).toBe(true);
    const crossed = events.filter((e) => e.type === "access_traversed" && e.jobId === secondJobId).map((e) => (e.type === "access_traversed" ? e.openingId : ""));
    expect(crossed).toEqual([TEST_HOUSE_IDS.exteriorOpeningId, TEST_HOUSE_IDS.interiorOpeningId]);
    expect(current.resourceLots["lot-food-a"]!.location).toEqual({ kind: "container", containerId: box.containerId });
    expect(current.resourceLots["lot-wood"]!.location).toEqual({ kind: "container", containerId: box.containerId });
    expect(Object.keys(current.reservations)).toHaveLength(0);
  });
});

describe("S8 — porte coordinado: participantes simultáneos, espacio y accesos", () => {
  function mattressWorld() {
    const base = world();
    const mattress = makeWorldObject({ id: "obj-mattress", variant: "rest_furniture.mattress", location: { kind: "world_point", point: { x: -8, y: 3 } }, condition: 0.7, quality: 0.5, functionalState: "functional" });
    return { ...base, state: putObject(base.state, mattress) };
  }

  it("una sola persona no puede con un colchón: a pulso lo remite al porte coordinado, y este exige dos", () => {
    const w = mattressWorld();
    const hand = orderTransport(w.state, w.nav, { personId: w.p1, target: { kind: "world_object", worldObjectId: "obj-mattress" }, transportMethod: "hand_carry", transportDestination: { kind: "world_point", point: { x: -20, y: 3 } } });
    expect(run(hand.state, w.nav, 3).state.jobs[hand.jobId]!.blockReasonKey).toBe("block.cargo_requires_coordinated_carry");
    const solo = orderTransport(w.state, w.nav, { personId: w.p1, target: { kind: "world_object", worldObjectId: "obj-mattress" }, transportMethod: "coordinated_carry", transportDestination: { kind: "world_point", point: { x: -20, y: 3 } } });
    expect(run(solo.state, w.nav, 3).state.jobs[solo.jobId]!.blockReasonKey).toBe("block.method_requires_more_carriers");
  });

  it("dos personas lo llevan juntas por exterior; por una puerta normal no pasan (WLD-011: dos porteadores exigen acceso ancho)", () => {
    const w = mattressWorld();
    const pair = orderTransport(w.state, w.nav, { personId: w.p1, teamPersonIds: [w.p2], target: { kind: "world_object", worldObjectId: "obj-mattress" }, transportDestination: { kind: "world_point", point: { x: -25, y: 3 } } });
    const r = run(pair.state, w.nav, 18000, STEP, done(pair.jobId));
    const job = r.state.jobs[pair.jobId]!;
    expect(job.state).toBe("completed");
    expect(job.transport!.method).toBe("coordinated_carry");
    const prepared = r.events.find((e) => e.type === "load_prepared");
    expect(prepared && prepared.type === "load_prepared" && [...prepared.carrierPersonIds].sort()).toEqual([w.p1, w.p2].sort());
    const personReservations = r.events.filter((e) => e.type === "reservation_created" && e.targetKind === "person");
    expect(personReservations.length).toBe(2);

    const indoors = orderTransport(w.state, w.nav, { personId: w.p1, teamPersonIds: [w.p2], target: { kind: "world_object", worldObjectId: "obj-mattress" }, transportMethod: "coordinated_carry", transportDestination: { kind: "room", roomId: TEST_HOUSE_IDS.bedroomRoomId } });
    expect(run(indoors.state, w.nav, 3).state.jobs[indoors.jobId]!.blockReasonKey).toBe("block.route_incompatible_with_method");
  });

  it("el porte coordinado espera a que el equipo esté libre a la vez (no empieza con una sola porteadora)", () => {
    const w = mattressWorld();
    // p2 ocupada en otro trabajo: el traslado espera en `reserve` sin mover nada.
    const busy = { ...w.state, people: { ...w.state.people, [w.p2]: { ...w.state.people[w.p2]!, activeJobId: "job-elsewhere" } } };
    const pair = orderTransport(busy, w.nav, { personId: w.p1, teamPersonIds: [w.p2], target: { kind: "world_object", worldObjectId: "obj-mattress" }, transportMethod: "coordinated_carry", transportDestination: { kind: "world_point", point: { x: -25, y: 3 } } });
    const r = run(pair.state, w.nav, 30);
    const job = r.state.jobs[pair.jobId]!;
    expect(job.phases[job.currentPhaseIndex]!.kind).toBe("reserve");
    expect(job.blockReasonKey).toBe("block.waiting_for_carriers");
    expect(r.state.worldObjects["obj-mattress"]!.location.kind).toBe("world_point");
  });
});

describe("S8 — recipiente personal", () => {
  it("guarda la carga dentro de la mochila real que lleva la persona y la saca en el destino", () => {
    const base = world();
    const pack = Object.values(base.state.worldObjects).find((o) => o.variant === "transport_container.backpack" && o.location.kind === "carried_by_person" && o.location.personId === base.p1)!;
    let s = putLot(base.state, lot("lot-seeds", "seeds", 2, { kind: "world_point", point: { x: -6, y: 0 } }));
    const box = withBedroomBox(s);
    s = box.state;
    const order = orderTransport(s, base.nav, { personId: base.p1, target: { kind: "resource_lot", resourceLotId: "lot-seeds" }, transportMethod: "personal_container", transportDestination: { kind: "container", containerId: box.containerId } });
    let sawInPack = false;
    let current = order.state;
    for (let i = 0; i < 18000 && !done(order.jobId)(current); i++) {
      current = advanceSimulationV2(current, STEP, base.nav).state;
      const l = current.resourceLots["lot-seeds"];
      if (l?.location.kind === "container" && l.location.containerId === pack.containerId) sawInPack = true;
      expect(violations(current)).toEqual([]);
    }
    expect(current.jobs[order.jobId]!.state).toBe("completed");
    expect(sawInPack).toBe(true);
    expect(current.resourceLots["lot-seeds"]!.location).toEqual({ kind: "container", containerId: box.containerId });
  });
});

describe("S8 — cancelación e interrupción con posiciones causales", () => {
  it("cancelar a pulso a mitad de ruta deja la carga en manos de la porteadora, donde está, y libera reservas", () => {
    const base = world();
    const s = putLot(base.state, lot("lot-wood", "wood_and_planks", 5, { kind: "world_point", point: { x: -10, y: 0 } }));
    const order = orderTransport(s, base.nav, { personId: base.p1, target: { kind: "resource_lot", resourceLotId: "lot-wood" }, transportDestination: { kind: "world_point", point: { x: -50, y: 0 } } });
    const mid = run(order.state, base.nav, 18000, STEP, (st) => (st.jobs[order.jobId]!.transport!.travelledLoadedMeters ?? 0) > 15);
    const position = mid.state.people[base.p1]!.public.position;
    expect(mid.state.jobs[order.jobId]!.phases[mid.state.jobs[order.jobId]!.currentPhaseIndex]!.kind).toBe("transport");
    const cancelled = applyCommandV2(mid.state, { commandId: "cancel", type: "cancel_job", jobId: order.jobId }, base.nav);
    const after = run(cancelled.state, base.nav, 5).state;
    expect(after.jobs[order.jobId]!.state).toBe("cancelled");
    expect(after.resourceLots["lot-wood"]!.location).toEqual({ kind: "carried_by_person", personId: base.p1 });
    const now = after.people[base.p1]!.public.position;
    expect(Math.hypot(now.x - position.x, now.y - position.y)).toBeLessThan(0.001);
    expect(Math.hypot(now.x + 10, now.y)).toBeGreaterThan(5); // ni en el origen...
    expect(Math.hypot(now.x + 50, now.y)).toBeGreaterThan(5); // ...ni en el destino.
    expect(Object.keys(after.reservations)).toHaveLength(0);
    expect(Object.keys(after.loadBundles)).toHaveLength(0);
    expect(cancelled.events.some((e) => e.type === "load_deposited")).toBe(true);
    expect(violations(after)).toEqual([]);
  });

  it("cancelar con el carro cargado deja la carga montada en el carro, abandonado donde estaba su operadora", () => {
    const base = world();
    let s = putLot(base.state, lot("lot-metal", "sheet_metal", 40, { kind: "world_point", point: { x: -10, y: -10 } }));
    s = putMeans(s, meansAt("means-barrow", "wheelbarrow", { x: 5, y: -15 }));
    const order = orderTransport(s, base.nav, { personId: base.p1, target: { kind: "resource_lot", resourceLotId: "lot-metal" }, transportDestination: { kind: "world_point", point: { x: -50, y: -20 } } });
    const mid = run(order.state, base.nav, 18000, STEP, (st) => (st.jobs[order.jobId]!.transport!.travelledLoadedMeters ?? 0) > 10);
    const cancelled = applyCommandV2(mid.state, { commandId: "cancel", type: "cancel_job", jobId: order.jobId }, base.nav);
    const after = cancelled.state;
    const means = after.transportMeans["means-barrow"]!;
    expect(means.location.kind).toBe("world_point");
    const bundleId = means.currentLoadBundleId!;
    expect(after.loadBundles[bundleId]!.location).toEqual({ kind: "mounted_on_transport", transportId: "means-barrow" });
    expect(after.loadBundles[bundleId]!.state).toBe("deposited");
    expect(after.resourceLots["lot-metal"]!.location).toEqual({ kind: "in_load_bundle", loadBundleId: bundleId });
    expect(cancelled.events.some((e) => e.type === "transport_means_parked" && e.disposition === "abandoned")).toBe(true);
    expect(Object.keys(after.reservations)).toHaveLength(0);
    expect(violations(after)).toEqual([]);

    // Un traslado nuevo recupera el carro abandonado con su carga y termina el recorrido.
    const resumed = orderTransport(after, base.nav, { personId: base.p1, commandId: "cmd-resume", target: { kind: "resource_lot", resourceLotId: "lot-metal" }, transportMethod: "wheelbarrow", transportDestination: { kind: "world_point", point: { x: -50, y: -20 } } });
    const finished = run(resumed.state, base.nav, 18000, STEP, done(resumed.jobId)).state;
    expect(finished.jobs[resumed.jobId]!.state).toBe("completed");
    expect(Object.keys(finished.loadBundles)).toHaveLength(0);
    expect(violations(finished)).toEqual([]);
  });

  it("un obstáculo descubierto durante el recorrido detiene el traslado con evento, deposita la carga y conserva posiciones", () => {
    const base = world();
    let s = putLot(base.state, lot("lot-wood", "wood_and_planks", 5, { kind: "world_point", point: { x: -10, y: 0 } }));
    s = withBedroomBox(s).state;
    const order = orderTransport(s, base.nav, { personId: base.p1, target: { kind: "resource_lot", resourceLotId: "lot-wood" }, transportDestination: { kind: "container", containerId: "container-s8-bedroom" } });
    const moving = run(order.state, base.nav, 18000, STEP, (st) => st.jobs[order.jobId]!.transport!.routeAccesses.length > 0);
    // Alguien atranca la puerta interior mientras tanto (el índice de navegación ya calculado no lo sabe).
    const obstructed = { ...moving.state, world: { ...moving.state.world, obstructions: { "obstruction-s8": { id: "obstruction-s8", openingId: TEST_HOUSE_IDS.interiorOpeningId, kind: "blockade" as const } } } };
    const r = run(obstructed, base.nav, 12000, STEP, (st) => st.jobs[order.jobId]!.state === "blocked");
    const job = r.state.jobs[order.jobId]!;
    expect(job.state).toBe("blocked");
    expect(job.blockReasonKey).toBe("block.route_obstructed");
    expect(r.events.some((e) => e.type === "transport_route_blocked" && e.openingId === TEST_HOUSE_IDS.interiorOpeningId)).toBe(true);
    expect(r.events.some((e) => e.type === "access_traversed" && e.openingId === TEST_HOUSE_IDS.exteriorOpeningId)).toBe(true);
    expect(r.state.resourceLots["lot-wood"]!.location).toEqual({ kind: "carried_by_person", personId: base.p1 });
    // Detenida físicamente ante la puerta atrancada: entre la puerta exterior (x=10) y la interior (x=15), nunca en origen ni destino.
    const stoppedAt = r.state.people[base.p1]!.public.position;
    expect(stoppedAt.x).toBeGreaterThan(9.5);
    expect(stoppedAt.x).toBeLessThan(15.5);
    expect(r.state.people[base.p1]!.public.activeMovementOrder).toBeNull();
    expect(violations(r.state)).toEqual([]);
  });
});

describe("S8 — reservas: nunca dos traslados de la misma carga ni del mismo medio", () => {
  it("el segundo traslado de la misma carga queda bloqueado por reserva, y se reanuda al liberarse", () => {
    const base = world();
    let s = putLot(base.state, lot("lot-metal", "sheet_metal", 40, { kind: "world_point", point: { x: -10, y: -10 } }));
    s = putMeans(s, meansAt("means-barrow", "wheelbarrow", { x: 5, y: -15 }));
    const a = orderTransport(s, base.nav, { personId: base.p1, commandId: "a", target: { kind: "resource_lot", resourceLotId: "lot-metal" }, transportDestination: { kind: "world_point", point: { x: -30, y: -20 } } });
    const b = orderTransport(a.state, base.nav, { personId: base.p2, commandId: "b", target: { kind: "resource_lot", resourceLotId: "lot-metal" }, transportDestination: { kind: "world_point", point: { x: 30, y: -20 } } });
    const r = run(b.state, base.nav, 20);
    expect(r.state.jobs[a.jobId]!.state).toBe("in_progress");
    expect(r.state.jobs[b.jobId]!.state).toBe("blocked");
    expect(["block.resource_reserved", "block.target_reserved"]).toContain(r.state.jobs[b.jobId]!.blockReasonKey);
    expect(violations(r.state)).toEqual([]);
  });
});

describe("S8 — fatiga y ruido del método", () => {
  it("20 kg a pulso cansan más por metro que con carretilla; la carretilla es más ruidosa y el ruido se registra por tramos", () => {
    const measure = (method: "wheelbarrow" | "hand_carry") => {
      const base = world();
      let s = putLot(base.state, lot("lot-load", "sheet_metal", 20, { kind: "world_point", point: { x: -2, y: -1 } }));
      s = putMeans(s, meansAt("means-barrow", "wheelbarrow", { x: -1, y: 1 }));
      const order = orderTransport(s, base.nav, { personId: base.p1, target: { kind: "resource_lot", resourceLotId: "lot-load" }, transportMethod: method, transportDestination: { kind: "world_point", point: { x: -55, y: -1 } } });
      let current = order.state;
      const events: DomainEventV2[] = [];
      let restAtStart: number | null = null;
      let restAtEnd: number | null = null;
      for (let i = 0; i < 20000 && !done(order.jobId)(current); i++) {
        const r = advanceSimulationV2(current, STEP, base.nav);
        const phase = r.state.jobs[order.jobId]!.phases[r.state.jobs[order.jobId]!.currentPhaseIndex]?.kind;
        const before = current.jobs[order.jobId]!.phases[current.jobs[order.jobId]!.currentPhaseIndex]?.kind;
        if (phase === "transport" && before !== "transport") restAtStart = needOf(r.state.people[base.p1]!.needs, "rest").value;
        if (before === "transport" && phase !== "transport") restAtEnd = needOf(r.state.people[base.p1]!.needs, "rest").value;
        current = r.state;
        events.push(...r.events);
      }
      expect(current.jobs[order.jobId]!.state).toBe("completed");
      const t = current.jobs[order.jobId]!.transport!;
      return { restCost: restAtStart! - restAtEnd!, meters: t.travelledLoadedMeters, noise: t.noiseUnits, fatigue: t.fatigueUnits, noiseEvents: events.filter((e) => e.type === "transport_noise_emitted").length };
    };
    const byHand = measure("hand_carry");
    const byBarrow = measure("wheelbarrow");
    expect(byHand.restCost / byHand.meters).toBeGreaterThan(byBarrow.restCost / byBarrow.meters);
    expect(byHand.fatigue / byHand.meters).toBeGreaterThan(byBarrow.fatigue / byBarrow.meters);
    expect(byBarrow.noise / byBarrow.meters).toBeGreaterThan(byHand.noise / byHand.meters);
    expect(byBarrow.noiseEvents).toBeGreaterThan(1);
  });
});

describe("S8 — guardar y recargar a mitad de un traslado continúa exactamente igual", () => {
  it("el mismo estado tras un viaje JSON (jsonb) produce los mismos eventos y el mismo resultado", () => {
    const base = world();
    let s = putLot(base.state, lot("lot-metal", "sheet_metal", 40, { kind: "world_point", point: { x: -10, y: -10 } }));
    s = putMeans(s, meansAt("means-barrow", "wheelbarrow", { x: 5, y: -15 }));
    const order = orderTransport(s, base.nav, { personId: base.p1, target: { kind: "resource_lot", resourceLotId: "lot-metal" }, transportDestination: { kind: "world_point", point: { x: -30, y: -20 } } });
    const mid = run(order.state, base.nav, 18000, STEP, (st) => (st.jobs[order.jobId]!.transport!.travelledLoadedMeters ?? 0) > 8).state;
    const reparsed = parseSimulationStateV2(JSON.parse(JSON.stringify(mid)));
    expect(reparsed.success).toBe(true);
    const inMemory = run(mid, base.nav, 18000, STEP, done(order.jobId));
    const reloaded = run(reparsed.data!, base.nav, 18000, STEP, done(order.jobId));
    expect(reloaded.events).toEqual(inMemory.events);
    expect(JSON.stringify(reloaded.state)).toBe(JSON.stringify(inMemory.state));
  });
});

/** Añade una franja de bosque de lado a lado (x∈[-40,-25]) y una carretera firme (y=-30), y reconstruye el índice derivado. */
function withTerrain(w: World, withRoad = true): World {
  const forest = { id: "area-z-forest", kind: "dense_vegetation" as const, polygon: [{ x: -40, y: -60 }, { x: -25, y: -60 }, { x: -25, y: 60 }, { x: -40, y: 60 }], transitable: true, traversalCostMultiplier: 1.5, placeId: null, coverage: "vegetation" as const };
  const road = { id: "line-road", kind: "road" as const, polyline: [{ x: 0, y: -45 }, { x: -58, y: -45 }], widthMeters: 6, wayState: "transitable" as const, placeId: null };
  const state = { ...w.state, world: { ...w.state.world, terrainAreas: { ...w.state.world.terrainAreas, [forest.id]: forest }, linearFeatures: withRoad ? { [road.id]: road } : {} } };
  return { ...w, state, nav: buildFullNavigationIndexV2(state.world) };
}

describe("S8 — carretilla y carro reaccionan a la superficie real", () => {
  it("el carro no cruza el bosque: sin otra vía queda bloqueado; con carretera la rodea; la carretilla atraviesa el bosque", () => {
    const setup = (withRoad: boolean) => {
      const w = withTerrain(world(), withRoad);
      let s = putLot(w.state, lot("lot-metal", "sheet_metal", 30, { kind: "world_point", point: { x: -10, y: 0 } }));
      s = putMeans(s, meansAt("means-cart", "handcart", { x: -6, y: 4 }));
      s = putMeans(s, meansAt("means-barrow", "wheelbarrow", { x: -6, y: -4 }));
      return { w, s };
    };
    const noRoad = setup(false);
    const blocked = orderTransport(noRoad.s, noRoad.w.nav, { personId: noRoad.w.p1, commandId: "cart", target: { kind: "resource_lot", resourceLotId: "lot-metal" }, transportMethod: "handcart", transportDestination: { kind: "world_point", point: { x: -52, y: 0 } } });
    expect(run(blocked.state, noRoad.w.nav, 5).state.jobs[blocked.jobId]!.blockReasonKey).toBe("block.route_incompatible_with_method");

    const road = setup(true);
    const detour = orderTransport(road.s, road.w.nav, { personId: road.w.p1, commandId: "cart", target: { kind: "resource_lot", resourceLotId: "lot-metal" }, transportMethod: "handcart", transportDestination: { kind: "world_point", point: { x: -52, y: 0 } } });
    const rd = run(detour.state, road.w.nav, 20000, STEP, done(detour.jobId));
    expect(rd.state.jobs[detour.jobId]!.state).toBe("completed");
    expect(rd.state.jobs[detour.jobId]!.transport!.surfaceMeters.dense_vegetation).toBe(0);
    expect(rd.state.jobs[detour.jobId]!.transport!.surfaceMeters.road).toBeGreaterThan(10);

    const barrow = orderTransport(noRoad.s, noRoad.w.nav, { personId: noRoad.w.p1, commandId: "barrow", target: { kind: "resource_lot", resourceLotId: "lot-metal" }, transportMethod: "wheelbarrow", transportDestination: { kind: "world_point", point: { x: -52, y: 0 } } });
    const r = run(barrow.state, noRoad.w.nav, 20000, STEP, done(barrow.jobId));
    expect(r.state.jobs[barrow.jobId]!.state).toBe("completed");
    expect(r.state.jobs[barrow.jobId]!.transport!.surfaceMeters.dense_vegetation).toBeGreaterThan(10);
  });

  it("sobre firme el carro va más rápido que la carretilla; por tierra, al revés", () => {
    const speedOf = (method: "handcart" | "wheelbarrow", from: { x: number; y: number }, to: { x: number; y: number }) => {
      const w = withTerrain(world());
      let s = putLot(w.state, lot("lot-metal", "sheet_metal", 30, { kind: "world_point", point: from }));
      s = putMeans(s, meansAt("means-x", method, { x: from.x + 1, y: from.y + 1 }));
      const order = orderTransport(s, w.nav, { personId: w.p1, target: { kind: "resource_lot", resourceLotId: "lot-metal" }, transportMethod: method, transportDestination: { kind: "world_point", point: to } });
      let current = order.state;
      let start = 0;
      let end = 0;
      for (let i = 0; i < 20000 && !done(order.jobId)(current); i++) {
        const next = advanceSimulationV2(current, STEP, w.nav).state;
        const before = current.jobs[order.jobId]!.phases[current.jobs[order.jobId]!.currentPhaseIndex]?.kind;
        const after = next.jobs[order.jobId]!.phases[next.jobs[order.jobId]!.currentPhaseIndex]?.kind;
        if (after === "transport" && before !== "transport") start = next.clock.elapsedSimSeconds;
        if (before === "transport" && after !== "transport") end = next.clock.elapsedSimSeconds;
        current = next;
      }
      return current.jobs[order.jobId]!.transport!.travelledLoadedMeters / Math.max(1, end - start);
    };
    // La carretera cruza el bosque (y = -45): sobre ella manda el firme.
    const roadCart = speedOf("handcart", { x: -2, y: -45 }, { x: -55, y: -45 });
    const roadBarrow = speedOf("wheelbarrow", { x: -2, y: -45 }, { x: -55, y: -45 });
    const groundCart = speedOf("handcart", { x: -2, y: 20 }, { x: 45, y: 20 });
    const groundBarrow = speedOf("wheelbarrow", { x: -2, y: 20 }, { x: 45, y: 20 });
    expect(roadCart).toBeGreaterThan(roadBarrow);
    expect(groundBarrow).toBeGreaterThan(groundCart);
  });
});

describe("S8 — Auto con información conocida", () => {
  it("elige a pulso para algo ligero, carretilla para 40 kg, y porte coordinado para un colchón con equipo", () => {
    const base = world();
    let s = putLot(base.state, lot("lot-light", "seeds", 1, { kind: "world_point", point: { x: -6, y: 0 } }));
    s = putLot(s, lot("lot-heavy", "sheet_metal", 40, { kind: "world_point", point: { x: -6, y: -8 } }));
    s = putObject(s, makeWorldObject({ id: "obj-mattress", variant: "rest_furniture.mattress", location: { kind: "world_point", point: { x: -6, y: 8 } }, condition: 0.7, quality: 0.5, functionalState: "functional" }));
    s = putMeans(s, meansAt("means-barrow", "wheelbarrow", { x: 2, y: -6 }));
    const chosen = (target: SimulationCommand & { type: "order_contextual_action" } extends never ? never : TransportOrder["target"], team: string[] = []) => {
      const order = orderTransport(s, base.nav, { personId: base.p1, teamPersonIds: team, target, transportDestination: { kind: "world_point", point: { x: -30, y: 0 } } });
      const r = run(order.state, base.nav, 3);
      return r.state.jobs[order.jobId]!.transport!.method;
    };
    expect(chosen({ kind: "resource_lot", resourceLotId: "lot-light" })).toBe("hand_carry");
    expect(chosen({ kind: "resource_lot", resourceLotId: "lot-heavy" })).toBe("wheelbarrow");
    expect(chosen({ kind: "world_object", worldObjectId: "obj-mattress" }, [base.p2])).toBe("coordinated_carry");
  });
});

describe("S8 — zonas prohibidas: ni destino ni ruta se atraviesan en silencio", () => {
  it("bloquea un destino dentro de una zona prohibida y una ruta que solo existiría cruzándola", () => {
    const base = world();
    const s0 = putLot(base.state, lot("lot-light", "seeds", 1, { kind: "world_point", point: { x: -6, y: 0 } }));
    const zoned = applyCommandV2(s0, { commandId: "zone", type: "draw_zone", zoneId: "zone-no", policy: "forbidden", polygon: [{ x: -40, y: -60 }, { x: -25, y: -60 }, { x: -25, y: 60 }, { x: -40, y: 60 }] }, base.nav).state;
    const inside = orderTransport(zoned, base.nav, { personId: base.p1, commandId: "in", target: { kind: "resource_lot", resourceLotId: "lot-light" }, transportDestination: { kind: "world_point", point: { x: -30, y: 0 } } });
    expect(run(inside.state, base.nav, 3).state.jobs[inside.jobId]!.blockReasonKey).toBe("block.target_in_forbidden_zone");
    const across = orderTransport(zoned, base.nav, { personId: base.p1, commandId: "across", target: { kind: "resource_lot", resourceLotId: "lot-light" }, transportDestination: { kind: "world_point", point: { x: -50, y: 0 } } });
    expect(run(across.state, base.nav, 3).state.jobs[across.jobId]!.blockReasonKey).toBe("block.route_crosses_forbidden_zone");
  });

  it("una orden directa de otro método sobre un blanco en zona prohibida también se bloquea (deuda de DEC-0018 cerrada)", () => {
    const base = world();
    const s0 = putLot(base.state, lot("lot-food", "preserved_food", 2, { kind: "world_point", point: { x: -30, y: 0 } }));
    const zoned = applyCommandV2(s0, { commandId: "zone", type: "draw_zone", zoneId: "zone-no", policy: "forbidden", polygon: [{ x: -40, y: -10 }, { x: -25, y: -10 }, { x: -25, y: 10 }, { x: -40, y: 10 }] }, base.nav).state;
    const result = applyCommandV2(zoned, { type: "order_contextual_action", commandId: "collect", actionKey: "collect", personId: base.p1, teamPersonIds: [], target: { kind: "resource_lot", resourceLotId: "lot-food" } }, base.nav);
    const created = result.events.find((e) => e.type === "job_created")!;
    const jobId = created.type === "job_created" ? created.jobId : "";
    expect(run(result.state, base.nav, 3).state.jobs[jobId]!.blockReasonKey).toBe("block.target_in_forbidden_zone");
  });
});

describe("S8 — cooperación real también en el trabajo D (deuda de S4-S6)", () => {
  it("un desguace con ayudante presente termina antes que sin ella, sin superar el tope del 60 %", () => {
    const minutesFor = (team: string[]) => {
      const base = world();
      const barrow = meansAt("means-barrow", "wheelbarrow", { x: -3, y: 0 });
      const s = putMeans(base.state, barrow);
      const result = applyCommandV2(s, { type: "order_contextual_action", commandId: "d", actionKey: "disassemble_destructive", personId: base.p1, teamPersonIds: team, target: { kind: "transport_means", transportMeansId: "means-barrow" }, disassemblyScope: "destructive", confirmIrreversible: true }, base.nav);
      const created = result.events.find((e) => e.type === "job_created")!;
      const jobId = created.type === "job_created" ? created.jobId : "";
      const r = run(result.state, base.nav, 20000, STEP, done(jobId));
      expect(r.state.jobs[jobId]!.state).toBe("completed");
      return r.state.clock.elapsedSimSeconds;
    };
    const alone = minutesFor([]);
    const withHelper = minutesFor([world().p2]);
    expect(withHelper).toBeLessThan(alone);
    expect(withHelper).toBeGreaterThan(alone / 1.6 - 60);
  });
});

describe("S8 — perder una porteadora por necesidad crítica", () => {
  it("interrumpe con la carga sostenida donde está y replantea el traslado desde ahí, nunca desde el origen", () => {
    const base = world();
    const s = putLot(base.state, lot("lot-wood", "wood_and_planks", 5, { kind: "world_point", point: { x: -10, y: 0 } }));
    const order = orderTransport(s, base.nav, { personId: base.p1, target: { kind: "resource_lot", resourceLotId: "lot-wood" }, transportDestination: { kind: "world_point", point: { x: -50, y: 0 } } });
    const mid = run(order.state, base.nav, 20000, STEP, (st) => (st.jobs[order.jobId]!.transport!.travelledLoadedMeters ?? 0) > 12).state;
    const thirsty = { ...mid, people: { ...mid.people, [base.p1]: { ...mid.people[base.p1]!, needs: mid.people[base.p1]!.needs.map((n) => (n.dimension === "hydration" ? { ...n, value: 3, band: "critical" as const } : n)) } } };
    const position = thirsty.people[base.p1]!.public.position;
    const r = advanceSimulationV2(thirsty, STEP, base.nav);
    expect(r.events.some((e) => e.type === "work_interrupted" && e.jobId === order.jobId)).toBe(true);
    expect(r.events.some((e) => e.type === "load_deposited")).toBe(true);
    const lotLocation = r.state.resourceLots["lot-wood"]!.location;
    // Sin porteadora asignada, la carga queda depositada donde estaba (a ~12 m del origen), nunca en el origen.
    const point = lotLocation.kind === "world_point" ? lotLocation.point : lotLocation.kind === "carried_by_person" ? r.state.people[lotLocation.personId]!.public.position : { x: 0, y: 0 };
    expect(Math.hypot(point.x - position.x, point.y - position.y)).toBeLessThan(3);
    expect(Math.hypot(point.x + 10, point.y)).toBeGreaterThan(5);
    expect(r.state.jobs[order.jobId]!.state).toBe("interrupted");
    expect(violations(r.state)).toEqual([]);
  });
});

describe("S8 — ritmo y atención solo donde tienen efecto", () => {
  it("ritmo rápido ahorra tiempo de recorrido con más ruido; atención cuidadosa protege lo frágil en el carro", () => {
    const runWith = (pace: "normal" | "fast", attention: "standard" | "careful") => {
      const base = world();
      let s = putObject(base.state, makeWorldObject({ id: "obj-lantern", variant: "light_source.lantern", location: { kind: "world_point", point: { x: -4, y: 10 } }, condition: 0.9, quality: 0.5, functionalState: "functional" }));
      s = putMeans(s, meansAt("means-cart", "handcart", { x: -2, y: 8 }));
      const order = orderTransport(s, base.nav, { personId: base.p1, target: { kind: "world_object", worldObjectId: "obj-lantern" }, transportMethod: "handcart", pace, attention, transportDestination: { kind: "world_point", point: { x: -50, y: 10 } } });
      const r = run(order.state, base.nav, 20000, STEP, done(order.jobId));
      expect(r.state.jobs[order.jobId]!.state).toBe("completed");
      return { seconds: r.state.clock.elapsedSimSeconds, noise: r.state.jobs[order.jobId]!.transport!.noiseUnits, condition: r.state.worldObjects["obj-lantern"]!.condition };
    };
    const normal = runWith("normal", "standard");
    const fast = runWith("fast", "standard");
    const careful = runWith("normal", "careful");
    expect(fast.seconds).toBeLessThan(normal.seconds);
    expect(fast.noise).toBeGreaterThan(normal.noise);
    expect(normal.condition).toBeLessThan(0.9);
    expect(careful.condition).toBeGreaterThan(normal.condition);
  });
});
