import { describe, expect, it } from "vitest";
import type { SimulationStateV2 } from "@z-world/contracts";
import { createInitialStateV2 } from "@z-world/simulation-core";
import { buildWorkerProjectionsV2 } from "./build-projections-v2.js";

function project(state: SimulationStateV2) {
  return buildWorkerProjectionsV2({ state, gameSaveId: "g", revision: 0, saveStatus: "saved", lastSavedSimSeconds: null, operationalLog: [] });
}

/** Proyecciones S7 (WEB-002 §6.3/§10.2/§10.3): inventario localizado y acciones de objetos sin fugas. */
describe("proyecciones de objetos S7", () => {
  const state = createInitialStateV2("proj-s7-seed-1");

  it("el inventario muestra las pertenencias que llevan las personas, con su ubicación real, y nada de estancias sin registrar", () => {
    const projections = project(state);
    const carried = projections.inventory.filter((e) => e.locationKind === "carried");
    expect(carried.length).toBeGreaterThan(state.peopleOrder.length);
    expect(carried.every((e) => e.holderPersonId && state.peopleOrder.includes(e.holderPersonId))).toBe(true);
    expect(projections.inventory.some((e) => e.locationKind === "room" || e.locationKind === "container")).toBe(false);
    // El agua va dentro de cantimploras/botellas: la entrada enlaza al recipiente real.
    const water = projections.inventory.find((e) => e.labelKey === "resource.water");
    expect(water?.containerLabelKey).toMatch(/^object\.(personal_liquid_container|work_container)\./);
  });

  it("registrar una estancia revela su contenido y los contenedores permiten almacenar/retirar", () => {
    const room = Object.values(state.world.rooms).find((r) => Object.values(state.containers).some((c) => c.location.kind === "room" && c.location.roomId === r.id && c.contentIds.length > 0))!;
    const registered = { ...state, discoveries: [...state.discoveries, { entityId: room.id, facet: "content" as const, state: "inspected" as const }] };
    const projections = project(registered);
    const retrieve = projections.contextualActions.find((o) => o.actionKey === "retrieve_from_storage");
    expect(retrieve?.targets.some((t) => t.storageItem && t.target.kind === "container")).toBe(true);
    const store = projections.contextualActions.find((o) => o.actionKey === "store");
    expect(store?.targets.some((t) => t.target.kind === "container" && t.storageItem?.holderPersonId)).toBe(true);
    expect(projections.inventory.some((e) => e.roomId === room.id)).toBe(true);
  });

  it("la bomba aparece sin probar hasta que alguien la prueba", () => {
    const pump = Object.values(state.worldObjects).find((o) => o.variant === "technical_installation.hand_pump")!;
    const allVisible: SimulationStateV2 = { ...state, fog: { ...state.fog, cells: state.fog.cells.map(() => 1) } };
    const before = project(allVisible).inventory.find((e) => e.id === pump.id);
    expect(before?.functionalStateKey).toBe("functional_state.untested");
    const drawBefore = project(allVisible).contextualActions.find((o) => o.actionKey === "draw_water")!.targets.find((t) => t.target.kind === "world_object" && t.target.worldObjectId === pump.id);
    expect(drawBefore?.blockedReasonKey).toBeNull();
    const tested: SimulationStateV2 = { ...allVisible, worldObjects: { ...allVisible.worldObjects, [pump.id]: { ...pump, knownEvidenceIds: ["tested@1"] } } };
    expect(project(tested).inventory.find((e) => e.id === pump.id)?.functionalStateKey).toBe(`functional_state.${pump.functionalState}`);
  });

  it("un alimento fresco echado a perder aparece con su banda y bloqueado para comer", () => {
    const personId = state.peopleOrder[0]!;
    const lotId = "resource-lot-proj-fresh";
    const spoiled: SimulationStateV2 = {
      ...state,
      resourceLots: {
        ...state.resourceLots,
        [lotId]: { id: lotId, family: "fresh_food", quantity: 1, unit: "unit", location: { kind: "carried_by_person", personId }, condition: 0.1, reservedByJobId: null, qualityKnown: true, quality: 1, provenance: "test", decayStartedAtSimSeconds: 0, conditionAtDecayStart: 0.8 },
      },
    };
    const projections = project(spoiled);
    expect(projections.inventory.find((e) => e.id === lotId)?.freshness).toBe("spoiled");
    const eat = projections.contextualActions.find((o) => o.actionKey === "eat")!;
    expect(eat.targets.find((t) => t.target.kind === "resource_lot" && t.target.resourceLotId === lotId)?.blockedReasonKey).toBe("block.food_spoiled");
  });

  it("la ficha deriva las pertenencias del inventario real (mismos IDs que el resumen de llegada, sin duplicados)", () => {
    const personId = state.peopleOrder[0]!;
    const sheet = project(state).personSheets[personId]!;
    const ids = sheet.possessions.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const legacy of state.people[personId]!.public.possessions) expect(ids).toContain(legacy.id);
    expect(sheet.possessions.some((p) => p.isMeleeOrImprovisedWeapon)).toBe(true);
  });
});

/** Proyecciones S8: opciones de traslado solo con medios y destinos conocidos, ficha logística e inventario en carga. */
describe("proyecciones de traslado S8", () => {
  const state = createInitialStateV2("proj-s8-seed-1");

  it("ofrece Auto y los métodos manuales siempre; carretilla/carro solo si la comunidad conoce alguno", () => {
    const hidden: SimulationStateV2 = { ...state, fog: { ...state.fog, cells: state.fog.cells.map(() => 0) } };
    const option = project(hidden).contextualActions.find((o) => o.actionKey === "transport")!;
    expect(option.transport!.methods.map((m) => m.method)).toEqual(["auto", "hand_carry", "personal_container", "coordinated_carry"]);
    expect(option.transport!.means).toEqual([]);
    const visible: SimulationStateV2 = { ...state, fog: { ...state.fog, cells: state.fog.cells.map(() => 1) } };
    const seen = project(visible).contextualActions.find((o) => o.actionKey === "transport")!;
    expect(seen.transport!.methods.map((m) => m.method)).toEqual(expect.arrayContaining(["wheelbarrow", "handcart"]));
    expect(seen.transport!.means.length).toBe(Object.keys(state.transportMeans).length);
    // Los destinos nunca incluyen contenedores que lleva una persona ni estancias sin ver.
    expect(seen.transport!.destinations.every((d) => d.destination.kind !== "room")).toBe(true);
    expect(seen.transport!.destinations.some((d) => d.destination.kind === "world_point")).toBe(true);
  });

  it("la ficha de un traslado muestra método, paso, carga y colocación; el inventario enlaza la carga a su medio", () => {
    const personId = state.peopleOrder[0]!;
    const means = Object.values(state.transportMeans)[0]!;
    const lotId = "resource-lot-proj-s8";
    const bundleId = "load-bundle-proj-s8";
    const withLoad: SimulationStateV2 = {
      ...state,
      fog: { ...state.fog, cells: state.fog.cells.map(() => 1) },
      resourceLots: { ...state.resourceLots, [lotId]: { id: lotId, family: "sheet_metal", quantity: 12, unit: "kilogram", location: { kind: "in_load_bundle", loadBundleId: bundleId }, condition: 0.8, reservedByJobId: null, qualityKnown: true, quality: 1, provenance: "test", decayStartedAtSimSeconds: null, conditionAtDecayStart: null } },
      loadBundles: {
        [bundleId]: { id: bundleId, method: means.method, carriedByPersonIds: [personId], transportMeansId: means.id, contentObjectIds: [], contentResourceLotIds: [lotId], contentFurnitureIds: [], totalWeightKg: 12, location: { kind: "mounted_on_transport", transportId: means.id }, containerId: null, totalVolumeLiters: 12, bulk: "medium", handlingTags: [], minCarriers: 1, lowestContentCondition: 0.8, state: "in_transit", jobId: null, originLocation: null, allocation: {} },
      },
      transportMeans: { ...state.transportMeans, [means.id]: { ...means, currentLoadBundleId: bundleId } },
    };
    const entry = project(withLoad).inventory.find((e) => e.id === lotId)!;
    expect(entry.locationKind).toBe("load");
    expect(entry.containerLabelKey).toBe(`object.human_transport.${means.method}`);
  });
});
