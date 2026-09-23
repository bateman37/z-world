import type {
  Building,
  Place,
  Room,
  SemanticWorldV2,
} from "@z-world/contracts";
import { PrngStream } from "../../prng.js";
import { DEFAULT_VILLAGE_GENERATOR_CONFIG, VILLAGE_GENERATOR_VERSION, type VillageGeneratorConfig } from "./config.js";
import { IdAllocator } from "./id-allocator.js";
import { generateTerrain } from "./terrain.js";
import { generateSettlement } from "./settlement.js";
import { generateBuildingContents } from "./buildings.js";
import { generateEnvironmentPlaces } from "./environment-places.js";
import { materializeScenarioGuarantees } from "./scenario.js";
import { SHELTER_DISTANCE_METERS } from "@z-world/catalogs";

export { VILLAGE_GENERATOR_VERSION, DEFAULT_VILLAGE_GENERATOR_CONFIG, type VillageGeneratorConfig };
export { validateGeneratedVillage } from "./validate-generation.js";
export type { GenerationValidationReport, GenerationViolation } from "./validate-generation.js";

export interface VillageGenerationResult {
  readonly world: SemanticWorldV2;
  readonly furniture: ReturnType<typeof generateBuildingContents>["furniture"];
  readonly containers: ReturnType<typeof generateBuildingContents>["containers"];
  readonly worldObjects: ReturnType<typeof generateBuildingContents>["worldObjects"];
  readonly resourceLots: ReturnType<typeof generateBuildingContents>["resourceLots"];
  readonly transportMeans: ReturnType<typeof materializeScenarioGuarantees>["transportMeans"];
  readonly cultivationPlots: ReturnType<typeof materializeScenarioGuarantees>["cultivationPlots"];
  readonly arrivalPoint: SemanticWorldV2["arrivalPoint"];
  readonly shelterPlaceId: string;
  readonly shelterBuildingId: string;
  readonly shelterDistanceMeters: number;
  readonly shelterWasWithinBudget: boolean;
  readonly nextEntityOrdinal: number;
  readonly degradations: readonly string[];
}

/**
 * Orquestador puro del generador semántico determinista (§7.1 de
 * WEB-002): sigue exactamente el orden lógico de WLD-008 hasta donde este
 * subhito alcanza — terreno → hidrología → vegetación → vías → huella del
 * asentamiento → parcelas → lugares/edificios → historia/deterioro/saqueo
 * → estado actual compatible → (conocimiento inicial y proyección Canvas
 * son responsabilidad de `create-initial-state-v2.ts` y de la aplicación,
 * no de este módulo). No hay generación de amenazas ni ocupación activa
 * (§7.6): eso queda fuera de esta entrega.
 */
export function generateVillage(seed: string, worldStream: PrngStream, config: VillageGeneratorConfig = DEFAULT_VILLAGE_GENERATOR_CONFIG): VillageGenerationResult {
  const ids = new IdAllocator(seed);
  const degradations: string[] = [];

  const terrain = generateTerrain(worldStream, config, ids);
  const settlement = generateSettlement(worldStream, ids, terrain);

  const lootedCandidateIds = [...settlement.housingPlacements, ...settlement.commercialPlacements].map((p) => p.placeId);
  const environment = generateEnvironmentPlaces(worldStream, ids, terrain, lootedCandidateIds.slice(0, Math.max(2, Math.min(6, lootedCandidateIds.length))));

  const allPlaces: Place[] = [...settlement.places, ...environment.places];
  const allBuildings: Building[] = [...settlement.buildings, ...settlement.outbuildings];

  const contents = generateBuildingContents(worldStream, ids, settlement.places, settlement.buildings, settlement.collapsedPlaceIds);

  const roomsByBuildingId = new Map<string, Room[]>();
  for (const room of contents.rooms) {
    const floor = contents.floors.find((f) => f.id === room.floorId);
    if (!floor) continue;
    const list = roomsByBuildingId.get(floor.buildingId) ?? [];
    list.push(room);
    roomsByBuildingId.set(floor.buildingId, list);
  }

  const scenario = materializeScenarioGuarantees(
    worldStream,
    ids,
    terrain.arrivalPoint,
    settlement.housingPlacements,
    settlement.commercialPlacements,
    allPlaces,
    allBuildings,
    environment.parcels,
    roomsByBuildingId,
    settlement.collapsedPlaceIds,
  );
  degradations.push(...scenario.degradations);

  const terrainAreas = Object.fromEntries(environment.updatedAreas.map((a) => [a.id, a]));
  const linearFeatures = Object.fromEntries(environment.updatedLines.map((l) => [l.id, l]));
  const nodes = Object.fromEntries(environment.updatedNodes.map((n) => [n.id, n]));

  const world: SemanticWorldV2 = {
    generatorVersion: VILLAGE_GENERATOR_VERSION,
    seed,
    bounds: terrain.bounds,
    arrivalPoint: terrain.arrivalPoint,
    terrainAreas,
    linearFeatures,
    nodes,
    parcels: Object.fromEntries(environment.parcels.map((p) => [p.id, p])),
    places: Object.fromEntries(allPlaces.map((p) => [p.id, p])),
    buildings: Object.fromEntries(allBuildings.map((b) => [b.id, b])),
    floors: Object.fromEntries(contents.floors.map((f) => [f.id, f])),
    rooms: Object.fromEntries(contents.rooms.map((r) => [r.id, r])),
    openings: Object.fromEntries(contents.openings.map((o) => [o.id, o])),
    installedClosures: Object.fromEntries(contents.installedClosures.map((c) => [c.id, c])),
    obstructions: {},
    anchors: Object.fromEntries(contents.anchors.map((a) => [a.id, a])),
    barrierSegments: {},
    perimeterNetworks: {},
    occupantProfiles: Object.fromEntries(contents.occupantProfiles.map((o) => [o.id, o])),
    businessProfiles: Object.fromEntries(contents.businessProfiles.map((b) => [b.id, b])),
    placeHistories: Object.fromEntries(contents.placeHistories.map((h) => [h.id, h])),
    lootPressureZones: Object.fromEntries(contents.lootPressureZones.map((z) => [z.id, z])),
    lootingRoutes: Object.fromEntries(environment.lootingRoutes.map((r) => [r.id, r])),
  };

  return {
    world,
    furniture: contents.furniture,
    containers: [...contents.containers, ...scenario.extraContainers],
    worldObjects: [...contents.worldObjects, ...scenario.extraWorldObjects],
    resourceLots: [...contents.resourceLots, ...scenario.extraResourceLots],
    transportMeans: scenario.transportMeans,
    cultivationPlots: scenario.cultivationPlots,
    arrivalPoint: terrain.arrivalPoint,
    shelterPlaceId: scenario.shelterPlaceId,
    shelterBuildingId: scenario.shelterBuildingId,
    shelterDistanceMeters: scenario.shelterDistanceMeters,
    shelterWasWithinBudget: scenario.shelterDistanceMeters >= SHELTER_DISTANCE_METERS.min && scenario.shelterDistanceMeters <= SHELTER_DISTANCE_METERS.max,
    nextEntityOrdinal: ids.nextOrdinal,
    degradations,
  };
}
