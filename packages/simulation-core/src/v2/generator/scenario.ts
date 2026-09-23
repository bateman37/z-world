import type {
  Building,
  Container,
  CultivationPlot,
  Parcel,
  Place,
  Room,
  ResourceLot,
  TransportMeans,
  WorldObject,
  WorldPoint,
} from "@z-world/contracts";
type RoomsByBuildingId = ReadonlyMap<string, readonly Room[]>;
import { SHELTER_DISTANCE_METERS } from "@z-world/catalogs";
import type { PrngStream } from "../../prng.js";
import type { IdAllocator } from "./id-allocator.js";
import { distance } from "./geometry-helpers.js";
import type { SettlementPlacement } from "./settlement.js";

/**
 * Materialización del escenario inicial acordado (§7.5 de WEB-002): el
 * refugio provisional, un medio de transporte recuperable, una parcela de
 * cultivo candidata con semillas y herramienta, y un puñado de objetos
 * demostradores. Nada de esto se añade después de exponer el mundo al
 * jugador: forma parte del mismo pase de generación que todo lo demás
 * (§7.5: "nunca añade una solución después de que el jugador observe el
 * mundo").
 */
export interface ScenarioGuaranteesResult {
  readonly shelterPlaceId: string;
  readonly shelterBuildingId: string;
  readonly shelterDistanceMeters: number;
  readonly transportMeans: TransportMeans[];
  readonly cultivationPlots: CultivationPlot[];
  readonly extraResourceLots: ResourceLot[];
  readonly extraWorldObjects: WorldObject[];
  readonly extraContainers: Container[];
  readonly degradations: readonly string[];
}

export function materializeScenarioGuarantees(
  prng: PrngStream,
  ids: IdAllocator,
  arrivalPoint: WorldPoint,
  housingPlacements: readonly SettlementPlacement[],
  commercialPlacements: readonly SettlementPlacement[],
  places: readonly Place[],
  buildings: readonly Building[],
  parcels: readonly Parcel[],
  roomsByBuildingId: RoomsByBuildingId,
  collapsedPlaceIds: ReadonlySet<string>,
): ScenarioGuaranteesResult {
  const degradations: string[] = [];

  const candidates = housingPlacements
    .filter((p) => !collapsedPlaceIds.has(p.placeId))
    .map((p) => ({ p, d: distance(p.position, arrivalPoint) }))
    .filter(({ d }) => d >= SHELTER_DISTANCE_METERS.min && d <= SHELTER_DISTANCE_METERS.max)
    .sort((a, b) => (a.p.profileId === "RES-17" ? -1 : 1) - (b.p.profileId === "RES-17" ? -1 : 1));

  let shelter = candidates[0]?.p;
  let shelterDistanceMeters = candidates[0]?.d ?? 0;
  if (!shelter) {
    const fallback = housingPlacements
      .filter((p) => !collapsedPlaceIds.has(p.placeId))
      .map((p) => ({ p, d: distance(p.position, arrivalPoint) }))
      .sort((a, b) => a.d - b.d)[0];
    if (!fallback) throw new Error("Generación inválida: no hay ninguna vivienda utilizable para servir de refugio provisional.");
    shelter = fallback.p;
    shelterDistanceMeters = fallback.d;
    degradations.push(
      `Ninguna vivienda cayó dentro de ${SHELTER_DISTANCE_METERS.min}-${SHELTER_DISTANCE_METERS.max} m del punto de llegada; se usó la más cercana (${shelterDistanceMeters.toFixed(1)} m) como refugio provisional.`,
    );
  }

  // Medio de transporte recuperable: en un taller si existe, si no junto a la primera vivienda urbana.
  const transportHost = commercialPlacements.find((p) => p.profileId === "TAL-01") ?? housingPlacements[0];
  const transportMeans: TransportMeans[] = [
    {
      id: ids.next("transport"),
      method: prng.pick(["wheelbarrow", "handcart"] as const),
      location: { kind: "world_point", point: transportHost ? offsetPoint(transportHost.position, prng) : arrivalPoint },
      capacityKg: 60 + prng.nextInt(0, 40),
      condition: 0.4 + prng.nextFloat() * 0.5,
      currentLoadBundleId: null,
    },
  ];

  // Parcela de cultivo candidata más cercana al refugio (§7.5, §20.3: solo el terreno/semillas/herramienta, sin ciclo jugable todavía).
  const cultivationPlots: CultivationPlot[] = [];
  const extraResourceLots: ResourceLot[] = [];
  const extraWorldObjects: WorldObject[] = [];
  const extraContainers: Container[] = [];

  const nearestParcel = [...parcels].sort((a, b) => distance(centroid(a.polygon), shelter!.position) - distance(centroid(b.polygon), shelter!.position))[0];
  if (nearestParcel) {
    const plotId = ids.next("cultivation-plot");
    cultivationPlots.push({ id: plotId, parcelId: nearestParcel.id, state: "unprepared", activeCropCycleId: null });
    extraResourceLots.push({
      id: ids.next("resource-lot"),
      family: "seeds",
      quantity: 1 + prng.nextInt(0, 2),
      unit: "kilogram",
      location: { kind: "field_edge", parcelId: nearestParcel.id },
      condition: 0.6 + prng.nextFloat() * 0.3,
      reservedByJobId: null,
    });
    extraWorldObjects.push({
      id: ids.next("object"),
      family: "tool_set",
      variant: "tool_set.hand_hoe",
      location: { kind: "field_edge", parcelId: nearestParcel.id },
      ownerOrReservedByJobId: null,
      weightKg: 1.5,
      bulk: "small",
      condition: 0.5 + prng.nextFloat() * 0.4,
      quality: 0.4,
      functionalState: "functional",
    });
  } else {
    degradations.push("No se generó ninguna parcela ENV-02 cercana al refugio: no hay candidata de cultivo demostrable en esta semilla.");
  }

  // Demostradores de las cinco capas de explotación (§8.6) y de familias adicionales del catálogo (§7.5), colocados en el refugio mismo.
  const shelterBuilding = buildings.find((b) => b.placeId === shelter!.placeId)!;
  const shelterRooms = roomsByBuildingId.get(shelterBuilding.id) ?? [];
  const shelterStorageRoom = shelterRooms.find((r) => r.programRoleKey && ["domestic_storage", "minimal_storage"].includes(r.programRoleKey));
  const containerId = ids.next("container");
  const lightId = ids.next("object");
  const restId = ids.next("object");
  extraWorldObjects.push(
    {
      id: lightId,
      family: "light_source",
      variant: "light_source.oil_lantern",
      location: { kind: "container", containerId },
      ownerOrReservedByJobId: null,
      weightKg: 0.8,
      bulk: "small",
      condition: 0.6,
      quality: 0.5,
      functionalState: "functional",
    },
    {
      id: restId,
      family: "rest_furniture",
      variant: "rest_furniture.bedroll",
      location: { kind: "container", containerId },
      ownerOrReservedByJobId: null,
      weightKg: 2,
      bulk: "medium",
      condition: 0.5,
      quality: 0.4,
      functionalState: "functional",
    },
  );
  extraContainers.push({
    id: containerId,
    location: shelterStorageRoom ? { kind: "room", roomId: shelterStorageRoom.id } : { kind: "world_point", point: shelter.position },
    capacityUnits: 15,
    contentIds: [lightId, restId],
  });

  return {
    shelterPlaceId: shelter.placeId,
    shelterBuildingId: shelter.buildingId,
    shelterDistanceMeters,
    transportMeans,
    cultivationPlots,
    extraResourceLots,
    extraWorldObjects,
    extraContainers,
    degradations,
  };
}

function offsetPoint(point: WorldPoint, prng: PrngStream): WorldPoint {
  return { x: point.x + prng.nextInt(-4, 4), y: point.y + prng.nextInt(-4, 4) };
}

function centroid(polygon: readonly WorldPoint[]): WorldPoint {
  let x = 0;
  let y = 0;
  for (const p of polygon) {
    x += p.x;
    y += p.y;
  }
  return { x: x / polygon.length, y: y / polygon.length };
}
