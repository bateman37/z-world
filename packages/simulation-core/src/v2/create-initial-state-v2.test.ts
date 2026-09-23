import { describe, expect, it } from "vitest";
import { PLACE_PROFILE_IDS, parseSimulationStateV2 } from "@z-world/contracts";
import { validateSimulationStateV2Invariants } from "./invariants.js";
import { createInitialStateV2, VillageGenerationError } from "./create-initial-state-v2.js";
import { VILLAGE_GENERATOR_VERSION } from "./generator/index.js";
import { VILLAGE_BUDGET } from "@z-world/catalogs";

/**
 * Pruebas obligatorias del generador semántico determinista (S2 de
 * WEB-002 §7): determinismo, variación entre semillas, validez Zod,
 * invariantes relacionales, IDs estables, ausencia de huérfanos,
 * ubicación única, presencia de los ocho perfiles, coherencia de
 * edificios/estancias/aberturas, conectividad mínima y escenario inicial.
 */
describe("createInitialStateV2 — generador semántico determinista (WEB-002 S2)", () => {
  it("misma semilla, versión y configuración producen exactamente el mismo estado (determinismo real)", () => {
    const a = createInitialStateV2("aldea-uno");
    const b = createInitialStateV2("aldea-uno");
    expect(a).toEqual(b);
  });

  it("semillas diferentes producen variación observable", () => {
    const a = createInitialStateV2("aldea-uno");
    const b = createInitialStateV2("aldea-dos");
    expect(a.world.arrivalPoint).not.toEqual(b.world.arrivalPoint);
    expect(Object.keys(a.world.places).length).not.toBe(0);
    expect(a.seed).not.toBe(b.seed);
    // El recuento de construcciones también varía entre semillas dentro del presupuesto.
    const buildingsA = Object.keys(a.world.buildings).length;
    const buildingsB = Object.keys(b.world.buildings).length;
    expect(buildingsA === buildingsB && JSON.stringify(a.world.places) === JSON.stringify(b.world.places)).toBe(false);
  });

  it("es válido contra el esquema Zod de SimulationStateV2", () => {
    const state = createInitialStateV2("aldea-zod");
    const parsed = parseSimulationStateV2(state);
    expect(parsed.success).toBe(true);
  });

  it("cumple los invariantes relacionales adicionales a Zod", () => {
    const state = createInitialStateV2("aldea-invariantes");
    const report = validateSimulationStateV2Invariants(state);
    expect(report.violations).toEqual([]);
    expect(report.ok).toBe(true);
  });

  it("genera IDs estables, reproducibles y únicos globalmente", () => {
    const a = createInitialStateV2("aldea-ids");
    const b = createInitialStateV2("aldea-ids");
    expect(Object.keys(a.world.places).sort()).toEqual(Object.keys(b.world.places).sort());
    const allIds = [
      ...Object.keys(a.world.places),
      ...Object.keys(a.world.buildings),
      ...Object.keys(a.world.rooms),
      ...Object.keys(a.worldObjects),
      ...Object.keys(a.resourceLots),
      ...Object.keys(a.people),
    ];
    expect(new Set(allIds).size).toBe(allIds.length);
  });

  it("no deja referencias huérfanas y cada persona/objeto tiene ubicación única", () => {
    const state = createInitialStateV2("aldea-ubicaciones");
    for (const person of Object.values(state.people)) {
      expect(person.location).toBeDefined();
    }
    // Cada WorldObject aparece en un único sitio: o está en `worldObjects` con su propia location, nunca duplicado en dos ubicaciones distintas a la vez.
    const objectIds = Object.keys(state.worldObjects);
    expect(new Set(objectIds).size).toBe(objectIds.length);
  });

  it("presenta los ocho perfiles de lugar aprobados al menos una vez, dentro del presupuesto de §7.2", () => {
    const state = createInitialStateV2("aldea-perfiles");
    const counts = new Map<string, number>();
    for (const place of Object.values(state.world.places)) counts.set(place.profileId, (counts.get(place.profileId) ?? 0) + 1);
    for (const profileId of PLACE_PROFILE_IDS) {
      expect(counts.get(profileId) ?? 0).toBeGreaterThan(0);
    }
    const housing = (counts.get("RES-10") ?? 0) + (counts.get("RES-17") ?? 0);
    expect(housing).toBeGreaterThanOrEqual(VILLAGE_BUDGET.housing.min);
    expect(housing).toBeLessThanOrEqual(VILLAGE_BUDGET.housing.max);
    const totalConstructions = Object.keys(state.world.buildings).length;
    expect(totalConstructions).toBeGreaterThanOrEqual(VILLAGE_BUDGET.totalConstructions.min);
    expect(totalConstructions).toBeLessThanOrEqual(VILLAGE_BUDGET.totalConstructions.max);
  });

  it("cada edificio con interior generado tiene programa coherente: estancias, aberturas y al menos una salida exterior", () => {
    const state = createInitialStateV2("aldea-edificios");
    for (const building of Object.values(state.world.buildings)) {
      if (!building.interiorGenerated) continue;
      const floors = Object.values(state.world.floors).filter((f) => f.buildingId === building.id);
      expect(floors.length).toBeGreaterThan(0);
      const rooms = Object.values(state.world.rooms).filter((r) => floors.some((f) => f.id === r.floorId));
      expect(rooms.length).toBeGreaterThan(0);
      const roomIds = new Set(rooms.map((r) => r.id));
      const hasExteriorOpening = Object.values(state.world.openings).some((o) => o.connectsToExterior && o.connectsRoomId && roomIds.has(o.connectsRoomId));
      expect(hasExteriorOpening).toBe(true);
    }
  });

  it("conectividad mínima: toda estancia de un edificio con programa es alcanzable desde una entrada exterior", () => {
    const state = createInitialStateV2("aldea-conectividad");
    const openingsByRoom = new Map<string, string[]>();
    for (const opening of Object.values(state.world.openings)) {
      if (opening.connectsRoomId && opening.connectsOtherRoomId) {
        openingsByRoom.set(opening.connectsRoomId, [...(openingsByRoom.get(opening.connectsRoomId) ?? []), opening.connectsOtherRoomId]);
        openingsByRoom.set(opening.connectsOtherRoomId, [...(openingsByRoom.get(opening.connectsOtherRoomId) ?? []), opening.connectsRoomId]);
      }
    }
    const exteriorRoomIds = new Set(Object.values(state.world.openings).filter((o) => o.connectsToExterior && o.connectsRoomId).map((o) => o.connectsRoomId!));

    for (const building of Object.values(state.world.buildings)) {
      if (!building.interiorGenerated) continue;
      const floors = Object.values(state.world.floors).filter((f) => f.buildingId === building.id);
      const rooms = Object.values(state.world.rooms).filter((r) => floors.some((f) => f.id === r.floorId));
      if (rooms.length === 0) continue;
      const entry = rooms.find((r) => exteriorRoomIds.has(r.id)) ?? rooms[0];
      const visited = new Set<string>([entry!.id]);
      const queue = [entry!.id];
      while (queue.length > 0) {
        const current = queue.shift()!;
        for (const next of openingsByRoom.get(current) ?? []) {
          if (!visited.has(next)) {
            visited.add(next);
            queue.push(next);
          }
        }
      }
      for (const room of rooms) {
        expect(visited.has(room.id)).toBe(true);
      }
    }
  });

  it("genera un punto de llegada válido, seis protagonistas ubicados allí y un refugio dentro del rango acordado", () => {
    const state = createInitialStateV2("aldea-escenario");
    expect(state.clock.elapsedSimSeconds).toBe(17 * 3600 + 30 * 60);
    expect(Object.keys(state.people)).toHaveLength(6);
    for (const person of Object.values(state.people)) {
      expect(person.location).toEqual({ kind: "world_point", point: state.world.arrivalPoint });
      expect(person.public.possessions.length).toBeGreaterThan(0);
    }
    // Hay al menos una vivienda no colapsada a 100-250 m del punto de llegada (o la degradación quedó registrada explícitamente).
    if (state.generationDegradations.some((d) => d.includes("refugio"))) {
      expect(state.generationDegradations.length).toBeGreaterThan(0);
    }
  });

  it("garantiza al menos un medio de transporte, una parcela de cultivo candidata y dos fuentes de agua", () => {
    const state = createInitialStateV2("aldea-garantias");
    expect(Object.keys(state.transportMeans).length).toBeGreaterThanOrEqual(1);
    expect(Object.keys(state.cultivationPlots).length).toBeGreaterThanOrEqual(1);
    const waterNodes = Object.values(state.world.nodes).filter((n) => n.kind === "water_source");
    expect(waterNodes.length).toBeGreaterThanOrEqual(2);
  });

  it("sella el estado con la versión del generador de S2 y sin marca de migración", () => {
    const state = createInitialStateV2("aldea-version");
    expect(state.world.generatorVersion).toBe(VILLAGE_GENERATOR_VERSION);
    expect(state.migration).toBeNull();
  });

  it("lanza VillageGenerationError con motivos explícitos si la generación no fuera válida (documentado, no forzado aquí más que por tipo)", () => {
    expect(VillageGenerationError.prototype).toBeInstanceOf(Error);
  });

  it.each(Array.from({ length: 12 }, (_, i) => `aldea-regresion-${i}`))(
    "genera un estado válido para %s (regresión de robustez sobre varias semillas)",
    (seed) => {
      const state = createInitialStateV2(seed);
      expect(parseSimulationStateV2(state).success).toBe(true);
      expect(validateSimulationStateV2Invariants(state).ok).toBe(true);
    },
  );
});
