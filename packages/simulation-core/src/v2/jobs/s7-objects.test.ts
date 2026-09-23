import { describe, expect, it } from "vitest";
import type { Container, DomainEventV2, Furniture, Place, ResourceLot, SimulationCommand, SimulationStateV2, TransportMeans, WorldObject } from "@z-world/contracts";
import { parseSimulationStateV2 } from "@z-world/contracts";
import { DECAY_TUNING_BY_FAMILY, DISASSEMBLY_PROFILES_BY_ID, OBJECT_CATALOG_BY_VARIANT } from "@z-world/catalogs";
import { applyCommandV2 } from "../apply-command-v2.js";
import { advanceSimulationV2 } from "../advance-simulation-v2.js";
import { buildFullNavigationIndexV2, type NavigationIndexV2 } from "../room-graph.js";
import { makeSyntheticBuildingState, TEST_HOUSE_IDS } from "../test-fixtures.js";
import { validateSimulationStateV2Invariants } from "../invariants.js";
import { applyResourceDecay, decayedCondition, freshnessBandFor } from "../objects/decay.js";
import { applyUseWear } from "../objects/wear.js";
import { canMergeResourceLots, containerUsedUnits, mergeResourceLots, resolveHolderPersonId, splitResourceLot } from "../objects/storage.js";
import { makeResourceLot, makeWorldObject } from "../generator/buildings.js";
import { makeTransportMeans } from "../generator/scenario.js";
import { createInitialStateV2 } from "../create-initial-state-v2.js";

/**
 * Pruebas de la Puerta A (S7) que cierran la deuda registrada tras los tres
 * primeros commits parciales: almacenar/retirar en contenedores reales con
 * capacidad, reservas profundas exclusivas, bomba de agua (prueba,
 * avería, reparación causal, extracción real de agua, desmontaje),
 * carretilla/carro como objeto completo (avería, reparación, desmontaje),
 * deterioro determinista del alimento fresco y pertenencias SCN-003.
 */

const RELEVANT_INVARIANTS = new Set([
  "container_content_location_mismatch",
  "container_over_capacity",
  "contained_item_not_listed",
  "orphan_container_content",
  "double_exclusive_reservation",
  "job_reservation_not_bidirectional",
  "parts_only_with_functions",
  "negative_quantity",
]);

function relevantViolations(state: SimulationStateV2): string[] {
  return validateSimulationStateV2Invariants(state)
    .violations.filter((v) => RELEVANT_INVARIANTS.has(v.code))
    .map((v) => `${v.code}: ${v.message}`);
}

/** Mundo sintético limpio: solo sobreviven las pertenencias que llevan las personas (el resto de objetos del pueblo generado no existe en este mundo de dos estancias). */
function cleanBase(seed: string): SimulationStateV2 {
  const base = makeSyntheticBuildingState(seed);
  const worldObjects = Object.fromEntries(Object.values(base.worldObjects).filter((o) => resolveHolderPersonId(base, o.location)).map((o) => [o.id, o]));
  const withObjects = { ...base, worldObjects };
  const containers = Object.fromEntries(Object.values(base.containers).filter((c) => c.hostWorldObjectId && worldObjects[c.hostWorldObjectId]).map((c) => [c.id, c]));
  const resourceLots = Object.fromEntries(Object.values(base.resourceLots).filter((l) => resolveHolderPersonId({ ...withObjects, containers }, l.location)).map((l) => [l.id, l]));
  // Necesidades cubiertas: estas pruebas miden objetos, no la autoprotección de S6.
  const people = Object.fromEntries(Object.entries(base.people).map(([id, p]) => [id, { ...p, needs: p.needs.map((n) => ({ ...n, value: 100, band: "stable" as const })) }]));
  return { ...base, people, worldObjects, containers, resourceLots, furniture: {}, transportMeans: {} };
}

/** Persona con más mecánica, colocada en el origen: la reparación B depende de la capacidad real (§12.6), no de quién sea la primera de la cohorte. */
function bestMechanicAtOrigin(state: SimulationStateV2): { state: SimulationStateV2; personId: string } {
  const personId = [...state.peopleOrder].sort((a, b) => (state.people[b]!.public.skills.mechanics ?? 0) - (state.people[a]!.public.skills.mechanics ?? 0))[0]!;
  const person = state.people[personId]!;
  const moved = {
    ...person,
    location: { kind: "world_point" as const, point: { x: 0, y: 0 } },
    public: { ...person.public, position: { x: 0, y: 0 }, activeMovementOrder: null, priorities: { ...person.public.priorities, repair: 1 as const, water_supply: 1 as const } },
  };
  return { state: { ...state, people: { ...state.people, [personId]: moved } }, personId };
}

function lot(id: string, family: ResourceLot["family"], quantity: number, location: ResourceLot["location"], extra: Partial<ResourceLot> = {}): ResourceLot {
  return { ...makeResourceLot({ id, family, quantity, unit: family === "water" ? "liter" : family === "fresh_food" || family === "preserved_food" ? "unit" : "kilogram", location, condition: 0.8, provenance: "test" }), ...extra };
}

function withWardrobe(state: SimulationStateV2, capacityUnits = 20): { state: SimulationStateV2; furnitureId: string; containerId: string } {
  const furnitureId = "furniture-s7-wardrobe";
  const containerId = "container-s7-wardrobe";
  const container: Container = { id: containerId, location: { kind: "room", roomId: TEST_HOUSE_IDS.hallwayRoomId }, capacityUnits, contentIds: [], hostFurnitureId: furnitureId, hostWorldObjectId: null, acceptedHandlingTags: null };
  const entry = OBJECT_CATALOG_BY_VARIANT.get("storage_furniture.wardrobe")!;
  const wardrobe: Furniture = {
    id: furnitureId,
    roomId: TEST_HOUSE_IDS.hallwayRoomId,
    kind: "furniture.wardrobe",
    condition: 0.6,
    functionalState: "functional",
    family: "storage_furniture",
    variant: entry.variant,
    weightKg: entry.defaultWeightKg,
    bulk: "bulky",
    quality: 0.5,
    capacityUnits,
    containerId,
    movedToLocation: null,
    handlingTags: [...entry.defaultHandlingTags],
    functions: ["storage"],
    inactiveFunctionReasons: {},
    repairProfileId: entry.repairProfileId,
    disassemblyProfileId: entry.disassemblyProfileId,
    provenance: "test",
    knownEvidenceIds: [],
  };
  return { state: { ...state, furniture: { ...state.furniture, [furnitureId]: wardrobe }, containers: { ...state.containers, [containerId]: container } }, furnitureId, containerId };
}

function putObject(state: SimulationStateV2, obj: WorldObject): SimulationStateV2 {
  let containers = state.containers;
  if (obj.location.kind === "container") {
    const c = containers[obj.location.containerId]!;
    containers = { ...containers, [c.id]: { ...c, contentIds: [...c.contentIds, obj.id] } };
  }
  return { ...state, containers, worldObjects: { ...state.worldObjects, [obj.id]: obj } };
}

function putLot(state: SimulationStateV2, l: ResourceLot): SimulationStateV2 {
  let containers = state.containers;
  if (l.location.kind === "container") {
    const c = containers[l.location.containerId]!;
    containers = { ...containers, [c.id]: { ...c, contentIds: [...c.contentIds, l.id] } };
  }
  return { ...state, containers, resourceLots: { ...state.resourceLots, [l.id]: l } };
}

function run(state: SimulationStateV2, nav: NavigationIndexV2, ticks: number, secondsPerTick = 1, onTick?: (s: SimulationStateV2) => void) {
  let current = state;
  const events: DomainEventV2[] = [];
  for (let i = 0; i < ticks; i++) {
    const result = advanceSimulationV2(current, secondsPerTick, nav);
    current = result.state;
    events.push(...result.events);
    onTick?.(current);
  }
  return { state: current, events };
}

function order(state: SimulationStateV2, nav: NavigationIndexV2, command: Omit<Extract<SimulationCommand, { type: "order_contextual_action" }>, "type" | "teamPersonIds"> & { teamPersonIds?: string[] }) {
  const result = applyCommandV2(state, { type: "order_contextual_action", teamPersonIds: [], ...command }, nav);
  const created = result.events.find((e) => e.type === "job_created");
  if (!created || created.type !== "job_created") throw new Error("No se creó el trabajo.");
  return { state: result.state, jobId: created.jobId };
}

function unpause(state: SimulationStateV2, nav: NavigationIndexV2): SimulationStateV2 {
  return applyCommandV2(state, { commandId: "unpause", type: "set_pause", paused: false }, nav).state;
}

describe("S7 — almacenar y retirar de un contenedor real (CAT-005 §4.4)", () => {
  it("retira un objeto del armario y lo vuelve a guardar: ubicación única, jerarquía bidireccional y eventos", () => {
    const { state: withW, containerId } = withWardrobe(cleanBase("s7-store-1"));
    const bottle = makeWorldObject({ id: "object-s7-bottle", variant: "personal_liquid_container.bottle", location: { kind: "container", containerId }, condition: 0.7, quality: 0.5, functionalState: "functional" });
    let state = unpause(putObject(withW, bottle), buildFullNavigationIndexV2(withW.world));
    const nav = buildFullNavigationIndexV2(state.world);
    const personId = state.peopleOrder[0]!;

    const retrieve = order(state, nav, { commandId: "r1", personId, actionKey: "retrieve_from_storage", target: { kind: "container", containerId }, storageItem: { kind: "world_object", id: bottle.id } });
    const afterRetrieve = run(retrieve.state, nav, 80, 1, (s) => expect(relevantViolations(s)).toEqual([]));
    expect(afterRetrieve.state.jobs[retrieve.jobId]!.state).toBe("completed");
    expect(afterRetrieve.state.worldObjects[bottle.id]!.location).toEqual({ kind: "carried_by_person", personId });
    expect(afterRetrieve.state.containers[containerId]!.contentIds).not.toContain(bottle.id);
    expect(afterRetrieve.events.some((e) => e.type === "object_retrieved" && e.objectId === bottle.id && e.containerId === containerId)).toBe(true);

    state = afterRetrieve.state;
    const store = order(state, nav, { commandId: "s1", personId, actionKey: "store", target: { kind: "container", containerId }, storageItem: { kind: "world_object", id: bottle.id } });
    const afterStore = run(store.state, nav, 20, 1, (s) => expect(relevantViolations(s)).toEqual([]));
    expect(afterStore.state.jobs[store.jobId]!.state).toBe("completed");
    expect(afterStore.state.worldObjects[bottle.id]!.location).toEqual({ kind: "container", containerId });
    expect(afterStore.state.containers[containerId]!.contentIds).toContain(bottle.id);
    expect(afterStore.events.some((e) => e.type === "object_stored" && e.objectId === bottle.id && e.entityKind === "world_object")).toBe(true);
    // Las reservas del contenedor y del objeto se liberan al cerrar.
    expect(Object.values(afterStore.state.reservations).filter((r) => r.jobId === store.jobId)).toEqual([]);
    expect(afterStore.state.worldObjects[bottle.id]!.ownerOrReservedByJobId).toBeNull();
  });

  it("guarda un lote de recurso que lleva la persona y respeta la capacidad", () => {
    const { state: withW, containerId } = withWardrobe(cleanBase("s7-store-2"));
    const personId = withW.peopleOrder[0]!;
    const wood = lot("resource-lot-s7-wood", "wood_and_planks", 4, { kind: "carried_by_person", personId });
    const state = unpause(putLot(withW, wood), buildFullNavigationIndexV2(withW.world));
    const nav = buildFullNavigationIndexV2(state.world);
    const store = order(state, nav, { commandId: "s1", personId, actionKey: "store", target: { kind: "container", containerId }, storageItem: { kind: "resource_lot", id: wood.id } });
    const { state: finalState, events } = run(store.state, nav, 80);
    expect(finalState.jobs[store.jobId]!.state).toBe("completed");
    expect(finalState.resourceLots[wood.id]!.location).toEqual({ kind: "container", containerId });
    expect(events.some((e) => e.type === "object_stored" && e.entityKind === "resource_lot")).toBe(true);
    expect(containerUsedUnits(finalState, finalState.containers[containerId]!)).toBe(1);
  });

  it("un contenedor lleno bloquea con motivo explícito y nunca sobrecarga en silencio", () => {
    const { state: withW, containerId } = withWardrobe(cleanBase("s7-store-full"), 2);
    const personId = withW.peopleOrder[0]!;
    const filler = makeWorldObject({ id: "object-s7-filler", variant: "work_container.bucket", location: { kind: "container", containerId }, condition: 0.7, quality: 0.5, functionalState: "functional" });
    const bottle = makeWorldObject({ id: "object-s7-bottle-2", variant: "personal_liquid_container.bottle", location: { kind: "carried_by_person", personId }, condition: 0.7, quality: 0.5, functionalState: "functional" });
    let state = putObject(putObject(withW, filler), bottle);
    const nav = buildFullNavigationIndexV2(state.world);
    state = unpause(state, nav);
    const store = order(state, nav, { commandId: "s1", personId, actionKey: "store", target: { kind: "container", containerId }, storageItem: { kind: "world_object", id: bottle.id } });
    const { state: finalState, events } = run(store.state, nav, 30, 1, (s) => expect(relevantViolations(s)).toEqual([]));
    expect(finalState.jobs[store.jobId]!.state).toBe("blocked");
    expect(finalState.jobs[store.jobId]!.blockReasonKey).toBe("block.container_full");
    expect(finalState.worldObjects[bottle.id]!.location).toEqual({ kind: "carried_by_person", personId });
    expect(events.some((e) => e.type === "object_stored")).toBe(false);
    // El bloqueo no se reanuda y vuelve a bloquear cada tick (sin telemetría por tick).
    const stateChanges = events.filter((e) => e.type === "job_state_changed" && e.jobId === store.jobId);
    expect(stateChanges.length).toBeLessThan(8);
  });

  it("almacenar algo que no está en el lugar exige transporte (S8), nunca lo teletransporta", () => {
    const { state: withW, containerId } = withWardrobe(cleanBase("s7-store-remote"));
    const remote = makeWorldObject({ id: "object-s7-remote", variant: "personal_liquid_container.canteen", location: { kind: "world_point", point: { x: -40, y: -40 } }, condition: 0.7, quality: 0.5, functionalState: "functional" });
    let state = putObject(withW, remote);
    const nav = buildFullNavigationIndexV2(state.world);
    state = unpause(state, nav);
    const personId = state.peopleOrder[0]!;
    const store = order(state, nav, { commandId: "s1", personId, actionKey: "store", target: { kind: "container", containerId }, storageItem: { kind: "world_object", id: remote.id } });
    const { state: finalState } = run(store.state, nav, 60);
    expect(finalState.jobs[store.jobId]!.blockReasonKey).toBe("block.item_not_at_storage_site");
    expect(finalState.worldObjects[remote.id]!.location).toEqual(remote.location);
  });
});

describe("S7 — reservas profundas exclusivas de objeto/contenedor", () => {
  it("dos trabajos sobre el mismo contenedor nunca lo reservan a la vez", () => {
    const { state: withW, containerId } = withWardrobe(cleanBase("s7-reserve-1"));
    const [personA, personB] = withW.peopleOrder;
    const a = makeWorldObject({ id: "object-s7-a", variant: "personal_liquid_container.bottle", location: { kind: "carried_by_person", personId: personA! }, condition: 0.7, quality: 0.5, functionalState: "functional" });
    const b = makeWorldObject({ id: "object-s7-b", variant: "personal_liquid_container.bottle", location: { kind: "carried_by_person", personId: personB! }, condition: 0.7, quality: 0.5, functionalState: "functional" });
    // Ambas personas en el pasillo para que ninguna tenga que viajar.
    const hallway = { kind: "room" as const, roomId: TEST_HOUSE_IDS.hallwayRoomId };
    let state = putObject(putObject(withW, a), b);
    state = {
      ...state,
      people: Object.fromEntries(Object.entries(state.people).map(([id, p]) => [id, id === personA || id === personB ? { ...p, location: hallway, public: { ...p.public, position: { x: 12, y: 0 } } } : p])),
    };
    const nav = buildFullNavigationIndexV2(state.world);
    state = unpause(state, nav);
    const jobA = order(state, nav, { commandId: "a", personId: personA!, actionKey: "store", target: { kind: "container", containerId }, storageItem: { kind: "world_object", id: a.id } });
    const jobB = order(jobA.state, nav, { commandId: "b", personId: personB!, actionKey: "store", target: { kind: "container", containerId }, storageItem: { kind: "world_object", id: b.id } });

    let sawBlockedByReservation = false;
    const { state: finalState } = run(jobB.state, nav, 30, 1, (s) => {
      expect(relevantViolations(s)).toEqual([]);
      const containerReservations = Object.values(s.reservations).filter((r) => r.targetKind === "container" && r.targetId === containerId);
      expect(containerReservations.length).toBeLessThanOrEqual(1);
      if (s.jobs[jobB.jobId]!.blockReasonKey === "block.target_reserved") sawBlockedByReservation = true;
    });
    expect(sawBlockedByReservation).toBe(true);
    // Al liberarse la reserva del primero, el segundo la adquiere y termina.
    expect(finalState.jobs[jobA.jobId]!.state).toBe("completed");
    expect(finalState.jobs[jobB.jobId]!.state).toBe("completed");
    expect(finalState.containers[containerId]!.contentIds).toEqual(expect.arrayContaining([a.id, b.id]));
  });

  it("la invariante detecta una doble reserva exclusiva de contenedor", () => {
    const { state: withW, containerId } = withWardrobe(cleanBase("s7-reserve-inv"));
    const reservation = (id: string, jobId: string) => ({ id, targetKind: "container" as const, targetId: containerId, quantity: null, jobId, phase: "reserve" as const, releasePolicy: "on_job_end" as const, createdAtSimSeconds: 0 });
    const state: SimulationStateV2 = { ...withW, reservations: { r1: reservation("r1", "job-x"), r2: reservation("r2", "job-y") } };
    const codes = validateSimulationStateV2Invariants(state).violations.map((v) => v.code);
    expect(codes).toContain("double_exclusive_reservation");
  });
});

/** Fuente ENV-01 real con su nodo hídrico, al oeste de la casa sintética. */
function withWell(state: SimulationStateV2): SimulationStateV2 {
  const place: Place = { id: "place-s7-well", profileId: "ENV-01", position: { x: -20, y: 0 }, buildingId: null };
  return {
    ...state,
    world: {
      ...state.world,
      places: { ...state.world.places, [place.id]: place },
      nodes: { ...state.world.nodes, "node-s7-well": { id: "node-s7-well", kind: "water_source", position: { x: -20, y: 0 }, placeId: place.id, labelKey: "water_source.communal_well" } },
    },
  };
}

function withPump(state: SimulationStateV2, broken: boolean): { state: SimulationStateV2; pumpId: string; bucketId: string } {
  const pumpBase = makeWorldObject({ id: "object-s7-pump", variant: "technical_installation.hand_pump", location: { kind: "world_point", point: { x: -19, y: 0 } }, condition: broken ? 0.18 : 0.6, quality: 0.5, functionalState: broken ? "broken" : "degraded" });
  const pump: WorldObject = { ...pumpBase, functions: broken ? [] : ["water_pumping"], inactiveFunctionReasons: broken ? { water_pumping: "worn_seal" } : {}, installedAt: { placeId: "place-s7-well", nodeId: "node-s7-well" } };
  const bucket = makeWorldObject({ id: "object-s7-bucket", variant: "work_container.bucket", location: { kind: "world_point", point: { x: -18, y: 1 } }, condition: 0.7, quality: 0.5, functionalState: "functional" });
  return { state: putObject(putObject(withWell(state), pump), bucket), pumpId: pump.id, bucketId: bucket.id };
}

describe("S7 — bomba de agua (demostrador profundo CAT-005 §3.2)", () => {
  it("una bomba averiada nunca produce agua: extraer queda bloqueado con motivo causal", () => {
    const { state: withP, pumpId } = withPump(cleanBase("s7-pump-1"), true);
    const nav = buildFullNavigationIndexV2(withP.world);
    const state = unpause(withP, nav);
    const personId = state.peopleOrder[0]!;
    const draw = order(state, nav, { commandId: "d1", personId, actionKey: "draw_water", target: { kind: "world_object", worldObjectId: pumpId } });
    const { state: finalState, events } = run(draw.state, nav, 60);
    expect(finalState.jobs[draw.jobId]!.state).toBe("blocked");
    expect(finalState.jobs[draw.jobId]!.blockReasonKey).toBe("block.installation_not_functional");
    expect(events.some((e) => e.type === "water_drawn")).toBe(false);
  });

  it("probar la instalación registra su estado real sin cambiarlo", () => {
    const { state: withP, pumpId } = withPump(cleanBase("s7-pump-test"), true);
    const nav = buildFullNavigationIndexV2(withP.world);
    const state = unpause(withP, nav);
    const personId = state.peopleOrder[0]!;
    const test = order(state, nav, { commandId: "t1", personId, actionKey: "test_installation", target: { kind: "world_object", worldObjectId: pumpId } });
    const { state: finalState, events } = run(test.state, nav, 60, 15);
    expect(finalState.jobs[test.jobId]!.state).toBe("completed");
    const tested = events.find((e) => e.type === "installation_tested");
    expect(tested && tested.type === "installation_tested" && tested.functionalState).toBe("broken");
    expect(tested && tested.type === "installation_tested" && tested.inactiveFunctionKeys).toEqual(["water_pumping"]);
    expect(finalState.worldObjects[pumpId]!.functionalState).toBe("broken");
    expect(finalState.worldObjects[pumpId]!.knownEvidenceIds.some((e) => e.startsWith("tested@"))).toBe(true);
  });

  it("repara con piezas mecánicas I y chapa concretas, recupera el bombeo, llena el cubo y se avería por desgaste determinista", () => {
    const { state: withPumpOnly, pumpId, bucketId } = withPump(cleanBase("s7-pump-repair-2"), true);
    const { state: withP, personId } = bestMechanicAtOrigin(withPumpOnly);
    // Materiales concretos: los lleva la propia persona ejecutora (nunca una pila universal).
    let state = putLot(withP, lot("resource-lot-s7-parts", "mechanical_parts_i", 2, { kind: "carried_by_person", personId }));
    state = putLot(state, lot("resource-lot-s7-sheet", "sheet_metal", 1, { kind: "carried_by_person", personId }));
    const nav = buildFullNavigationIndexV2(state.world);
    state = unpause(state, nav);

    // Sin diagnóstico previo, la reparación de una instalación queda bloqueada (§6.8).
    const early = order(state, nav, { commandId: "early", personId, actionKey: "repair", target: { kind: "world_object", worldObjectId: pumpId } });
    const blockedEarly = run(early.state, nav, 40, 5);
    expect(blockedEarly.state.jobs[early.jobId]!.blockReasonKey).toBe("block.requires_diagnosis");
    expect(blockedEarly.state.resourceLots["resource-lot-s7-parts"]!.quantity).toBe(2);
    state = applyCommandV2(blockedEarly.state, { commandId: "cancel-early", type: "cancel_job", jobId: early.jobId }, nav).state;
    const test = order(state, nav, { commandId: "test", personId, actionKey: "test_installation", target: { kind: "world_object", worldObjectId: pumpId } });
    state = run(test.state, nav, 40, 1).state; // cada paso de 1 s real son 72 s simulados a ×1
    expect(state.jobs[test.jobId]!.state).toBe("completed");

    const repair = order(state, nav, { commandId: "rep", personId, actionKey: "repair", target: { kind: "world_object", worldObjectId: pumpId } });
    const afterRepair = run(repair.state, nav, 80, 1);
    expect(afterRepair.state.jobs[repair.jobId]!.state).toBe("completed");
    const repaired = afterRepair.events.find((e) => e.type === "object_repaired");
    // Completa → funcional; provisional → degradada. Ambas recuperan el bombeo (causa reparable: junta gastada).
    expect(repaired && repaired.type === "object_repaired" && ["complete", "provisional"].includes(repaired.outcome)).toBe(true);
    const pumpAfterRepair = afterRepair.state.worldObjects[pumpId]!;
    expect(["functional", "degraded"]).toContain(pumpAfterRepair.functionalState);
    expect(pumpAfterRepair.functions).toContain("water_pumping");
    expect(pumpAfterRepair.inactiveFunctionReasons).toEqual({});
    // Consumió exactamente la receta: 1 pieza mecánica I (quedan 1) y 1 chapa (agotada).
    expect(afterRepair.state.resourceLots["resource-lot-s7-parts"]!.quantity).toBe(1);
    expect(afterRepair.state.resourceLots["resource-lot-s7-sheet"]).toBeUndefined();

    // Extraer agua: llena un recipiente real (la cantimplora/botella que lleva o el cubo al pie).
    let current = afterRepair.state;
    let totalDrawn = 0;
    let brokeDown = false;
    for (let i = 0; i < 20 && !brokeDown; i++) {
      // Vacía el cubo entre extracciones para que siempre haya hueco (lo que se mide es el desgaste).
      current = { ...current, resourceLots: Object.fromEntries(Object.entries(current.resourceLots).filter(([, l]) => !(l.family === "water" && l.location.kind === "on_object"))) };
      current = { ...current, people: Object.fromEntries(Object.entries(current.people).map(([id, p]) => [id, { ...p, needs: p.needs.map((n) => ({ ...n, value: 100, band: "stable" as const })) }])) };
      const draw = order(current, nav, { commandId: `draw-${i}`, personId, actionKey: "draw_water", target: { kind: "world_object", worldObjectId: pumpId } });
      const result = run(draw.state, nav, 30, 1);
      current = result.state;
      for (const e of result.events) {
        if (e.type === "water_drawn") totalDrawn += e.quantity;
        if (e.type === "object_broke_down") brokeDown = true;
      }
      if (!brokeDown) expect(current.jobs[draw.jobId]!.state).toBe("completed");
    }
    expect(totalDrawn).toBeGreaterThan(0);
    expect(brokeDown).toBe(true);
    const worn = current.worldObjects[pumpId]!;
    expect(worn.functionalState).toBe("broken");
    expect(worn.inactiveFunctionReasons.water_pumping).toBe("worn_out");
    expect(current.worldObjects[bucketId]).toBeDefined();

    // Averiada otra vez: no hay más agua hasta repararla de nuevo.
    const again = order(current, nav, { commandId: "again", personId, actionKey: "draw_water", target: { kind: "world_object", worldObjectId: pumpId } });
    const blocked = run(again.state, nav, 20, 30);
    expect(blocked.state.jobs[again.jobId]!.blockReasonKey).toBe("block.installation_not_functional");
    expect(blocked.events.some((e) => e.type === "water_drawn")).toBe(false);
  });

  it("el desgaste es determinista: mismo número de usos, misma condición y mismo punto de avería", () => {
    const entry = OBJECT_CATALOG_BY_VARIANT.get("technical_installation.hand_pump")!;
    let pump = { condition: 0.6, functionalState: "functional" as const, functions: ["water_pumping"], inactiveFunctionReasons: {} as Record<string, string> };
    let uses = 0;
    let broke = false;
    while (!broke && uses < 50) {
      const r = applyUseWear(pump, entry.wear!);
      pump = r.entity as typeof pump;
      broke = r.brokeDown;
      uses += 1;
    }
    // 0.6 − 0.06·n < 0.25 ⇒ n = 6.
    expect(uses).toBe(6);
    expect(applyUseWear({ condition: 0.6, functionalState: "functional", functions: ["water_pumping"], inactiveFunctionReasons: {} }, entry.wear!, 6).brokeDown).toBe(true);
  });

  it("desmontar la bomba inutiliza el servicio para siempre y conserva masa", () => {
    const { state: withP, pumpId } = withPump(cleanBase("s7-pump-dis"), false);
    const nav = buildFullNavigationIndexV2(withP.world);
    const state = unpause(withP, nav);
    const personId = state.peopleOrder[0]!;
    const dis = order(state, nav, { commandId: "dis", personId, actionKey: "disassemble_destructive", target: { kind: "world_object", worldObjectId: pumpId }, disassemblyScope: "destructive", confirmIrreversible: true });
    const { state: finalState, events } = run(dis.state, nav, 200, 15);
    expect(finalState.jobs[dis.jobId]!.state).toBe("completed");
    const pump = finalState.worldObjects[pumpId]!;
    expect(pump.functionalState).toBe("parts_only");
    expect(pump.functions).toEqual([]);
    expect(pump.inactiveFunctionReasons.water_pumping).toBe("disassembled");
    const disassembled = events.find((e) => e.type === "object_disassembled");
    const produced = disassembled && disassembled.type === "object_disassembled" ? disassembled.producedResourceLotIds.map((id) => finalState.resourceLots[id]!) : [];
    const producedMass = produced.reduce((acc, l) => acc + l.quantity, 0);
    expect(producedMass).toBeLessThanOrEqual(OBJECT_CATALOG_BY_VARIANT.get("technical_installation.hand_pump")!.defaultWeightKg);
    expect(relevantViolations(finalState)).toEqual([]);

    const draw = order(finalState, nav, { commandId: "draw", personId, actionKey: "draw_water", target: { kind: "world_object", worldObjectId: pumpId } });
    const after = run(draw.state, nav, 20, 15);
    expect(after.state.jobs[draw.jobId]!.blockReasonKey).toBe("block.installation_not_functional");
  });
});

function withCart(state: SimulationStateV2, method: "wheelbarrow" | "handcart", condition: number): { state: SimulationStateV2; transportId: string } {
  const means: TransportMeans = makeTransportMeans("transport-s7-cart", method, { kind: "world_point", point: { x: -5, y: 5 } }, 80, condition);
  return { state: { ...state, transportMeans: { ...state.transportMeans, [means.id]: means } }, transportId: means.id };
}

describe("S7 — carretilla/carro como objeto completo (demostrador profundo CAT-005 §3.2)", () => {
  it("una carretilla con la rueda rota se repara con piezas concretas y recupera su función de carga", () => {
    const { state: withC, transportId } = withCart(cleanBase("s7-cart-2"), "wheelbarrow", 0.45);
    expect(withC.transportMeans[transportId]!.functionalState).toBe("broken");
    expect(withC.transportMeans[transportId]!.inactiveFunctionReasons.hauling).toBe("broken_wheel");
    const personId = withC.peopleOrder[0]!;
    let state = putLot(withC, lot("resource-lot-s7-cparts", "mechanical_parts_i", 1, { kind: "carried_by_person", personId }));
    state = putLot(state, lot("resource-lot-s7-csheet", "sheet_metal", 1, { kind: "world_point", point: { x: -4, y: 5 } }));
    const nav = buildFullNavigationIndexV2(state.world);
    state = unpause(state, nav);
    const repair = order(state, nav, { commandId: "rep", personId, actionKey: "repair", target: { kind: "transport_means", transportMeansId: transportId } });
    const { state: finalState, events } = run(repair.state, nav, 200, 15);
    expect(finalState.jobs[repair.jobId]!.state).toBe("completed");
    expect(events.some((e) => e.type === "object_repaired" && e.entityKind === "transport_means")).toBe(true);
    const cart = finalState.transportMeans[transportId]!;
    expect(["functional", "degraded"]).toContain(cart.functionalState);
    expect(cart.functions).toContain("hauling");
    expect(cart.inactiveFunctionReasons.hauling).toBeUndefined();
    expect(finalState.resourceLots["resource-lot-s7-cparts"]).toBeUndefined();
    expect(finalState.resourceLots["resource-lot-s7-csheet"]).toBeUndefined();
  });

  it("sin materiales en el lugar, la reparación queda bloqueada (nunca pila universal)", () => {
    const { state: withC, transportId } = withCart(cleanBase("s7-cart-nomat"), "handcart", 0.4);
    const nav = buildFullNavigationIndexV2(withC.world);
    const state = unpause(withC, nav);
    const personId = state.peopleOrder[0]!;
    const repair = order(state, nav, { commandId: "rep", personId, actionKey: "repair", target: { kind: "transport_means", transportMeansId: transportId } });
    const { state: finalState } = run(repair.state, nav, 60, 5);
    expect(finalState.jobs[repair.jobId]!.blockReasonKey).toBe("block.missing_materials");
    expect(finalState.transportMeans[transportId]!.functionalState).toBe("broken");
  });

  it("desmontaje selectivo y desguace destructivo producen resultados distintos y comprensibles, sin superar la masa", () => {
    const results: Record<string, Record<string, number>> = {};
    for (const scope of ["selective", "destructive"] as const) {
      const { state: withC, transportId } = withCart(cleanBase(`s7-cart-dis-${scope}`), "wheelbarrow", 0.8);
      const nav = buildFullNavigationIndexV2(withC.world);
      const state = unpause(withC, nav);
      const personId = state.peopleOrder[0]!;
      const actionKey = scope === "selective" ? "disassemble_selective" : "disassemble_destructive";
      const dis = order(state, nav, { commandId: "dis", personId, actionKey, target: { kind: "transport_means", transportMeansId: transportId }, disassemblyScope: scope, confirmIrreversible: true });
      const { state: finalState, events } = run(dis.state, nav, 300, 15);
      expect(finalState.jobs[dis.jobId]!.state).toBe("completed");
      const cart = finalState.transportMeans[transportId]!;
      expect(cart.functionalState).toBe("parts_only");
      expect(cart.functions).toEqual([]);
      expect(cart.inactiveFunctionReasons.hauling).toBe("disassembled");
      const disassembled = events.find((e) => e.type === "object_disassembled");
      expect(disassembled && disassembled.type === "object_disassembled" && disassembled.entityKind).toBe("transport_means");
      const byFamily: Record<string, number> = {};
      for (const id of disassembled && disassembled.type === "object_disassembled" ? disassembled.producedResourceLotIds : []) {
        const l = finalState.resourceLots[id]!;
        byFamily[l.family] = (byFamily[l.family] ?? 0) + l.quantity;
      }
      results[scope] = byFamily;
      expect(relevantViolations(finalState)).toEqual([]);
    }
    const profile = DISASSEMBLY_PROFILES_BY_ID.get("disassembly.human_transport.wheelbarrow.v1")!;
    for (const output of profile.outputs) {
      expect(results.selective![output.resourceFamily] ?? 0).toBe(output.selectiveQuantity);
      expect(results.destructive![output.resourceFamily] ?? 0).toBe(output.destructiveQuantity);
    }
    // Selectivo conserva más piezas mecánicas; destructivo saca más chapa.
    expect(results.selective!.mechanical_parts_i!).toBeGreaterThan(results.destructive!.mechanical_parts_i!);
    expect(results.destructive!.sheet_metal!).toBeGreaterThan(results.selective!.sheet_metal!);
  });

  it("la avería por desgaste del medio es determinista (preparada para el uso logístico de S8)", () => {
    const entry = OBJECT_CATALOG_BY_VARIANT.get("human_transport.handcart")!;
    const cart = makeTransportMeans("t", "handcart", { kind: "world_point", point: { x: 0, y: 0 } }, 80, 0.6);
    expect(cart.functionalState).toBe("degraded");
    const worn = applyUseWear(cart, entry.wear!, 20);
    expect(worn.brokeDown).toBe(true);
    expect(worn.entity.functionalState).toBe("broken");
    expect(worn.entity.functions).not.toContain("hauling");
  });
});

describe("S7 — deterioro determinista del alimento fresco (§6.6)", () => {
  function withFreshFood(seed: string, start: number, c0: number): { state: SimulationStateV2; lotId: string } {
    const base = cleanBase(seed);
    const lotId = "resource-lot-s7-fresh";
    const l = lot(lotId, "fresh_food", 3, { kind: "room", roomId: TEST_HOUSE_IDS.hallwayRoomId }, { condition: c0, decayStartedAtSimSeconds: start, conditionAtDecayStart: c0 });
    return { state: putLot(base, l), lotId };
  }

  it("la condición es función cerrada del tiempo: pasos grandes o pequeños dan exactamente lo mismo (sin doble contabilización)", () => {
    const { state: base, lotId } = withFreshFood("s7-decay-1", 0, 0.9);
    const nav = buildFullNavigationIndexV2(base.world);
    const state = unpause(base, nav);
    const fine = run(state, nav, 600, 6).state; // 600 pasos de 6 s
    const coarse = run(state, nav, 4, 900).state; // 4 pasos de 900 s
    expect(fine.clock.elapsedSimSeconds).toBe(coarse.clock.elapsedSimSeconds);
    expect(fine.resourceLots[lotId]!.condition).toBe(coarse.resourceLots[lotId]!.condition);
    // Recalcular en el mismo instante no vuelve a descontar nada.
    const again = applyResourceDecay(fine);
    expect(again.state.resourceLots[lotId]!.condition).toBe(fine.resourceLots[lotId]!.condition);
    expect(again.events).toEqual([]);
    const tuning = DECAY_TUNING_BY_FAMILY.get("fresh_food")!;
    expect(fine.resourceLots[lotId]!.condition).toBe(decayedCondition(tuning, 0.9, 0, fine.clock.elapsedSimSeconds));
  });

  it("emite un único evento por cambio de banda y un alimento echado a perder no es consumible", () => {
    const tuning = DECAY_TUNING_BY_FAMILY.get("fresh_food")!;
    // Empezó a deteriorarse hace tanto que está a punto de cruzar a «echado a perder».
    const { state: base, lotId } = withFreshFood("s7-decay-2", 0, 0.9);
    const nav = buildFullNavigationIndexV2(base.world);
    let state = unpause(base, nav);
    const hoursToSpoil = tuning.shelfLifeSimHours * (1 - tuning.spoiledBelowCondition / 0.9);
    state = { ...state, clock: { ...state.clock, elapsedSimSeconds: Math.floor(hoursToSpoil * 3600) - 120 } };
    const { state: finalState, events } = run(state, nav, 20, 30);
    const bandEvents = events.filter((e) => e.type === "resource_lot_deteriorated" && e.resourceLotId === lotId);
    expect(bandEvents.map((e) => (e.type === "resource_lot_deteriorated" ? e.band : null))).toEqual(["deteriorating", "spoiled"].slice(-bandEvents.length));
    expect(freshnessBandFor(finalState.resourceLots[lotId]!)).toBe("spoiled");

    const personId = finalState.peopleOrder[0]!;
    const eat = order(finalState, nav, { commandId: "eat", personId, actionKey: "eat", target: { kind: "resource_lot", resourceLotId: lotId } });
    const after = run(eat.state, nav, 60);
    expect(after.state.jobs[eat.jobId]!.blockReasonKey).toBe("block.food_spoiled");
    expect(after.events.some((e) => e.type === "consumption_happened" && e.resourceLotId === lotId)).toBe(false);
  });

  it("un lote perecedero de una partida anterior a S7 empieza a deteriorarse al cargar, sin retroactividad", () => {
    const base = cleanBase("s7-decay-legacy");
    const legacy = lot("resource-lot-s7-legacy", "fresh_food", 2, { kind: "room", roomId: TEST_HOUSE_IDS.hallwayRoomId }, { condition: 0.7, decayStartedAtSimSeconds: null, conditionAtDecayStart: null });
    const state = { ...putLot(base, legacy), clock: { ...base.clock, elapsedSimSeconds: 400_000 } };
    const decayed = applyResourceDecay(state).state.resourceLots[legacy.id]!;
    expect(decayed.decayStartedAtSimSeconds).toBe(400_000);
    expect(decayed.conditionAtDecayStart).toBe(0.7);
    expect(decayed.condition).toBe(0.7);
  });
});

describe("S7 — frigorífico: reparar nunca devuelve la refrigeración sin electricidad", () => {
  it("la refrigeración sigue inactiva por falta de electricidad tras una reparación completa", () => {
    const base = cleanBase("s7-fridge-3");
    const furnitureId = "furniture-s7-fridge";
    const containerId = "container-s7-fridge";
    const entry = OBJECT_CATALOG_BY_VARIANT.get("technical_appliance.fridge")!;
    const fridge: Furniture = {
      id: furnitureId,
      roomId: TEST_HOUSE_IDS.hallwayRoomId,
      kind: "furniture.fridge",
      condition: 0.3,
      functionalState: "broken",
      family: "technical_appliance",
      variant: entry.variant,
      weightKg: entry.defaultWeightKg,
      bulk: "bulky",
      quality: 0.5,
      capacityUnits: 15,
      containerId,
      movedToLocation: null,
      handlingTags: ["bulky", "keep_upright"],
      functions: ["storage"],
      inactiveFunctionReasons: { refrigeration: "no_electricity" },
      repairProfileId: entry.repairProfileId,
      disassemblyProfileId: entry.disassemblyProfileId,
      provenance: "test",
      knownEvidenceIds: [],
    };
    const container: Container = { id: containerId, location: { kind: "room", roomId: TEST_HOUSE_IDS.hallwayRoomId }, capacityUnits: 15, contentIds: [], hostFurnitureId: furnitureId, hostWorldObjectId: null, acceptedHandlingTags: null };
    let state: SimulationStateV2 = { ...base, furniture: { [furnitureId]: fridge }, containers: { ...base.containers, [containerId]: container } };
    state = putLot(state, lot("resource-lot-s7-ec", "electrical_components_i", 1, { kind: "room", roomId: TEST_HOUSE_IDS.hallwayRoomId }));
    state = putLot(state, lot("resource-lot-s7-mp", "mechanical_parts_i", 1, { kind: "room", roomId: TEST_HOUSE_IDS.hallwayRoomId }));
    const nav = buildFullNavigationIndexV2(state.world);
    state = unpause(state, nav);
    const personId = state.peopleOrder[0]!;
    const repair = order(state, nav, { commandId: "rep", personId, actionKey: "repair", target: { kind: "furniture", furnitureId } });
    const { state: finalState } = run(repair.state, nav, 300, 15);
    expect(finalState.jobs[repair.jobId]!.state).toBe("completed");
    expect(finalState.furniture[furnitureId]!.inactiveFunctionReasons.refrigeration).toBe("no_electricity");
    expect(finalState.furniture[furnitureId]!.functions).not.toContain("refrigeration");
  });

  it("no se desmonta con contenido dentro: hay que vaciarlo primero (SET-009 §3.4 paso 5)", () => {
    const { state: withW, furnitureId, containerId } = withWardrobe(cleanBase("s7-empty-first"));
    const bottle = makeWorldObject({ id: "object-s7-inside", variant: "personal_liquid_container.bottle", location: { kind: "container", containerId }, condition: 0.7, quality: 0.5, functionalState: "functional" });
    let state = putObject(withW, bottle);
    const nav = buildFullNavigationIndexV2(state.world);
    state = unpause(state, nav);
    const personId = state.peopleOrder[0]!;
    const dis = order(state, nav, { commandId: "dis", personId, actionKey: "disassemble_selective", target: { kind: "furniture", furnitureId }, disassemblyScope: "selective", confirmIrreversible: true });
    const { state: finalState } = run(dis.state, nav, 80);
    expect(finalState.jobs[dis.jobId]!.blockReasonKey).toBe("block.container_not_empty");
    expect(finalState.furniture[furnitureId]!.functionalState).not.toBe("parts_only");
    expect(finalState.worldObjects[bottle.id]!.location).toEqual({ kind: "container", containerId });
  });
});

describe("S7 — recoger un lote suelto", () => {
  it("un producto de desmontaje suelto en la estancia se recoge sin duplicarse", () => {
    const base = cleanBase("s7-collect-lot");
    const loose = lot("resource-lot-s7-loose", "wood_and_planks", 3, { kind: "room", roomId: TEST_HOUSE_IDS.hallwayRoomId });
    let state = putLot(base, loose);
    const nav = buildFullNavigationIndexV2(state.world);
    state = unpause(state, nav);
    const personId = state.peopleOrder[0]!;
    const collect = order(state, nav, { commandId: "col", personId, actionKey: "collect", target: { kind: "resource_lot", resourceLotId: loose.id } });
    const { state: finalState, events } = run(collect.state, nav, 60);
    expect(finalState.jobs[collect.jobId]!.state).toBe("completed");
    expect(finalState.resourceLots[loose.id]!.location).toEqual({ kind: "carried_by_person", personId });
    expect(finalState.resourceLots[loose.id]!.quantity).toBe(3);
    expect(finalState.resourceLots[loose.id]!.reservedByJobId).toBeNull();
    expect(events.some((e) => e.type === "object_collected" && e.entityKind === "resource_lot")).toBe(true);
  });
});

describe("S7 — generación v2: bomba, carretilla/carro y pertenencias SCN-003 sin duplicados", () => {
  const state = createInitialStateV2("s7-generation-1");

  it("instala una bomba manual conectada a una fuente ENV-01 real, con un cubo al pie", () => {
    const pump = Object.values(state.worldObjects).find((o) => o.variant === "technical_installation.hand_pump");
    expect(pump).toBeDefined();
    expect(pump!.installedAt).not.toBeNull();
    expect(state.world.places[pump!.installedAt!.placeId]!.profileId).toBe("ENV-01");
    expect(state.world.nodes[pump!.installedAt!.nodeId!]!.kind).toBe("water_source");
    expect(pump!.repairProfileId).toBe("repair.technical_installation.hand_pump.v1");
    expect(Object.values(state.worldObjects).some((o) => o.variant === "work_container.bucket" && o.location.kind === "world_point")).toBe(true);
  });

  it("la carretilla/carro nace como objeto completo con perfiles versionados", () => {
    const means = Object.values(state.transportMeans);
    expect(means.length).toBe(1);
    expect(means[0]!.repairProfileId).toMatch(/^repair\.human_transport\./);
    expect(means[0]!.disassemblyProfileId).toMatch(/^disassembly\.human_transport\./);
  });

  it("cada persona lleva sus pertenencias reales; el agua y las comidas no existen además en el refugio", () => {
    for (const personId of state.peopleOrder) {
      const person = state.people[personId]!;
      for (const possession of person.public.possessions) {
        expect(resolveHolderPersonId(state, state.worldObjects[possession.id]!.location)).toBe(personId);
      }
    }
    const heldWater = Object.values(state.resourceLots).filter((l) => l.family === "water" && resolveHolderPersonId(state, l.location)).reduce((a, l) => a + l.quantity, 0);
    expect(heldWater).toBeGreaterThanOrEqual(5);
    expect(heldWater).toBeLessThanOrEqual(8);
    const shelterPlace = Object.values(state.world.places).find((p) => p.buildingId && state.discoveries.some((d) => d.entityId === p.id));
    expect(shelterPlace).toBeDefined();
    const scn003Lots = Object.values(state.resourceLots).filter((l) => l.provenance === "scn003_arrival");
    expect(scn003Lots.every((l) => resolveHolderPersonId(state, l.location) !== null)).toBe(true);
    // Ninguna ID de objeto aparece dos veces en contenedores (sin duplicados).
    const listed = Object.values(state.containers).flatMap((c) => c.contentIds);
    expect(new Set(listed).size).toBe(listed.length);
    expect(validateSimulationStateV2Invariants(state).ok).toBe(true);
  });

  it("todo objeto generado usa una variante de catálogo", () => {
    for (const obj of Object.values(state.worldObjects)) expect(OBJECT_CATALOG_BY_VARIANT.has(obj.variant)).toBe(true);
  });
});

describe("S7 — compatibilidad de snapshots anteriores (defaults seguros)", () => {
  it("un snapshot sin ninguno de los campos nuevos de S7 carga, valida invariantes y sigue avanzando", () => {
    const modern = createInitialStateV2("s7-compat-1");
    const json = JSON.parse(JSON.stringify(modern)) as Record<string, unknown>;
    const strip = (record: Record<string, Record<string, unknown>>, keys: string[]) => {
      for (const entity of Object.values(record)) for (const key of keys) delete entity[key];
    };
    strip(json.worldObjects as Record<string, Record<string, unknown>>, ["installedAt"]);
    strip(json.resourceLots as Record<string, Record<string, unknown>>, ["conditionAtDecayStart"]);
    strip(json.transportMeans as Record<string, Record<string, unknown>>, [
      "variant",
      "weightKg",
      "bulk",
      "quality",
      "functionalState",
      "handlingTags",
      "functions",
      "inactiveFunctionReasons",
      "missingParts",
      "repairProfileId",
      "disassemblyProfileId",
      "provenance",
      "knownEvidenceIds",
    ]);
    const parsed = parseSimulationStateV2(json);
    expect(parsed.success).toBe(true);
    const loaded = parsed.data!;
    const means = Object.values(loaded.transportMeans)[0]!;
    expect(means.functionalState).toBe("functional");
    expect(means.functions).toEqual(["hauling"]);
    expect(means.repairProfileId).toBeNull();
    expect(Object.values(loaded.worldObjects).every((o) => o.installedAt === null)).toBe(true);
    expect(validateSimulationStateV2Invariants(loaded).ok).toBe(true);
    const nav = buildFullNavigationIndexV2(loaded.world);
    const advanced = run(unpause(loaded, nav), nav, 3, 60).state;
    expect(validateSimulationStateV2Invariants(advanced).ok).toBe(true);
  });
});

describe("S7 — dividir y fusionar lotes (§6.5)", () => {
  it("retirar una parte divide el lote conservando cantidad, condición y procedencia", () => {
    const { state: withW, containerId } = withWardrobe(cleanBase("s7-split-1"));
    const wood = lot("resource-lot-s7-split", "wood_and_planks", 5, { kind: "container", containerId });
    let state = putLot(withW, wood);
    const nav = buildFullNavigationIndexV2(state.world);
    state = unpause(state, nav);
    const personId = state.peopleOrder[0]!;
    const retrieve = order(state, nav, { commandId: "r", personId, actionKey: "retrieve_from_storage", target: { kind: "container", containerId }, storageItem: { kind: "resource_lot", id: wood.id }, storageQuantity: 2 });
    const { state: finalState, events } = run(retrieve.state, nav, 80, 1, (s) => expect(relevantViolations(s)).toEqual([]));
    expect(finalState.jobs[retrieve.jobId]!.state).toBe("completed");
    const split = events.find((e) => e.type === "resource_lot_split");
    expect(split && split.type === "resource_lot_split" && split.quantity).toBe(2);
    const part = split && split.type === "resource_lot_split" ? finalState.resourceLots[split.newResourceLotId]! : undefined;
    expect(part!.quantity).toBe(2);
    expect(part!.location).toEqual({ kind: "carried_by_person", personId });
    expect(part!.condition).toBe(wood.condition);
    expect(part!.provenance).toContain(`split_from:${wood.id}`);
    expect(finalState.resourceLots[wood.id]!.quantity).toBe(3);
    expect(finalState.resourceLots[wood.id]!.location).toEqual({ kind: "container", containerId });
  });

  it("guardar un lote junto a otro compatible los fusiona; uno incompatible se queda aparte", () => {
    const { state: withW, containerId } = withWardrobe(cleanBase("s7-merge-1"));
    const personId = withW.peopleOrder[0]!;
    const inside = lot("resource-lot-s7-in", "wood_and_planks", 3, { kind: "container", containerId }, { condition: 0.8 });
    const carried = lot("resource-lot-s7-carried", "wood_and_planks", 2, { kind: "carried_by_person", personId }, { condition: 0.75 });
    let state = putLot(putLot(withW, inside), carried);
    const nav = buildFullNavigationIndexV2(state.world);
    state = unpause(state, nav);
    const store = order(state, nav, { commandId: "s", personId, actionKey: "store", target: { kind: "container", containerId }, storageItem: { kind: "resource_lot", id: carried.id } });
    const { state: finalState, events } = run(store.state, nav, 80, 1, (s) => expect(relevantViolations(s)).toEqual([]));
    expect(finalState.jobs[store.jobId]!.state).toBe("completed");
    expect(events.some((e) => e.type === "resource_lot_merged" && e.survivingResourceLotId === inside.id && e.mergedResourceLotId === carried.id)).toBe(true);
    expect(finalState.resourceLots[carried.id]).toBeUndefined();
    const survivor = finalState.resourceLots[inside.id]!;
    expect(survivor.quantity).toBe(5);
    expect(survivor.condition).toBe(0.78); // (0.8·3 + 0.75·2) / 5
    expect(survivor.provenance).toContain(`merged:${carried.id}`);
    expect(finalState.containers[containerId]!.contentIds).toEqual([inside.id]);

    // Estados incompatibles (condición muy distinta, o perecederos con curvas distintas) nunca se mezclan.
    expect(canMergeResourceLots(inside, { ...carried, condition: 0.3 })).toBe(false);
    const freshA = lot("fa", "fresh_food", 1, { kind: "carried_by_person", personId }, { decayStartedAtSimSeconds: 0, conditionAtDecayStart: 0.9, condition: 0.8 });
    const freshB = lot("fb", "fresh_food", 1, { kind: "carried_by_person", personId }, { decayStartedAtSimSeconds: 3600, conditionAtDecayStart: 0.9, condition: 0.8 });
    expect(canMergeResourceLots(freshA, freshB)).toBe(false);
  });

  it("dividir y fusionar son inversos y conservan la cantidad total exacta", () => {
    const base = cleanBase("s7-split-merge");
    const personId = base.peopleOrder[0]!;
    const water = lot("resource-lot-s7-water", "water", 7.5, { kind: "carried_by_person", personId });
    const state = putLot(base, water);
    const split = splitResourceLot(state, water.id, 2.25, "resource-lot-s7-water-part", { kind: "carried_by_person", personId })!;
    expect(split.resourceLots[water.id]!.quantity + split.resourceLots["resource-lot-s7-water-part"]!.quantity).toBe(7.5);
    expect(splitResourceLot(state, water.id, 7.5, "x", { kind: "carried_by_person", personId })).toBeNull();
    const merged = mergeResourceLots(split, water.id, "resource-lot-s7-water-part")!;
    expect(merged.resourceLots[water.id]!.quantity).toBe(7.5);
    expect(merged.resourceLots["resource-lot-s7-water-part"]).toBeUndefined();
  });
});

describe("S7 — un bloqueo por materiales se reanuda cuando los materiales llegan", () => {
  it("la reparación bloqueada termina en cuanto hay madera concreta en la estancia", () => {
    const { state: withW, furnitureId } = withWardrobe(cleanBase("s7-revive-1"));
    const nav = buildFullNavigationIndexV2(withW.world);
    let state = unpause(withW, nav);
    const personId = state.peopleOrder[0]!;
    const repair = order(state, nav, { commandId: "rep", personId, actionKey: "repair", target: { kind: "furniture", furnitureId } });
    state = run(repair.state, nav, 40).state;
    expect(state.jobs[repair.jobId]!.blockReasonKey).toBe("block.missing_materials");
    state = putLot(state, lot("resource-lot-s7-arrived", "wood_and_planks", 2, { kind: "room", roomId: TEST_HOUSE_IDS.hallwayRoomId }));
    const { state: finalState } = run(state, nav, 80);
    expect(["completed", "causal_failure"]).toContain(finalState.jobs[repair.jobId]!.state);
    expect(finalState.resourceLots["resource-lot-s7-arrived"]).toBeUndefined();
  });
});
