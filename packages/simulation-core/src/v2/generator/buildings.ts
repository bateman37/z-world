import type {
  Anchor,
  Building,
  BusinessProfile,
  Container,
  Floor,
  Furniture,
  InstalledClosure,
  LootPressureBand,
  LootPressureZone,
  Opening,
  OccupantProfile,
  Place,
  PlaceHistory,
  PlaceHistoryKind,
  ResourceLot,
  Room,
  WorldObject,
  WorldPoint,
} from "@z-world/contracts";
import { BUILDING_PROGRAMS_BY_PROFILE, OBJECT_CATALOG_BY_VARIANT, type ObjectCatalogEntry, type RoomProgramRole } from "@z-world/catalogs";
import { REPAIR_PROFILES_BY_ID, DISASSEMBLY_PROFILES_BY_ID } from "@z-world/catalogs";

const WARDROBE_REPAIR_PROFILE_ID = "repair.storage_furniture.wardrobe_shelf.v1";
const WARDROBE_DISASSEMBLY_PROFILE_ID = "disassembly.storage_furniture.wardrobe_shelf.v1";
const FRIDGE_REPAIR_PROFILE_ID = "repair.technical_appliance.fridge.v1";
const FRIDGE_DISASSEMBLY_PROFILE_ID = "disassembly.technical_appliance.fridge.v1";
if (!REPAIR_PROFILES_BY_ID.has(WARDROBE_REPAIR_PROFILE_ID) || !REPAIR_PROFILES_BY_ID.has(FRIDGE_REPAIR_PROFILE_ID)) {
  throw new Error("Perfil de reparación de demostrador S7 no encontrado en el catálogo.");
}
if (!DISASSEMBLY_PROFILES_BY_ID.has(WARDROBE_DISASSEMBLY_PROFILE_ID) || !DISASSEMBLY_PROFILES_BY_ID.has(FRIDGE_DISASSEMBLY_PROFILE_ID)) {
  throw new Error("Perfil de desmontaje de demostrador S7 no encontrado en el catálogo.");
}

/** Entrada de catálogo obligatoria: una variante generada sin catálogo es un error de programación, nunca un objeto silencioso. */
export function catalogEntry(variant: string): ObjectCatalogEntry {
  const found = OBJECT_CATALOG_BY_VARIANT.get(variant);
  if (!found) throw new Error(`Variante de objeto sin entrada de catálogo: ${variant}.`);
  return found;
}

/**
 * Elección determinista de variante por clave estable (el ID ya asignado),
 * sin consumir tiradas del stream `world`: el trazado de una semilla no
 * cambia entre `web-002-semantic-v1` y `v2` (ver `config.ts`).
 */
function pickByKey<T>(key: string, items: readonly T[]): T {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (Math.imul(h, 31) + key.charCodeAt(i)) >>> 0;
  return items[h % items.length]!;
}

const OBJECT_VARIANTS_BY_ROLE_FAMILY: Readonly<Partial<Record<WorldObject["family"], readonly string[]>>> = {
  personal_liquid_container: ["personal_liquid_container.bottle", "personal_liquid_container.canteen"],
  tool_set: ["tool_set.basic", "tool_set.carpentry"],
  storage_furniture: ["storage_furniture.storage_box"],
};

/** Mobiliario sin contenedor propio que representa una de las catorce familias (S7, CAT-005 §3.1). */
const FAMILY_FURNITURE_BY_KIND: Readonly<Record<string, string>> = {
  "furniture.bed": "rest_furniture.simple_bed",
  "furniture.cot": "rest_furniture.simple_bed",
  "furniture.workbench": "workbench.workbench",
};
import type { PrngStream } from "../../prng.js";
import type { IdAllocator } from "./id-allocator.js";
import { centroidOf, distance } from "./geometry-helpers.js";
import type { SettlementPlacement } from "./settlement.js";

/**
 * Capa 8 de WLD-008 (§7.1/§8 de WEB-002): programa y grafo funcional de
 * cada edificio de los cuatro perfiles con programa (§8.2), geometría de
 * planta activa, jerarquía `Building → Room → Furniture/Installation →
 * Container → Content` (§8.3), y datos de historia/ocupación previa
 * (§8.4, §9). Un edificio marcado como colapsado (`interiorGenerated:
 * false` desde `settlement.ts`) no recibe programa: solo huella e
 * historia, coherente con "parcialmente inutilizable" (§9.1).
 */

export interface BuildingContentResult {
  readonly floors: Floor[];
  readonly rooms: Room[];
  readonly openings: Opening[];
  readonly installedClosures: InstalledClosure[];
  readonly anchors: Anchor[];
  readonly furniture: Furniture[];
  readonly containers: Container[];
  readonly worldObjects: WorldObject[];
  readonly resourceLots: ResourceLot[];
  readonly occupantProfiles: OccupantProfile[];
  readonly businessProfiles: BusinessProfile[];
  readonly placeHistories: PlaceHistory[];
  readonly lootPressureZones: LootPressureZone[];
  /** ids de estancia de entrada (con acceso exterior) por edificio, útiles para materialización posterior. */
  readonly entryRoomIdsByBuildingId: ReadonlyMap<string, readonly string[]>;
}

const ECONOMIC_STRATA = ["low", "medium", "high"] as const;
const PROFESSION_KEYS = ["profession.teacher", "profession.mechanic", "profession.farmer", "profession.shopkeeper", "profession.nurse", "profession.carpenter", "profession.retired"] as const;
const HOBBY_KEYS = ["hobby.gardening", "hobby.hiking", "hobby.woodworking", "hobby.fishing", "hobby.reading", "hobby.sewing"] as const;
const BUSINESS_KIND_BY_PROFILE: Record<"COM-02" | "TAL-01", readonly string[]> = {
  "COM-02": ["business.small_grocery", "business.general_store", "business.village_market_kiosk"],
  "TAL-01": ["business.mechanic_workshop", "business.bicycle_and_tool_repair", "business.small_garage"],
};
const HISTORY_KIND_POOL: readonly PlaceHistoryKind[] = ["abandonment", "hasty_flight", "looted", "temporary_occupation", "recent_presence", "evacuation"];
const LOOT_BAND_POOL: readonly LootPressureBand[] = ["nearly_intact", "lightly_looted", "looted", "heavily_looted"];

const FURNITURE_BY_ROLE: Record<RoomProgramRole, readonly string[]> = {
  entry_distributor: ["furniture.coat_rack", "furniture.shoe_bench"],
  common_space: ["furniture.sofa", "furniture.low_table"],
  kitchen: ["furniture.kitchen_counter", "furniture.stove", "furniture.fridge"],
  bathroom: ["furniture.sink", "furniture.tub"],
  bedroom: ["furniture.bed", "furniture.wardrobe"],
  domestic_storage: ["furniture.storage_shelf", "furniture.trunk"],
  main_multiuse_room: ["furniture.bed", "furniture.small_table"],
  kitchen_solution: ["furniture.camp_stove_counter"],
  rest_area: ["furniture.cot"],
  minimal_storage: ["furniture.storage_shelf"],
  public_sales_floor: ["furniture.display_table"],
  checkout: ["furniture.counter_till"],
  shelving_display: ["furniture.shelving_unit"],
  back_storage: ["furniture.pallet_rack"],
  restroom: ["furniture.sink"],
  customer_access: ["furniture.entry_mat"],
  service_or_loading_access: ["furniture.loading_bench"],
  work_area: ["furniture.hydraulic_lift"],
  workbench_tools: ["furniture.workbench"],
  parts_storage: ["furniture.parts_shelf"],
  minimal_office: ["furniture.desk"],
  restroom_locker: ["furniture.locker"],
  personnel_access: ["furniture.entry_mat"],
  wide_gate: ["furniture.gate_rail"],
};

const CONTAINER_ROLES: ReadonlySet<RoomProgramRole> = new Set([
  "kitchen",
  "kitchen_solution",
  "domestic_storage",
  "minimal_storage",
  "back_storage",
  "parts_storage",
  "bathroom",
]);

function contentFor(role: RoomProgramRole): { readonly resourceFamilies: readonly ResourceLot["family"][]; readonly objectFamilies: readonly WorldObject["family"][] } {
  switch (role) {
    case "kitchen":
    case "kitchen_solution":
      return { resourceFamilies: ["preserved_food", "water"], objectFamilies: ["personal_liquid_container"] };
    case "domestic_storage":
    case "minimal_storage":
      return { resourceFamilies: ["wood_and_planks"], objectFamilies: ["tool_set"] };
    case "back_storage":
      return { resourceFamilies: ["preserved_food", "fresh_food"], objectFamilies: ["storage_furniture"] };
    case "parts_storage":
      return { resourceFamilies: ["mechanical_parts_i", "sheet_metal"], objectFamilies: ["tool_set"] };
    case "bathroom":
      return { resourceFamilies: ["water"], objectFamilies: ["personal_liquid_container"] };
    default:
      return { resourceFamilies: [], objectFamilies: [] };
  }
}

/**
 * Valores por defecto de S7 para mobiliario sin comportamiento profundo
 * propio (mesa, sofá, mostrador...): siguen existiendo como `Furniture`
 * genérica compatible con la ficha contextual de §24 aunque no tengan
 * familia CAT-005 concreta ni perfiles de transformación.
 */
function makeFurniture(base: { id: string; roomId: string; kind: string; condition: number; functionalState: Furniture["functionalState"] }): Furniture {
  const familyVariant = FAMILY_FURNITURE_BY_KIND[base.kind];
  const entry = familyVariant ? catalogEntry(familyVariant) : null;
  return {
    ...base,
    family: entry?.family ?? null,
    variant: entry?.variant ?? "",
    weightKg: entry?.defaultWeightKg ?? 40,
    bulk: entry?.defaultBulk ?? "bulky",
    quality: 0.5,
    capacityUnits: null,
    containerId: null,
    movedToLocation: null,
    handlingTags: entry ? [...entry.defaultHandlingTags] : [],
    functions: entry ? [...entry.defaultFunctions] : [],
    inactiveFunctionReasons: {},
    repairProfileId: null,
    disassemblyProfileId: null,
    provenance: "generated",
    knownEvidenceIds: [],
  };
}

/** Objeto completo generado a partir de su entrada de catálogo (S7): peso, bulto, volumen, etiquetas, portabilidad, funciones y perfiles vienen del catálogo versionado, no de cifras sueltas. */
export function makeWorldObject(base: {
  id: string;
  variant: string;
  location: WorldObject["location"];
  condition: number;
  quality: number;
  functionalState: WorldObject["functionalState"];
  provenance?: string;
}): WorldObject {
  const entry = catalogEntry(base.variant);
  return {
    id: base.id,
    family: entry.family,
    variant: entry.variant,
    location: base.location,
    ownerOrReservedByJobId: null,
    weightKg: entry.defaultWeightKg,
    bulk: entry.defaultBulk,
    condition: base.condition,
    quality: base.quality,
    functionalState: base.functionalState,
    handlingTags: [...entry.defaultHandlingTags],
    volumeLiters: entry.defaultVolumeLiters,
    capacityUnits: entry.defaultCapacityUnits,
    containerId: null,
    functions: [...entry.defaultFunctions],
    inactiveFunctionReasons: {},
    portability: entry.portability,
    minOperators: entry.minOperators,
    repairProfileId: entry.repairProfileId,
    disassemblyProfileId: entry.disassemblyProfileId,
    provenance: base.provenance ?? "generated",
    missingParts: [],
    knownEvidenceIds: [],
    installedAt: null,
  };
}

/**
 * Lote generado. El alimento fresco (S7 §6.6) nace ya deteriorándose desde
 * el inicio del Día 1 (`decayStartedAtSimSeconds = 0`) con su condición
 * generada como punto de partida: seis semanas tras el colapso, parte ya
 * se habrá perdido al llegar (SCN-003 §3.1), sin ninguna tirada extra.
 */
export function makeResourceLot(base: {
  id: string;
  family: ResourceLot["family"];
  quantity: number;
  unit: ResourceLot["unit"];
  location: ResourceLot["location"];
  condition: number;
  provenance?: string;
}): ResourceLot {
  const perishable = base.family === "fresh_food";
  return {
    id: base.id,
    family: base.family,
    quantity: base.quantity,
    unit: base.unit,
    location: base.location,
    condition: base.condition,
    reservedByJobId: null,
    qualityKnown: true,
    quality: 1,
    provenance: base.provenance ?? "generated",
    decayStartedAtSimSeconds: perishable ? 0 : null,
    conditionAtDecayStart: perishable ? base.condition : null,
  };
}

function rectangleFromFootprint(footprint: readonly WorldPoint[]): { center: WorldPoint; width: number; depth: number; facingRadians: number } {
  const a = footprint[0]!;
  const b = footprint[1]!;
  const c = footprint[2]!;
  const width = distance(a, b);
  const depth = distance(b, c);
  const facingRadians = Math.atan2(b.y - a.y, b.x - a.x);
  return { center: centroidOf(footprint), width, depth, facingRadians };
}

function toWorld(local: WorldPoint, center: WorldPoint, facingRadians: number): WorldPoint {
  const cos = Math.cos(facingRadians);
  const sin = Math.sin(facingRadians);
  return { x: center.x + local.x * cos - local.y * sin, y: center.y + local.x * sin + local.y * cos };
}

export function generateBuildingContents(
  prng: PrngStream,
  ids: IdAllocator,
  places: readonly Place[],
  buildings: readonly Building[],
  collapsedPlaceIds: ReadonlySet<string>,
): BuildingContentResult {
  const floors: Floor[] = [];
  const rooms: Room[] = [];
  const openings: Opening[] = [];
  const installedClosures: InstalledClosure[] = [];
  const anchors: Anchor[] = [];
  const furniture: Furniture[] = [];
  const containers: Container[] = [];
  const worldObjects: WorldObject[] = [];
  const resourceLots: ResourceLot[] = [];
  const occupantProfiles: OccupantProfile[] = [];
  const businessProfiles: BusinessProfile[] = [];
  const placeHistories: PlaceHistory[] = [];
  const lootPressureZones: LootPressureZone[] = [];
  const entryRoomIdsByBuildingId = new Map<string, string[]>();

  const buildingsByPlaceId = new Map(buildings.map((b) => [b.placeId, b]));

  for (const place of places) {
    if (place.profileId !== "RES-10" && place.profileId !== "RES-17" && place.profileId !== "COM-02" && place.profileId !== "TAL-01") continue;
    const building = buildingsByPlaceId.get(place.id);
    if (!building) continue;

    // Historia y presión de saqueo se generan para toda instancia con programa, colapsada o no (§9).
    const historyCount = prng.nextInt(1, 2);
    const historyKinds = prng.shuffle(HISTORY_KIND_POOL).slice(0, historyCount);
    if (collapsedPlaceIds.has(place.id)) historyKinds.push("collapse");
    placeHistories.push({ id: ids.next("history"), placeId: place.id, historyKinds });
    lootPressureZones.push({ id: ids.next("loot-zone"), placeId: place.id, band: prng.pick(LOOT_BAND_POOL) });

    if (place.profileId === "RES-10" || place.profileId === "RES-17") {
      occupantProfiles.push({
        id: ids.next("occupant"),
        placeId: place.id,
        economicStratum: prng.pick(ECONOMIC_STRATA),
        priorProfessionKeys: [prng.pick(PROFESSION_KEYS)],
        hobbyKeys: [prng.pick(HOBBY_KEYS)],
      });
    } else {
      businessProfiles.push({
        id: ids.next("business"),
        placeId: place.id,
        businessKindKey: prng.pick(BUSINESS_KIND_BY_PROFILE[place.profileId]),
        economicStratum: prng.pick(ECONOMIC_STRATA),
      });
    }

    if (!building.interiorGenerated || collapsedPlaceIds.has(place.id)) continue;

    const program = BUILDING_PROGRAMS_BY_PROFILE.get(place.profileId);
    if (!program) continue;

    const roomInstances: RoomProgramRole[] = [];
    for (const entry of program.rooms) {
      if (!entry.repeatable) {
        roomInstances.push(entry.role);
        continue;
      }
      const extra = entry.role === "bedroom" ? prng.nextInt(Math.max(0, program.minBedroomsOrEquivalent - 1), program.minBedroomsOrEquivalent) : prng.nextInt(1, 2);
      for (let i = 0; i <= extra; i++) roomInstances.push(entry.role);
    }

    const { center, width, depth, facingRadians } = rectangleFromFootprint(building.footprint);
    const columns = roomInstances.length >= 4 ? 2 : 1;
    const rows = Math.ceil(roomInstances.length / columns);
    const cellWidth = width / columns;
    const cellDepth = depth / rows;

    const floorId = ids.next("floor");
    floors.push({ id: floorId, buildingId: building.id, level: 0, active: true });

    const roomIdByIndex: string[] = [];
    const exteriorFrontRoomIndex = 0; // primera estancia del programa: siempre la de acceso principal (§8.2).
    for (let i = 0; i < roomInstances.length; i++) {
      const col = i % columns;
      const row = Math.floor(i / columns);
      const localCenter: WorldPoint = {
        x: -width / 2 + cellWidth * (col + 0.5),
        y: -depth / 2 + cellDepth * (row + 0.5),
      };
      const halfW = cellWidth / 2 - 0.15;
      const halfD = cellDepth / 2 - 0.15;
      const localCorners: WorldPoint[] = [
        { x: localCenter.x - halfW, y: localCenter.y - halfD },
        { x: localCenter.x + halfW, y: localCenter.y - halfD },
        { x: localCenter.x + halfW, y: localCenter.y + halfD },
        { x: localCenter.x - halfW, y: localCenter.y + halfD },
      ];
      const polygon = localCorners.map((p) => toWorld(p, center, facingRadians));
      const roomId = ids.next("room");
      roomIdByIndex.push(roomId);
      rooms.push({ id: roomId, floorId, polygon, programRoleKey: roomInstances[i]! });

      for (const labelKey of FURNITURE_BY_ROLE[roomInstances[i]!] ?? []) {
        const furnitureId = ids.next("furniture");
        const condition = 0.3 + prng.nextFloat() * 0.6;
        const functionalState = prng.nextBool(0.7) ? "functional" : "degraded";

        if (labelKey === "furniture.wardrobe" || labelKey === "furniture.storage_shelf") {
          // Demostrador profundo armario/estantería (§15.6 del prompt S7-S9): jerarquía
          // real `Furniture → Container → Content`, no un contenedor huérfano en la sala.
          const containerId = ids.next("container");
          const contentIds: string[] = [];
          const family: ResourceLot["family"] = "wood_and_planks";
          if (prng.nextBool(0.7)) {
            const lotId = ids.next("resource-lot");
            resourceLots.push(makeResourceLot({ id: lotId, family, quantity: 1 + prng.nextInt(0, 4), unit: "kilogram", location: { kind: "container", containerId }, condition: 0.4 + prng.nextFloat() * 0.5 }));
            contentIds.push(lotId);
          }
          const objectFamily: WorldObject["family"] = "personal_liquid_container";
          if (prng.nextBool(0.5)) {
            const objectId = ids.next("object");
            worldObjects.push(
              makeWorldObject({
                id: objectId,
                variant: `${objectFamily}.bottle`,
                location: { kind: "container", containerId },
                condition: 0.3 + prng.nextFloat() * 0.6,
                quality: 0.2 + prng.nextFloat() * 0.6,
                functionalState: prng.nextBool(0.75) ? "functional" : "degraded",
              }),
            );
            contentIds.push(objectId);
          }
          containers.push({
            id: containerId,
            location: { kind: "room", roomId },
            capacityUnits: 20,
            contentIds,
            hostFurnitureId: furnitureId,
            hostWorldObjectId: null,
            acceptedHandlingTags: null,
          });
          furniture.push({
            id: furnitureId,
            roomId,
            kind: labelKey,
            condition,
            functionalState,
            family: "storage_furniture",
            variant: labelKey === "furniture.wardrobe" ? "storage_furniture.wardrobe" : "storage_furniture.shelf",
            weightKg: catalogEntry(labelKey === "furniture.wardrobe" ? "storage_furniture.wardrobe" : "storage_furniture.shelf").defaultWeightKg,
            bulk: "bulky",
            quality: 0.3 + prng.nextFloat() * 0.5,
            capacityUnits: 20,
            containerId,
            movedToLocation: null,
            handlingTags: [...catalogEntry(labelKey === "furniture.wardrobe" ? "storage_furniture.wardrobe" : "storage_furniture.shelf").defaultHandlingTags],
            functions: ["storage"],
            inactiveFunctionReasons: {},
            repairProfileId: WARDROBE_REPAIR_PROFILE_ID,
            disassemblyProfileId: WARDROBE_DISASSEMBLY_PROFILE_ID,
            provenance: "generated",
            knownEvidenceIds: [],
          });
          continue;
        }

        if (labelKey === "furniture.fridge") {
          // Demostrador profundo frigorífico (§15.6): nunca refrigera sin
          // electricidad (fuera de alcance en S7-S9), reparable con causa
          // reconocida, desmontable en chapa/cableado/componentes/motor.
          const containerId = ids.next("container");
          const contentIds: string[] = [];
          if (prng.nextBool(0.6)) {
            const lotId = ids.next("resource-lot");
            resourceLots.push(
              makeResourceLot({ id: lotId, family: "preserved_food", quantity: 1 + prng.nextInt(0, 3), unit: "unit", location: { kind: "container", containerId }, condition: 0.3 + prng.nextFloat() * 0.5 }),
            );
            contentIds.push(lotId);
          }
          containers.push({
            id: containerId,
            location: { kind: "room", roomId },
            capacityUnits: 15,
            contentIds,
            hostFurnitureId: furnitureId,
            hostWorldObjectId: null,
            acceptedHandlingTags: null,
          });
          furniture.push({
            id: furnitureId,
            roomId,
            kind: labelKey,
            condition,
            functionalState,
            family: "technical_appliance",
            variant: "technical_appliance.fridge",
            weightKg: 65,
            bulk: "bulky",
            quality: 0.3 + prng.nextFloat() * 0.5,
            capacityUnits: 15,
            containerId,
            movedToLocation: null,
            handlingTags: ["bulky", "keep_upright"],
            functions: ["storage"],
            inactiveFunctionReasons: { refrigeration: "no_electricity" },
            repairProfileId: FRIDGE_REPAIR_PROFILE_ID,
            disassemblyProfileId: FRIDGE_DISASSEMBLY_PROFILE_ID,
            provenance: "generated",
            knownEvidenceIds: [],
          });
          continue;
        }

        furniture.push(makeFurniture({ id: furnitureId, roomId, kind: labelKey, condition, functionalState }));

        if (CONTAINER_ROLES.has(roomInstances[i]!)) {
          const content = contentFor(roomInstances[i]!);
          const containerId = ids.next("container");
          const contentIds: string[] = [];
          for (const resFamily of content.resourceFamilies) {
            const lotId = ids.next("resource-lot");
            resourceLots.push(
              makeResourceLot({
                id: lotId,
                family: resFamily,
                quantity: resFamily === "water" ? 5 + prng.nextInt(0, 10) : 1 + prng.nextInt(0, 4),
                unit: resFamily === "water" ? "liter" : resFamily === "wood_and_planks" || resFamily === "mechanical_parts_i" || resFamily === "sheet_metal" ? "kilogram" : "unit",
                location: { kind: "container", containerId },
                condition: 0.4 + prng.nextFloat() * 0.5,
              }),
            );
            contentIds.push(lotId);
          }
          for (const objFamily of content.objectFamilies) {
            const objectId = ids.next("object");
            // v1 consumía aquí una tirada de peso (`1 + nextFloat() * 3`) para
            // una variante `.generic`; v2 toma el peso del catálogo, pero la
            // tirada se conserva para no desplazar el stream `world`.
            prng.nextFloat();
            const variants = roomInstances[i] === "parts_storage" && objFamily === "tool_set" ? ["tool_set.mechanics"] : (OBJECT_VARIANTS_BY_ROLE_FAMILY[objFamily] ?? []);
            worldObjects.push(
              makeWorldObject({
                id: objectId,
                variant: pickByKey(objectId, variants),
                location: { kind: "container", containerId },
                condition: 0.3 + prng.nextFloat() * 0.6,
                quality: 0.2 + prng.nextFloat() * 0.6,
                functionalState: prng.nextBool(0.75) ? "functional" : "degraded",
              }),
            );
            contentIds.push(objectId);
          }
          containers.push({
            id: containerId,
            location: { kind: "room", roomId },
            capacityUnits: 20,
            contentIds,
            hostFurnitureId: null,
            hostWorldObjectId: null,
            acceptedHandlingTags: null,
          });
          break; // un contenedor representativo por estancia (jerarquía §8.3, sin inflar de más).
        }
      }
    }

    // Conectividad interior: cadena de estancias consecutivas (garantiza que todas son alcanzables desde la entrada, §8.2/§8.6).
    const entryRoomIds: string[] = [];
    for (let i = 0; i < roomIdByIndex.length - 1; i++) {
      const openingId = ids.next("opening");
      const closureId = ids.next("closure");
      const a = rooms.find((r) => r.id === roomIdByIndex[i])!;
      const b = rooms.find((r) => r.id === roomIdByIndex[i + 1])!;
      const midpoint = { x: (centroidOf(a.polygon).x + centroidOf(b.polygon).x) / 2, y: (centroidOf(a.polygon).y + centroidOf(b.polygon).y) / 2 };
      openings.push({
        id: openingId,
        position: midpoint,
        connectsRoomId: roomIdByIndex[i]!,
        connectsOtherRoomId: roomIdByIndex[i + 1]!,
        connectsToExterior: false,
        widthClass: "normal",
        installedClosureId: closureId,
      });
      installedClosures.push({ id: closureId, openingId, kind: "door", state: prng.pick(["open", "closed", "closed"] as const), condition: 0.4 + prng.nextFloat() * 0.5 });
    }

    for (let i = 0; i < roomInstances.length; i++) {
      const entry = program.rooms.find((r) => r.role === roomInstances[i]);
      if (!entry?.exteriorAccess) continue;
      const room = rooms.find((r) => r.id === roomIdByIndex[i])!;
      const roomCentroid = centroidOf(room.polygon);
      const boundaryPoint = nearestBuildingBoundaryPoint(roomCentroid, building.footprint);
      const openingId = ids.next("opening");
      const closureId = ids.next("closure");
      const widthClass = roomInstances[i] === "wide_gate" ? "gate" : roomInstances[i] === "service_or_loading_access" ? "wide" : "normal";
      openings.push({
        id: openingId,
        position: boundaryPoint,
        connectsRoomId: roomIdByIndex[i]!,
        connectsOtherRoomId: null,
        connectsToExterior: true,
        widthClass,
        installedClosureId: closureId,
      });
      installedClosures.push({
        id: closureId,
        openingId,
        kind: roomInstances[i] === "wide_gate" ? "gate" : "door",
        state: i === exteriorFrontRoomIndex ? "closed" : prng.pick(["open", "closed", "locked"] as const),
        condition: 0.4 + prng.nextFloat() * 0.5,
      });
      entryRoomIds.push(roomIdByIndex[i]!);
    }
    entryRoomIdsByBuildingId.set(building.id, entryRoomIds);

    for (const corner of building.footprint) {
      anchors.push({ id: ids.next("anchor"), position: corner, kind: "building_corner" });
    }
  }

  return {
    floors,
    rooms,
    openings,
    installedClosures,
    anchors,
    furniture,
    containers,
    worldObjects,
    resourceLots,
    occupantProfiles,
    businessProfiles,
    placeHistories,
    lootPressureZones,
    entryRoomIdsByBuildingId,
  };
}

function nearestBuildingBoundaryPoint(from: WorldPoint, footprint: readonly WorldPoint[]): WorldPoint {
  let closest = footprint[0]!;
  let closestDistance = Infinity;
  for (let i = 0; i < footprint.length; i++) {
    const a = footprint[i]!;
    const b = footprint[(i + 1) % footprint.length]!;
    const midpoint = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    const d = distance(from, midpoint);
    if (d < closestDistance) {
      closestDistance = d;
      closest = midpoint;
    }
  }
  return closest;
}

export type { SettlementPlacement };
