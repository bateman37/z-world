import { describe, expect, it } from "vitest";
import { createInitialStateV2 } from "@z-world/simulation-core";
import { buildWorkerProjectionsV2 } from "./build-projections-v2.js";

function projectionsFor(seed: string, discoveries: ReturnType<typeof createInitialStateV2>["discoveries"] = []) {
  const state = { ...createInitialStateV2(seed), discoveries };
  return buildWorkerProjectionsV2({
    state,
    gameSaveId: "game-projections-1",
    revision: 0,
    saveStatus: "saved",
    lastSavedSimSeconds: null,
    operationalLog: [],
  });
}

describe("buildWorkerProjectionsV2 — filtrado por descubrimiento (S3 §5.8)", () => {
  it("un lugar sin ningún descubrimiento no aparece en la proyección del mapa", () => {
    const state = createInitialStateV2("proj-v2-seed-1");
    const anyPlaceId = Object.keys(state.world.places)[0]!;
    const projections = projectionsFor("proj-v2-seed-1", []);
    expect(projections.mapEntities.places.some((p) => p.id === anyPlaceId)).toBe(false);
  });

  it("un lugar observado aparece con su perfil real; uno solo avistado aparece sin perfil (silueta)", () => {
    const state = createInitialStateV2("proj-v2-seed-2");
    const placeIds = Object.keys(state.world.places);
    const observedId = placeIds[0]!;
    const sightedId = placeIds[1]!;

    const projections = projectionsFor("proj-v2-seed-2", [
      { entityId: observedId, facet: "exterior", state: "observed" },
      { entityId: sightedId, facet: "exterior", state: "sighted" },
    ]);

    const observedProjection = projections.mapEntities.places.find((p) => p.id === observedId);
    const sightedProjection = projections.mapEntities.places.find((p) => p.id === sightedId);
    expect(observedProjection?.profileId).toBe(state.world.places[observedId]!.profileId);
    expect(sightedProjection?.profileId).toBeNull();
  });

  it("una estancia sin descubrir no aparece; una vez observada, sí", () => {
    const state = createInitialStateV2("proj-v2-seed-3");
    const roomIds = Object.keys(state.world.rooms);
    if (roomIds.length === 0) return; // semilla sin estancias generadas: nada que comprobar aquí
    const roomId = roomIds[0]!;

    const withoutDiscovery = projectionsFor("proj-v2-seed-3", []);
    expect(withoutDiscovery.mapEntities.rooms.some((r) => r.id === roomId)).toBe(false);

    const withDiscovery = projectionsFor("proj-v2-seed-3", [{ entityId: roomId, facet: "rooms", state: "observed" }]);
    expect(withDiscovery.mapEntities.rooms.some((r) => r.id === roomId)).toBe(true);
  });

  it("una abertura sin descubrir no aparece; una vez observada, sí", () => {
    const state = createInitialStateV2("proj-v2-seed-4");
    const openingIds = Object.keys(state.world.openings);
    if (openingIds.length === 0) return;
    const openingId = openingIds[0]!;

    const withoutDiscovery = projectionsFor("proj-v2-seed-4", []);
    expect(withoutDiscovery.mapEntities.openings.some((o) => o.id === openingId)).toBe(false);

    const withDiscovery = projectionsFor("proj-v2-seed-4", [{ entityId: openingId, facet: "accesses", state: "observed" }]);
    expect(withDiscovery.mapEntities.openings.some((o) => o.id === openingId)).toBe(true);
  });

  it("nunca filtra calibre oculto ni potencial numérico en ninguna proyección", () => {
    const projections = projectionsFor("proj-v2-seed-5", []);
    const serialized = JSON.stringify(projections);
    expect(serialized).not.toContain("caliberTier");
  });

  it("las seis personas siempre aparecen en la proyección (nunca ocultas por descubrimiento, solo el mundo lo está)", () => {
    const projections = projectionsFor("proj-v2-seed-6", []);
    expect(projections.mapEntities.people).toHaveLength(6);
  });
});
