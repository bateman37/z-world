import { describe, expect, it } from "vitest";
import type { Container, Furniture, ResourceLot, SimulationStateV2, WorldObject } from "@z-world/contracts";
import { applyCommandV2 } from "../apply-command-v2.js";
import { advanceSimulationV2 } from "../advance-simulation-v2.js";
import { buildFullNavigationIndexV2, type NavigationIndexV2 } from "../room-graph.js";
import { makeSyntheticBuildingState, TEST_HOUSE_IDS } from "../test-fixtures.js";

/**
 * Pruebas del demostrador S7 armario/estantería y de la gramática de
 * recoger/reparar/desmontar (§15.6, §16 del prompt S7-S9). Reutiliza el
 * mismo mundo sintético de dos estancias que ya usan las pruebas de S4-S6,
 * añadiendo un objeto suelto y un mueble transformable en el pasillo.
 */

function withBottleInHallway(base: SimulationStateV2): { state: SimulationStateV2; worldObjectId: string } {
  const worldObjectId = "object-test-bottle";
  const obj: WorldObject = {
    id: worldObjectId,
    family: "personal_liquid_container",
    variant: "personal_liquid_container.bottle",
    location: { kind: "room", roomId: TEST_HOUSE_IDS.hallwayRoomId },
    ownerOrReservedByJobId: null,
    weightKg: 0.6,
    bulk: "small",
    condition: 0.7,
    quality: 0.5,
    functionalState: "functional",
    handlingTags: ["liquid"],
    volumeLiters: 1,
    capacityUnits: null,
    containerId: null,
    functions: [],
    inactiveFunctionReasons: {},
    portability: "handheld",
    minOperators: 1,
    repairProfileId: null,
    disassemblyProfileId: null,
    provenance: "test",
    missingParts: [],
    knownEvidenceIds: [],
  };
  return { state: { ...base, worldObjects: { ...base.worldObjects, [worldObjectId]: obj } }, worldObjectId };
}

function withWardrobeInHallway(base: SimulationStateV2): { state: SimulationStateV2; furnitureId: string; containerId: string } {
  const furnitureId = "furniture-test-wardrobe";
  const containerId = "container-test-wardrobe";
  const container: Container = {
    id: containerId,
    location: { kind: "room", roomId: TEST_HOUSE_IDS.hallwayRoomId },
    capacityUnits: 20,
    contentIds: [],
    hostFurnitureId: furnitureId,
    hostWorldObjectId: null,
    acceptedHandlingTags: null,
  };
  const wardrobe: Furniture = {
    id: furnitureId,
    roomId: TEST_HOUSE_IDS.hallwayRoomId,
    kind: "furniture.wardrobe",
    condition: 0.4,
    functionalState: "degraded",
    family: "storage_furniture",
    variant: "storage_furniture.wardrobe",
    weightKg: 45,
    bulk: "bulky",
    quality: 0.4,
    capacityUnits: 20,
    containerId,
    movedToLocation: null,
    handlingTags: [],
    functions: ["storage"],
    inactiveFunctionReasons: {},
    repairProfileId: "repair.storage_furniture.wardrobe_shelf.v1",
    disassemblyProfileId: "disassembly.storage_furniture.wardrobe_shelf.v1",
    provenance: "test",
    knownEvidenceIds: [],
  };
  return {
    state: { ...base, furniture: { ...base.furniture, [furnitureId]: wardrobe }, containers: { ...base.containers, [containerId]: container } },
    furnitureId,
    containerId,
  };
}

function withWoodInHallway(base: SimulationStateV2, quantity: number): { state: SimulationStateV2; resourceLotId: string } {
  const resourceLotId = "resource-lot-test-wood";
  const lot: ResourceLot = {
    id: resourceLotId,
    family: "wood_and_planks",
    quantity,
    unit: "kilogram",
    location: { kind: "room", roomId: TEST_HOUSE_IDS.hallwayRoomId },
    condition: 0.8,
    reservedByJobId: null,
    qualityKnown: true,
    quality: 1,
    provenance: "test",
    decayStartedAtSimSeconds: null,
  };
  return { state: { ...base, resourceLots: { ...base.resourceLots, [resourceLotId]: lot } }, resourceLotId };
}

function run(state: SimulationStateV2, nav: NavigationIndexV2, ticks: number, secondsPerTick = 1) {
  let current = state;
  const allEvents = [];
  for (let i = 0; i < ticks; i++) {
    const result = advanceSimulationV2(current, secondsPerTick, nav);
    current = result.state;
    allEvents.push(...result.events);
  }
  return { state: current, events: allEvents };
}

describe("motor de trabajos — recoger un objeto suelto (S7 §15.7)", () => {
  it("mueve el objeto a la persona ejecutora y emite object_collected", () => {
    const base = makeSyntheticBuildingState("jobs-collect-1");
    const { state: withBottle, worldObjectId } = withBottleInHallway(base);
    const nav = buildFullNavigationIndexV2(withBottle.world);
    const personId = withBottle.peopleOrder[0]!;

    const { state: unpaused } = applyCommandV2(withBottle, { commandId: "c1", type: "set_pause", paused: false }, nav);
    const { state: ordered, events: orderEvents } = applyCommandV2(
      unpaused,
      { commandId: "c2", type: "order_contextual_action", personId, teamPersonIds: [], actionKey: "collect", target: { kind: "world_object", worldObjectId } },
      nav,
    );
    const jobId = orderEvents.find((e) => e.type === "job_created")!.jobId;

    const { state: finalState, events } = run(ordered, nav, 60);

    expect(finalState.jobs[jobId]!.state).toBe("completed");
    expect(events.some((e) => e.type === "object_collected")).toBe(true);
    expect(finalState.worldObjects[worldObjectId]!.location).toEqual({ kind: "carried_by_person", personId });
  });
});

describe("motor de trabajos — reparar el armario (demostrador S7 §15.6)", () => {
  it("consume materiales concretos y restaura la función declarada por el perfil", () => {
    const base = makeSyntheticBuildingState("jobs-repair-1");
    const { state: withWardrobe, furnitureId } = withWardrobeInHallway(base);
    const { state: withWood, resourceLotId } = withWoodInHallway(withWardrobe, 4);
    const nav = buildFullNavigationIndexV2(withWood.world);
    const personId = withWood.peopleOrder[0]!;

    const { state: unpaused } = applyCommandV2(withWood, { commandId: "c1", type: "set_pause", paused: false }, nav);
    const { state: ordered, events: orderEvents } = applyCommandV2(
      unpaused,
      { commandId: "c2", type: "order_contextual_action", personId, teamPersonIds: [], actionKey: "repair", target: { kind: "furniture", furnitureId } },
      nav,
    );
    const jobId = orderEvents.find((e) => e.type === "job_created")!.jobId;

    const { state: finalState, events } = run(ordered, nav, 400);

    expect(finalState.jobs[jobId]!.state).toBe("completed");
    expect(events.some((e) => e.type === "resource_lot_consumed")).toBe(true);
    const repaired = events.find((e) => e.type === "object_repaired");
    expect(repaired).toBeDefined();
    // La receta exige 2 kg de madera concretos: nunca una pila universal `repair_materials`.
    expect(finalState.resourceLots[resourceLotId]!.quantity).toBe(2);
    // El resultado (completo/provisional/parcial) depende del modelo B, pero
    // una reparación nunca deja el mueble en un estado peor del que tenía.
    if (repaired && repaired.type === "object_repaired") {
      expect(["complete", "provisional", "partial"]).toContain(repaired.outcome);
    }
    expect(finalState.furniture[furnitureId]!.functionalState).not.toBe("irreparable");
  });

  it("bloquea la reparación cuando faltan los materiales concretos (nunca inventa una pila universal)", () => {
    const base = makeSyntheticBuildingState("jobs-repair-2");
    const { state: withWardrobe, furnitureId } = withWardrobeInHallway(base);
    const nav = buildFullNavigationIndexV2(withWardrobe.world);
    const personId = withWardrobe.peopleOrder[0]!;

    const { state: unpaused } = applyCommandV2(withWardrobe, { commandId: "c1", type: "set_pause", paused: false }, nav);
    const { state: ordered, events: orderEvents } = applyCommandV2(
      unpaused,
      { commandId: "c2", type: "order_contextual_action", personId, teamPersonIds: [], actionKey: "repair", target: { kind: "furniture", furnitureId } },
      nav,
    );
    const jobId = orderEvents.find((e) => e.type === "job_created")!.jobId;

    const { state: finalState } = run(ordered, nav, 60);

    expect(finalState.jobs[jobId]!.state).toBe("blocked");
    expect(finalState.jobs[jobId]!.blockReasonKey).toBe("block.missing_materials");
    expect(finalState.furniture[furnitureId]!.functionalState).toBe("degraded");
  });
});

describe("motor de trabajos — desmontar el armario (S7 §16.3/§16.4)", () => {
  it("exige confirmación irreversible antes de tocar nada", () => {
    const base = makeSyntheticBuildingState("jobs-disassemble-1");
    const { state: withWardrobe, furnitureId } = withWardrobeInHallway(base);
    const nav = buildFullNavigationIndexV2(withWardrobe.world);
    const personId = withWardrobe.peopleOrder[0]!;

    const { state: unpaused } = applyCommandV2(withWardrobe, { commandId: "c1", type: "set_pause", paused: false }, nav);
    const { state: ordered, events: orderEvents } = applyCommandV2(
      unpaused,
      {
        commandId: "c2",
        type: "order_contextual_action",
        personId,
        teamPersonIds: [],
        actionKey: "disassemble_selective",
        target: { kind: "furniture", furnitureId },
        // Sin `confirmIrreversible`: debe bloquear en `prepare`, nunca desmontar en silencio.
      },
      nav,
    );
    const jobId = orderEvents.find((e) => e.type === "job_created")!.jobId;

    const { state: finalState } = run(ordered, nav, 60);

    expect(finalState.jobs[jobId]!.state).toBe("blocked");
    expect(finalState.jobs[jobId]!.blockReasonKey).toBe("block.irreversible_not_confirmed");
    expect(finalState.furniture[furnitureId]!.functionalState).not.toBe("parts_only");
  });

  it("selectivo confirmado produce madera localizada, elimina la función de almacenamiento y conserva masa dentro del perfil", () => {
    const base = makeSyntheticBuildingState("jobs-disassemble-2");
    const { state: withWardrobe, furnitureId } = withWardrobeInHallway(base);
    const nav = buildFullNavigationIndexV2(withWardrobe.world);
    const personId = withWardrobe.peopleOrder[0]!;

    const { state: unpaused } = applyCommandV2(withWardrobe, { commandId: "c1", type: "set_pause", paused: false }, nav);
    const { state: ordered, events: orderEvents } = applyCommandV2(
      unpaused,
      {
        commandId: "c2",
        type: "order_contextual_action",
        personId,
        teamPersonIds: [],
        actionKey: "disassemble_selective",
        target: { kind: "furniture", furnitureId },
        disassemblyScope: "selective",
        confirmIrreversible: true,
      },
      nav,
    );
    const jobId = orderEvents.find((e) => e.type === "job_created")!.jobId;

    const { state: finalState, events } = run(ordered, nav, 400);

    expect(finalState.jobs[jobId]!.state).toBe("completed");
    const disassembled = events.find((e) => e.type === "object_disassembled");
    expect(disassembled).toBeDefined();
    if (disassembled && disassembled.type === "object_disassembled") {
      expect(disassembled.scope).toBe("selective");
      expect(disassembled.functionsLost).toContain("storage");
      expect(disassembled.producedResourceLotIds.length).toBe(1);
      const producedLot = finalState.resourceLots[disassembled.producedResourceLotIds[0]!]!;
      expect(producedLot.family).toBe("wood_and_planks");
      // El perfil declara 6 kg selectivo / 8 kg destructivo: el selectivo nunca produce más que lo declarado.
      expect(producedLot.quantity).toBe(6);
    }
    expect(finalState.furniture[furnitureId]!.functionalState).toBe("parts_only");
    expect(finalState.furniture[furnitureId]!.functions).toEqual([]);
    expect(finalState.furniture[furnitureId]!.capacityUnits).toBeNull();
  });
});
