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
