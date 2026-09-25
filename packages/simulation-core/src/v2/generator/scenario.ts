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
import { SHELTER_DISTANCE_METERS, TRANSPORT_MEANS_VARIANT_BY_METHOD } from "@z-world/catalogs";
import { catalogEntry, makeResourceLot, makeWorldObject } from "./buildings.js";
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
  /** `Parcel` garantizada que recibe el enlace de vuelta a su `CultivationPlot` (S10 §8.2: enlace bidireccional). `null` si ninguna parcela ENV-02 estaba disponible. */
  readonly updatedParcel: Parcel | null;
  readonly extraResourceLots: ResourceLot[];
  readonly extraWorldObjects: WorldObject[];
  readonly extraContainers: Container[];
  /**
   * Presupuesto de agua y comidas del grupo de SCN-003 §3.5 (v2): lo llevan
   * las personas (`belongings.ts`), no el refugio. Se deriva de las mismas
   * tiradas que v1 usaba para el agua/comida del refugio, así que el stream
   * `world` no se desplaza y el agua nunca existe dos veces.
   */
  readonly groupSupplies: { readonly waterLiters: number; readonly waterCondition: number; readonly mealCount: number; readonly mealCondition: number };
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
  const transportId = ids.next("transport");
  const transportMethod = prng.pick(["wheelbarrow", "handcart"] as const);
  const transportLocation = { kind: "world_point" as const, point: transportHost ? offsetPoint(transportHost.position, prng) : arrivalPoint };
  const transportCapacityKg = 60 + prng.nextInt(0, 40);
  const transportCondition = 0.4 + prng.nextFloat() * 0.5;
  const transportMeans: TransportMeans[] = [makeTransportMeans(transportId, transportMethod, transportLocation, transportCapacityKg, transportCondition)];

  // Parcela de cultivo candidata más cercana al refugio (§7.5, §20.3: solo el terreno/semillas/herramienta, sin ciclo jugable todavía).
  const cultivationPlots: CultivationPlot[] = [];
  const extraResourceLots: ResourceLot[] = [];
  const extraWorldObjects: WorldObject[] = [];
  const extraContainers: Container[] = [];

  const nearestParcel = [...parcels].sort((a, b) => distance(centroid(a.polygon), shelter!.position) - distance(centroid(b.polygon), shelter!.position))[0];
  let updatedParcel: Parcel | null = null;
  if (nearestParcel) {
    const plotId = ids.next("cultivation-plot");
    cultivationPlots.push({ id: plotId, parcelId: nearestParcel.id, state: "unprepared", activeCropCycleId: null, preparationProgress: 0, damageLevel: 0 });
    updatedParcel = { ...nearestParcel, cultivationPlotId: plotId };
    extraResourceLots.push(
      makeResourceLot({
        id: ids.next("resource-lot"),
        family: "seeds",
        quantity: 1 + prng.nextInt(0, 2),
        unit: "kilogram",
        location: { kind: "field_edge", parcelId: nearestParcel.id },
        condition: 0.6 + prng.nextFloat() * 0.3,
      }),
    );
    extraWorldObjects.push(
      makeWorldObject({
        id: ids.next("object"),
        variant: "tool_set.agriculture",
        location: { kind: "field_edge", parcelId: nearestParcel.id },
        condition: 0.5 + prng.nextFloat() * 0.4,
        quality: 0.4,
        functionalState: "functional",
      }),
    );
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
  const waterContainerId = ids.next("container");
  const waterVesselId = ids.next("object");
  // v1 dejaba aquí, en el refugio, el agua y las comidas garantizadas por
  // S6. v2 (S7) las reconcilia con SCN-003 §3.5: son pertenencias que el
  // grupo trae consigo y que `belongings.ts` reparte por persona. Se
  // conservan exactamente las mismas tiradas (cantidad y condición) para no
  // desplazar el stream `world`; el refugio conserva la garrafa vacía, el
  // farol y el rollo de dormir como soluciones parciales por descubrir.
  const waterLiters = 5 + prng.nextInt(0, 3);
  const waterCondition = 0.7 + prng.nextFloat() * 0.3;
  const mealCondition = 0.6 + prng.nextFloat() * 0.3;
  extraWorldObjects.push(
    makeWorldObject({
      id: waterVesselId,
      variant: "work_container.jerry_can",
      location: { kind: "container", containerId: waterContainerId },
      condition: 0.6,
      quality: 0.5,
      functionalState: "functional",
    }),
  );
  extraContainers.push({
    id: waterContainerId,
    location: shelterStorageRoom ? { kind: "room", roomId: shelterStorageRoom.id } : { kind: "world_point", point: shelter.position },
    capacityUnits: 12,
    contentIds: [waterVesselId],
    hostFurnitureId: null,
    hostWorldObjectId: null,
    acceptedHandlingTags: null,
  });
  extraWorldObjects.push(
    makeWorldObject({ id: lightId, variant: "light_source.lantern", location: { kind: "container", containerId }, condition: 0.6, quality: 0.5, functionalState: "functional" }),
    makeWorldObject({ id: restId, variant: "rest_furniture.bedroll", location: { kind: "container", containerId }, condition: 0.5, quality: 0.4, functionalState: "functional" }),
  );
  extraContainers.push({
    id: containerId,
    location: shelterStorageRoom ? { kind: "room", roomId: shelterStorageRoom.id } : { kind: "world_point", point: shelter.position },
    capacityUnits: 15,
    contentIds: [lightId, restId],
    hostFurnitureId: null,
    hostWorldObjectId: null,
    acceptedHandlingTags: null,
  });

  return {
    shelterPlaceId: shelter.placeId,
    shelterBuildingId: shelter.buildingId,
    shelterDistanceMeters,
    transportMeans,
    cultivationPlots,
    updatedParcel,
    extraResourceLots,
    extraWorldObjects,
    extraContainers,
    groupSupplies: { waterLiters, waterCondition, mealCount: 6, mealCondition },
    degradations,
  };
}

/**
 * Carretilla/carro como objeto completo (S7, CAT-005 §3.2): identidad,
 * condición, capacidad, estado funcional y perfiles versionados del
 * catálogo. El estado funcional se deriva de la condición ya muestreada
 * (sin tiradas nuevas): por debajo de 0,55 la rueda está rota y el medio
 * no puede usarse hasta repararlo con piezas mecánicas concretas.
 */
export function makeTransportMeans(
  id: string,
  method: "wheelbarrow" | "handcart",
  location: TransportMeans["location"],
  capacityKg: number,
  condition: number,
): TransportMeans {
  const entry = catalogEntry(TRANSPORT_MEANS_VARIANT_BY_METHOD[method]);
  const broken = condition < 0.55;
  return {
    id,
    method,
    location,
    capacityKg,
    condition,
    currentLoadBundleId: null,
    variant: entry.variant,
    weightKg: entry.defaultWeightKg,
    bulk: entry.defaultBulk,
    quality: 0.5,
    functionalState: broken ? "broken" : condition < 0.7 ? "degraded" : "functional",
    handlingTags: [...entry.defaultHandlingTags],
    functions: broken ? [] : [...entry.defaultFunctions],
    inactiveFunctionReasons: broken ? { hauling: "broken_wheel" } : {},
    missingParts: [],
    repairProfileId: entry.repairProfileId,
    disassemblyProfileId: entry.disassemblyProfileId,
    provenance: "generated",
    knownEvidenceIds: [],
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
