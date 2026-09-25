import { describe, expect, it } from "vitest";
import type { DiscoveryRecord, ResourceLot, SimulationStateV2, WorldObject } from "@z-world/contracts";
import { createInitialStateV2 } from "@z-world/simulation-core";
import { buildWorkerProjectionsV2, splitWorkerProjectionsV2 } from "./build-projections-v2.js";

/**
 * Amplía las pruebas de frontera de conocimiento (S11 §5.3): confirma que
 * la proyección — completa, y en cada canal del protocolo V3 (S11 §5.2)
 * por separado — nunca incluye lo que la persona jugadora todavía no
 * puede conocer. `build-projections-v2.test.ts` y
 * `build-exploitation-projections-v2.test.ts` ya cubren lugares,
 * estancias, aberturas y capas de edificio; este archivo cubre lo que
 * faltaba explícitamente: objetos sueltos en una estancia sin registrar,
 * contenido de un recipiente sin registrar, un objeto exterior tras
 * niebla no revelada, y un barrido genérico de claves internas del motor
 * que nunca deben viajar por `postMessage`.
 */
const SEED = "probe-seed-92";

function withDiscoveries(state: SimulationStateV2, records: readonly DiscoveryRecord[]): SimulationStateV2 {
  const keys = new Set(records.map((r) => `${r.entityId}:${r.facet}`));
  return { ...state, discoveries: [...state.discoveries.filter((d) => !keys.has(`${d.entityId}:${d.facet}`)), ...records] };
}

function project(state: SimulationStateV2) {
  const full = buildWorkerProjectionsV2({ state, gameSaveId: "game-knowledge", revision: 0, saveStatus: "saved", lastSavedSimSeconds: null, operationalLog: [] });
  return { full, ...splitWorkerProjectionsV2(full) };
}

function anyRoomId(state: SimulationStateV2): string {
  const roomId = Object.keys(state.world.rooms)[0];
  if (!roomId) throw new Error("La semilla de prueba no generó estancias.");
  return roomId;
}

function anyContainerObject(state: SimulationStateV2): WorldObject {
  const container = Object.values(state.worldObjects).find((o) => o.containerId === null && o.family !== "improvised_tool_or_weapon");
  // Cualquier objeto sirve como "recipiente" a efectos de esta prueba: solo
  // necesitamos un `containerId` real para anidar un objeto de prueba dentro.
  if (container) return container;
  const fallback = Object.values(state.worldObjects)[0];
  if (!fallback) throw new Error("La semilla de prueba no generó objetos.");
  return fallback;
}

describe("frontera de conocimiento V2 (S11 §5.3) — objetos, contenido de recipientes y niebla", () => {
  it("un objeto suelto en una estancia sin registrar su contenido no aparece en el inventario; una vez registrado, sí", () => {
    const base = createInitialStateV2(SEED);
    const roomId = anyRoomId(base);
    const testObject: WorldObject = {
      id: "test-obj-loose-1",
      family: "improvised_tool_or_weapon",
      variant: "possession.test_item",
      location: { kind: "room", roomId },
      ownerOrReservedByJobId: null,
      weightKg: 1,
      bulk: "small",
      condition: 0.9,
      quality: 0.5,
      functionalState: "functional",
      handlingTags: [],
      volumeLiters: 1,
      capacityUnits: null,
      containerId: null,
      functions: [],
      inactiveFunctionReasons: {},
      portability: "handheld",
      minOperators: 1,
      repairProfileId: null,
      disassemblyProfileId: null,
      provenance: "unit_test",
      installedAt: null,
      missingParts: [],
      knownEvidenceIds: [],
    };
    const state = { ...base, worldObjects: { ...base.worldObjects, [testObject.id]: testObject } };

    const unregistered = withDiscoveries(state, []);
    expect(project(unregistered).full.inventory.some((e) => e.id === testObject.id)).toBe(false);
    expect(project(unregistered).tick.inventory.some((e) => e.id === testObject.id)).toBe(false);

    const registered = withDiscoveries(state, [{ entityId: roomId, facet: "content", state: "inspected" }]);
    expect(project(registered).full.inventory.some((e) => e.id === testObject.id)).toBe(true);
    expect(project(registered).tick.inventory.some((e) => e.id === testObject.id)).toBe(true);
  });

  it("el contenido de un recipiente en una estancia sin registrar no aparece; una vez registrado el contenido de la estancia, sí", () => {
    const base = createInitialStateV2(SEED);
    const roomId = anyRoomId(base);
    const container = anyContainerObject(base);
    const containerInRoom: WorldObject = { ...container, location: { kind: "room", roomId } };
    const contentLot: ResourceLot = {
      id: "test-lot-contained-1",
      family: "fresh_food",
      quantity: 1,
      unit: "unit",
      location: { kind: "on_object", objectId: container.id },
      condition: 0.9,
      reservedByJobId: null,
      qualityKnown: true,
      quality: 1,
      provenance: "unit_test",
      decayStartedAtSimSeconds: base.clock.elapsedSimSeconds,
      conditionAtDecayStart: 0.9,
    };
    const state: SimulationStateV2 = {
      ...base,
      worldObjects: { ...base.worldObjects, [container.id]: containerInRoom },
      resourceLots: { ...base.resourceLots, [contentLot.id]: contentLot },
    };

    const unregistered = withDiscoveries(state, []);
    expect(project(unregistered).full.inventory.some((e) => e.id === contentLot.id)).toBe(false);

    const registered = withDiscoveries(state, [{ entityId: roomId, facet: "content", state: "inspected" }]);
    expect(project(registered).full.inventory.some((e) => e.id === contentLot.id)).toBe(true);
  });

  it("un objeto exterior tras niebla no revelada no aparece en el inventario, aunque nadie necesite 'descubrirlo' formalmente (basta con la niebla)", () => {
    const base = createInitialStateV2(SEED);
    const farPoint = { x: base.world.bounds.minX + 1, y: base.world.bounds.minY + 1 };
    const testObject: WorldObject = {
      id: "test-obj-exterior-1",
      family: "improvised_tool_or_weapon",
      variant: "possession.test_item_exterior",
      location: { kind: "world_point", point: farPoint },
      ownerOrReservedByJobId: null,
      weightKg: 1,
      bulk: "small",
      condition: 0.9,
      quality: 0.5,
      functionalState: "functional",
      handlingTags: [],
      volumeLiters: 1,
      capacityUnits: null,
      containerId: null,
      functions: [],
      inactiveFunctionReasons: {},
      portability: "handheld",
      minOperators: 1,
      repairProfileId: null,
      disassemblyProfileId: null,
      provenance: "unit_test",
      installedAt: null,
      missingParts: [],
      knownEvidenceIds: [],
    };
    // Niebla completamente sin revelar (todas las celdas en 0/"hidden"): un
    // punto lejano del mundo, sin ninguna persona cerca, sigue oculto.
    const hiddenFog = { ...base.fog, cells: base.fog.cells.map(() => 0) };
    const state: SimulationStateV2 = { ...base, worldObjects: { ...base.worldObjects, [testObject.id]: testObject }, fog: hiddenFog };

    expect(project(state).full.inventory.some((e) => e.id === testObject.id)).toBe(false);
  });

  it("barrido genérico: ninguna proyección (completa, estructural o de tick) contiene claves internas del motor que nunca deben viajar por postMessage", () => {
    const state = createInitialStateV2(SEED);
    const { full, structural, tick } = project(state);
    const forbiddenSubstrings = [
      "caliberTier", // calibre oculto de la cohorte (§10.5 WEB-001)
      "resolutionModelBWeights",
      "difficultyMargin",
      "lootPressure", // presión de saqueo interna (WLD-011), nunca expuesta cruda
      "seedStream",
    ];
    for (const [label, payload] of [["full", full] as const, ["structural", structural] as const, ["tick", tick] as const]) {
      const serialized = JSON.stringify(payload);
      for (const forbidden of forbiddenSubstrings) {
        expect(serialized, `${label} no debe contener "${forbidden}"`).not.toContain(forbidden);
      }
    }
  });
});
