import type { Building, LinearFeature, Place, PlaceProfileId, WorldPoint } from "@z-world/contracts";
import { PLACE_PROFILES_BY_ID, VILLAGE_BUDGET } from "@z-world/catalogs";
import type { PrngStream } from "../../prng.js";
import type { IdAllocator } from "./id-allocator.js";
import type { TerrainResult } from "./terrain.js";
import { boundingBoxOf, boxesOverlap, orientedRectangleFootprint, pointAlongPolyline, polylineLength, type AxisAlignedFootprint } from "./geometry-helpers.js";

/**
 * Capas 6-7 de WLD-008 (§7.1 de WEB-002): huella y zonas funcionales del
 * asentamiento, parcelas y lugares/edificios con frente hacia calle o
 * camino (§7.3). No genera todavía programa/estancias (eso es
 * `buildings.ts`): aquí solo se decide "qué hay, dónde y orientado a qué"
 * dentro del presupuesto obligatorio (§7.2).
 */
export interface SettlementPlacement {
  readonly placeId: string;
  readonly buildingId: string;
  readonly profileId: PlaceProfileId;
  readonly footprint: readonly WorldPoint[];
  readonly position: WorldPoint;
  readonly isolated: boolean;
}

export interface SettlementResult {
  readonly places: Place[];
  readonly buildings: Building[];
  readonly housingPlacements: SettlementPlacement[];
  readonly commercialPlacements: SettlementPlacement[];
  readonly outbuildings: Building[];
  readonly collapsedPlaceIds: ReadonlySet<string>;
  readonly com02PlaceIds: readonly string[];
  readonly tal01PlaceIds: readonly string[];
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

interface WaySlot {
  readonly position: WorldPoint;
  readonly facingRadians: number;
}

/** Genera candidatos de parcela a lo largo de una vía, alternando de lado, con espaciado y separación deterministas (§7.3: las parcelas se conectan realmente a la calle). */
function* walkWaySlots(way: LinearFeature, spacingMeters: number, offsetMeters: number): Generator<WaySlot> {
  const length = polylineLength(way.polyline);
  let side: 1 | -1 = 1;
  for (let d = spacingMeters / 2; d < length; d += spacingMeters) {
    const { point, tangentRadians } = pointAlongPolyline(way.polyline, d);
    const normal = tangentRadians + Math.PI / 2;
    const offset = offsetMeters + way.widthMeters / 2;
    const position = { x: point.x + Math.cos(normal) * offset * side, y: point.y + Math.sin(normal) * offset * side };
    yield { position, facingRadians: tangentRadians };
    side = side === 1 ? -1 : 1;
  }
}

export function generateSettlement(prng: PrngStream, ids: IdAllocator, terrain: TerrainResult): SettlementResult {
  // El total de construcciones (§7.2) es la suma de vivienda + comercial/técnico + anexos: no son
  // presupuestos independientes, así que se derivan conjuntamente para que la suma caiga siempre en
  // [totalConstructions.min, totalConstructions.max] sin salirse de su propio rango individual
  // (documentado en `DEC-0016`).
  const targetTotal = prng.nextInt(VILLAGE_BUDGET.totalConstructions.min, VILLAGE_BUDGET.totalConstructions.max);
  const commercialCount = prng.nextInt(VILLAGE_BUDGET.commercialOrTechnical.min, VILLAGE_BUDGET.commercialOrTechnical.max);
  let outbuildingTarget = prng.nextInt(VILLAGE_BUDGET.outbuildings.min, VILLAGE_BUDGET.outbuildings.max);
  let housingCount = clamp(targetTotal - commercialCount - outbuildingTarget, VILLAGE_BUDGET.housing.min, VILLAGE_BUDGET.housing.max);
  outbuildingTarget = clamp(targetTotal - commercialCount - housingCount, VILLAGE_BUDGET.outbuildings.min, VILLAGE_BUDGET.outbuildings.max);
  housingCount = clamp(targetTotal - commercialCount - outbuildingTarget, VILLAGE_BUDGET.housing.min, VILLAGE_BUDGET.housing.max);

  const ruralCount = Math.min(prng.nextInt(VILLAGE_BUDGET.ruralOrIsolated.min, VILLAGE_BUDGET.ruralOrIsolated.max), housingCount);
  const urbanHousingCount = housingCount - ruralCount;
  const res17UrbanCount = prng.nextInt(0, Math.ceil(urbanHousingCount * 0.25));

  const com02Count = Math.max(1, Math.floor(commercialCount / 2));
  const tal01Count = Math.max(1, commercialCount - com02Count);

  const urbanWays = [terrain.mainRoad, ...terrain.secondaryStreets];
  const ruralWays = terrain.ruralTracks.length > 0 ? terrain.ruralTracks : urbanWays;

  const placedBoxes: AxisAlignedFootprint[] = [];
  const places: Place[] = [];
  const buildings: Building[] = [];
  const housingPlacements: SettlementPlacement[] = [];
  const commercialPlacements: SettlementPlacement[] = [];

  function tryPlace(
    profileId: PlaceProfileId,
    slots: Generator<WaySlot>,
    corridorFilter: (p: WorldPoint) => boolean,
    isolated: boolean,
  ): SettlementPlacement | null {
    const profile = PLACE_PROFILES_BY_ID.get(profileId);
    if (!profile?.footprintMinMeters || !profile.footprintMaxMeters) return null;
    for (const slot of slots) {
      if (!corridorFilter(slot.position)) continue;
      const width = profile.footprintMinMeters.width + prng.nextFloat() * (profile.footprintMaxMeters.width - profile.footprintMinMeters.width);
      const depth = profile.footprintMinMeters.depth + prng.nextFloat() * (profile.footprintMaxMeters.depth - profile.footprintMinMeters.depth);
      const footprint = orientedRectangleFootprint(slot.position, width, depth, slot.facingRadians);
      const box = boundingBoxOf(footprint);
      if (placedBoxes.some((existing) => boxesOverlap(existing, box))) continue;

      placedBoxes.push(box);
      const placeId = ids.next("place");
      const buildingId = ids.next("building");
      places.push({ id: placeId, profileId, position: slot.position, buildingId });
      buildings.push({ id: buildingId, placeId, footprint, labelKey: `place.${profileId.toLowerCase()}`, interiorGenerated: true, activeFloorId: null });
      return { placeId, buildingId, profileId, footprint, position: slot.position, isolated };
    }
    return null;
  }

  const corridor = terrain.settlementCorridor;
  const inCorridor = (p: WorldPoint) => p.x >= corridor.minX && p.x <= corridor.maxX && p.y >= corridor.minY && p.y <= corridor.maxY;
  const isBounded = (p: WorldPoint, half: number) => Math.abs(p.x) < half - 20 && Math.abs(p.y) < half - 20;

  function* urbanSlots(): Generator<WaySlot> {
    for (let pass = 0; pass < 6; pass++) {
      for (const way of urbanWays) {
        yield* walkWaySlots(way, 16 + pass * 2, 6 + pass * 3);
      }
    }
  }
  function* ruralSlots(): Generator<WaySlot> {
    for (let pass = 0; pass < 6; pass++) {
      for (const way of ruralWays) {
        yield* walkWaySlots(way, 28 + pass * 4, 6 + pass * 4);
      }
    }
  }

  for (let i = 0; i < urbanHousingCount; i++) {
    const profileId: PlaceProfileId = i < res17UrbanCount ? "RES-17" : "RES-10";
    const placement = tryPlace(profileId, urbanSlots(), inCorridor, false);
    if (placement) housingPlacements.push(placement);
  }
  for (let i = 0; i < ruralCount; i++) {
    const placement = tryPlace("RES-17", ruralSlots(), (p) => isBounded(p, terrain.bounds.maxX) && !inCorridor(p), true);
    if (placement) housingPlacements.push(placement);
  }
  for (let i = 0; i < com02Count; i++) {
    const placement = tryPlace("COM-02", urbanSlots(), inCorridor, false);
    if (placement) commercialPlacements.push(placement);
  }
  for (let i = 0; i < tal01Count; i++) {
    const placement = tryPlace("TAL-01", urbanSlots(), inCorridor, false);
    if (placement) commercialPlacements.push(placement);
  }

  // Cobertizos/garajes/anexos (§7.2/§8.1): subestructuras físicas ligadas al Place de una vivienda, nunca un Place propio.
  // Se intenta varias veces por vivienda (y, si hace falta, más de un anexo por vivienda) para acercarse al
  // objetivo del presupuesto sin inventar viviendas nuevas solo para alojar cobertizos.
  const outbuildings: Building[] = [];
  const hostOrder = prng.shuffle([...housingPlacements.keys()]);
  let hostCursor = 0;
  let attempts = 0;
  const maxAttempts = outbuildingTarget * 12 + hostOrder.length;
  while (outbuildings.length < outbuildingTarget && attempts < maxAttempts && hostOrder.length > 0) {
    attempts += 1;
    const host = housingPlacements[hostOrder[hostCursor % hostOrder.length]!]!;
    hostCursor += 1;
    const offsetAngle = prng.nextFloat() * Math.PI * 2;
    const offsetDistance = 9 + prng.nextFloat() * 6;
    const shedCenter = { x: host.position.x + Math.cos(offsetAngle) * offsetDistance, y: host.position.y + Math.sin(offsetAngle) * offsetDistance };
    const shedFootprint = orientedRectangleFootprint(shedCenter, 3 + prng.nextFloat() * 2, 3 + prng.nextFloat() * 2, prng.nextFloat() * Math.PI);
    const box = boundingBoxOf(shedFootprint);
    if (placedBoxes.some((existing) => boxesOverlap(existing, box, 1))) continue;
    placedBoxes.push(box);
    const shedId = ids.next("building");
    outbuildings.push({ id: shedId, placeId: host.placeId, footprint: shedFootprint, labelKey: "place.outbuilding_shed", interiorGenerated: false, activeFloorId: null });
  }

  // Construcciones colapsadas (§7.2/§9.1): condición de historia sobre instancias ya soportadas, nunca un arquetipo nuevo.
  const collapsedCandidates = [...housingPlacements.filter((p) => !p.isolated), ...commercialPlacements];
  const collapsedCount = Math.min(prng.nextInt(VILLAGE_BUDGET.collapsed.min, VILLAGE_BUDGET.collapsed.max), collapsedCandidates.length);
  const collapsedPlaceIds = new Set(prng.shuffle(collapsedCandidates).slice(0, collapsedCount).map((p) => p.placeId));
  for (let i = 0; i < buildings.length; i++) {
    const building = buildings[i]!;
    if (collapsedPlaceIds.has(building.placeId)) {
      buildings[i] = { ...building, interiorGenerated: false, activeFloorId: null };
    }
  }

  return {
    places,
    buildings,
    housingPlacements,
    commercialPlacements,
    outbuildings,
    collapsedPlaceIds,
    com02PlaceIds: commercialPlacements.filter((p) => p.profileId === "COM-02").map((p) => p.placeId),
    tal01PlaceIds: commercialPlacements.filter((p) => p.profileId === "TAL-01").map((p) => p.placeId),
  };
}
