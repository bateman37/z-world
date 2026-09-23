import { describe, expect, it } from "vitest";
import { buildFullNavigationIndexV2 } from "./room-graph.js";
import { updateDiscoveryV2 } from "./discovery.js";
import { makeSyntheticBuildingState, TEST_HOUSE_IDS } from "./test-fixtures.js";

function stateWithPersonAt(seed: string, point: { x: number; y: number }, roomId?: string) {
  const base = makeSyntheticBuildingState(seed);
  const personId = base.peopleOrder[0]!;
  const person = base.people[personId]!;
  const location = roomId ? ({ kind: "room" as const, roomId }) : ({ kind: "world_point" as const, point });
  return {
    ...base,
    people: { ...base.people, [personId]: { ...person, public: { ...person.public, position: point }, location } },
  };
}

describe("updateDiscoveryV2", () => {
  it("una persona lejana (>50m) no revela nada del lugar de prueba", () => {
    const state = stateWithPersonAt("disc-v2-seed-1", { x: -60, y: 0 });
    const nav = buildFullNavigationIndexV2(state.world);
    const result = updateDiscoveryV2(state, nav, state.clock.elapsedSimSeconds);
    expect(result.changed).toBe(false);
    expect(result.discoveries).toEqual([]);
  });

  it("una persona a distancia de silueta (entre 25 y 50m) solo obtiene sighted, no observed", () => {
    const state = stateWithPersonAt("disc-v2-seed-2", { x: -20, y: 0 }); // ~35m del lugar en (15,0)
    const nav = buildFullNavigationIndexV2(state.world);
    const result = updateDiscoveryV2(state, nav, state.clock.elapsedSimSeconds);
    const placeRecord = result.discoveries.find((d) => d.entityId === TEST_HOUSE_IDS.placeId);
    expect(placeRecord?.state).toBe("sighted");
  });

  it("una persona a menos de 25m observa el lugar y conoce la estructura del edificio", () => {
    const state = stateWithPersonAt("disc-v2-seed-3", { x: 5, y: 0 }); // 10m del lugar en (15,0)
    const nav = buildFullNavigationIndexV2(state.world);
    const result = updateDiscoveryV2(state, nav, state.clock.elapsedSimSeconds);
    const placeRecord = result.discoveries.find((d) => d.entityId === TEST_HOUSE_IDS.placeId);
    const buildingRecord = result.discoveries.find((d) => d.entityId === TEST_HOUSE_IDS.buildingId);
    expect(placeRecord?.state).toBe("observed");
    expect(buildingRecord?.state).toBe("observed");
  });

  it("una persona cerca de la puerta exterior la descubre como acceso conocido", () => {
    const state = stateWithPersonAt("disc-v2-seed-4", { x: 8, y: 0 }); // ~2m de la puerta en (10,0)
    const nav = buildFullNavigationIndexV2(state.world);
    const result = updateDiscoveryV2(state, nav, state.clock.elapsedSimSeconds);
    const openingRecord = result.discoveries.find((d) => d.entityId === TEST_HOUSE_IDS.exteriorOpeningId);
    expect(openingRecord?.state).toBe("observed");
  });

  it("una persona dentro de una estancia la descubre y conoce sus aberturas locales, sin revelar el resto del edificio", () => {
    const state = stateWithPersonAt("disc-v2-seed-5", { x: 18, y: 0 }, TEST_HOUSE_IDS.bedroomRoomId);
    const nav = buildFullNavigationIndexV2(state.world);
    const result = updateDiscoveryV2(state, nav, state.clock.elapsedSimSeconds);
    const bedroomRecord = result.discoveries.find((d) => d.entityId === TEST_HOUSE_IDS.bedroomRoomId);
    const interiorDoorRecord = result.discoveries.find((d) => d.entityId === TEST_HOUSE_IDS.interiorOpeningId);
    const hallwayRecord = result.discoveries.find((d) => d.entityId === TEST_HOUSE_IDS.hallwayRoomId && d.facet === "rooms");
    expect(bedroomRecord?.state).toBe("observed");
    expect(interiorDoorRecord?.state).toBe("observed");
    expect(hallwayRecord).toBeUndefined();
  });

  it("el conocimiento es monótono: no retrocede al alejarse tras haber sido observado", () => {
    const close = stateWithPersonAt("disc-v2-seed-6", { x: 5, y: 0 });
    const nav = buildFullNavigationIndexV2(close.world);
    const firstPass = updateDiscoveryV2(close, nav, close.clock.elapsedSimSeconds);
    const afterFirstPass = { ...close, discoveries: firstPass.discoveries };

    const farAgain = stateWithPersonAt("disc-v2-seed-6", { x: -60, y: 0 });
    const stateWithPriorKnowledge = { ...farAgain, discoveries: afterFirstPass.discoveries };
    const secondPass = updateDiscoveryV2(stateWithPriorKnowledge, nav, stateWithPriorKnowledge.clock.elapsedSimSeconds);

    expect(secondPass.changed).toBe(false);
    const placeRecord = stateWithPriorKnowledge.discoveries.find((d) => d.entityId === TEST_HOUSE_IDS.placeId);
    expect(placeRecord?.state).toBe("observed");
  });
});
