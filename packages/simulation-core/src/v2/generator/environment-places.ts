import type { LinearFeature, LootingRoute, NaturalOrTechnicalNode, Parcel, Place, TerrainArea } from "@z-world/contracts";
import type { PrngStream } from "../../prng.js";
import type { IdAllocator } from "./id-allocator.js";
import { centroidOf, polylineLength } from "./geometry-helpers.js";
import type { TerrainResult } from "./terrain.js";

/**
 * Capas 7-9 de WLD-008 para los perfiles no edificados (§8.1 de
 * WEB-002): `ENV-01` (fuente de agua), `ENV-02` (campo/parcela abierta),
 * `ENV-03` (bosque/matorral) y `ENV-04` (carretera/camino) como `Place`
 * jugables, enlazados a su geometría real (nodo/área/línea), nunca un
 * noveno perfil ni una entidad flotante sin geometría.
 */
export interface EnvironmentPlacesResult {
  readonly places: Place[];
  readonly updatedNodes: NaturalOrTechnicalNode[];
  readonly updatedAreas: TerrainArea[];
  readonly updatedLines: LinearFeature[];
  readonly parcels: Parcel[];
  readonly env02PlaceIds: readonly string[];
  readonly lootingRoutes: LootingRoute[];
}

export function generateEnvironmentPlaces(
  prng: PrngStream,
  ids: IdAllocator,
  terrain: TerrainResult,
  lootedHousingOrCommercialPlaceIds: readonly string[],
): EnvironmentPlacesResult {
  const places: Place[] = [];
  const updatedNodes: NaturalOrTechnicalNode[] = [];
  const updatedAreas: TerrainArea[] = [];
  const updatedLines: LinearFeature[] = [];
  const parcels: Parcel[] = [];

  for (const node of [terrain.mainWaterNode, ...terrain.secondaryWaterNodes]) {
    const placeId = ids.next("place");
    places.push({ id: placeId, profileId: "ENV-01", position: node.position, buildingId: null });
    updatedNodes.push({ ...node, placeId });
  }

  const fieldAreaIds = new Set(terrain.fieldAreaIds);
  const env02Count = Math.min(prng.nextInt(3, 6), terrain.fieldAreaIds.length);
  const chosenFieldIds = new Set(prng.shuffle(terrain.fieldAreaIds).slice(0, env02Count));
  // El resto de bolsas de campo (§10.3: WLD-010 §3.5 "despejar residuos") no elegidas como ENV-02 quedan disponibles
  // para demostrar `clear_debris` sobre una bolsa de terreno abierto real y localizada, nunca sobre el fondo entero
  // del mapa (que también es `kind: "open_ground"` pero cubre todo el mundo y no es un objetivo demostrable).
  const unchosenFieldIds = terrain.fieldAreaIds.filter((id) => !chosenFieldIds.has(id));
  const debrisIds = new Set(prng.shuffle(unchosenFieldIds).slice(0, Math.min(2, unchosenFieldIds.length)));
  for (const area of terrain.terrainAreas) {
    if (!fieldAreaIds.has(area.id)) continue;
    if (chosenFieldIds.has(area.id)) {
      const placeId = ids.next("place");
      places.push({ id: placeId, profileId: "ENV-02", position: centroidOf(area.polygon), buildingId: null });
      updatedAreas.push({ ...area, placeId });
      parcels.push({ id: ids.next("parcel"), polygon: area.polygon, cultivationPlotId: null, terrainAreaId: area.id });
      continue;
    }
    updatedAreas.push(debrisIds.has(area.id) ? { ...area, coverage: "debris" } : area);
  }

  const forestAreaIds = new Set(terrain.forestAreaIds);
  const env03Count = Math.min(prng.nextInt(2, 4), terrain.forestAreaIds.length);
  const chosenForestIds = new Set(prng.shuffle(terrain.forestAreaIds).slice(0, env03Count));
  for (const area of terrain.terrainAreas) {
    if (!forestAreaIds.has(area.id)) continue;
    if (!chosenForestIds.has(area.id)) {
      updatedAreas.push(area);
      continue;
    }
    const placeId = ids.next("place");
    places.push({ id: placeId, profileId: "ENV-03", position: centroidOf(area.polygon), buildingId: null });
    updatedAreas.push({ ...area, placeId });
  }
  // El resto de áreas (fondo transitable, roca) no son Place: son terreno de fondo sin perfil jugable propio.
  for (const area of terrain.terrainAreas) {
    if (fieldAreaIds.has(area.id) || forestAreaIds.has(area.id)) continue;
    updatedAreas.push(area);
  }

  const waysForEnv04: LinearFeature[] = [terrain.mainRoad, ...terrain.secondaryStreets, ...terrain.ruralTracks];
  const env04Count = Math.min(prng.nextInt(2, 3), waysForEnv04.length);
  const chosenWayIds = new Set(prng.shuffle(waysForEnv04).slice(0, env04Count).map((w) => w.id));
  for (const line of terrain.linearFeatures) {
    if (!chosenWayIds.has(line.id)) {
      updatedLines.push(line);
      continue;
    }
    const placeId = ids.next("place");
    const midpoint = pointAtHalfLength(line);
    places.push({ id: placeId, profileId: "ENV-04", position: midpoint, buildingId: null });
    updatedLines.push({ ...line, placeId });
  }

  const lootingRoutes: LootingRoute[] = [];
  if (lootedHousingOrCommercialPlaceIds.length >= 2) {
    const waypointCount = Math.min(4, lootedHousingOrCommercialPlaceIds.length);
    lootingRoutes.push({ id: ids.next("looting-route"), waypointPlaceIds: prng.shuffle(lootedHousingOrCommercialPlaceIds).slice(0, waypointCount) });
  }

  return { places, updatedNodes, updatedAreas, updatedLines, parcels, env02PlaceIds: places.filter((p) => p.profileId === "ENV-02").map((p) => p.id), lootingRoutes };
}

function pointAtHalfLength(line: LinearFeature) {
  const half = polylineLength(line.polyline) / 2;
  let remaining = half;
  for (let i = 0; i < line.polyline.length - 1; i++) {
    const a = line.polyline[i]!;
    const b = line.polyline[i + 1]!;
    const segLength = Math.hypot(b.x - a.x, b.y - a.y);
    if (remaining <= segLength) {
      const t = segLength === 0 ? 0 : remaining / segLength;
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    }
    remaining -= segLength;
  }
  return line.polyline[line.polyline.length - 1]!;
}
