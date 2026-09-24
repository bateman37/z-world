import type { Building, Floor, Opening, Place, Room, SemanticWorldV2, SimulationStateV2, TerrainArea } from "@z-world/contracts";
import { createInitialFogGrid, revealAroundObservers } from "../fog.js";
import { createInitialStateV2 } from "./create-initial-state-v2.js";

/**
 * Ayudante de pruebas (no exportado por `index.ts`): construye un
 * `SimulationStateV2` con un mundo pequeño y totalmente controlado (una
 * vivienda de dos estancias con una puerta exterior y una interior, sobre
 * terreno abierto) en vez de depender del layout emergente del generador
 * real de S2 para probar navegación/movimiento/descubrimiento de forma
 * determinista y legible. Las personas, el reloj, el PRNG y las secuencias
 * se toman del estado real generado por `createInitialStateV2`, así que
 * siguen siendo objetos válidos completos — solo el mundo espacial y la
 * niebla se sustituyen.
 */
export function makeSyntheticBuildingState(seed: string): SimulationStateV2 {
  const base = createInitialStateV2(seed);

  const bounds = { minX: -60, minY: -60, maxX: 60, maxY: 60 };
  const groundArea: TerrainArea = {
    id: "area-ground",
    kind: "open_ground",
    polygon: [
      { x: -60, y: -60 },
      { x: 60, y: -60 },
      { x: 60, y: 60 },
      { x: -60, y: 60 },
    ],
    transitable: true,
    traversalCostMultiplier: 1,
    placeId: null,
    coverage: "none",
  };

  const footprint = [
    { x: 10, y: -5 },
    { x: 20, y: -5 },
    { x: 20, y: 5 },
    { x: 10, y: 5 },
  ];
  const hallwayPolygon = [
    { x: 10, y: -5 },
    { x: 15, y: -5 },
    { x: 15, y: 5 },
    { x: 10, y: 5 },
  ];
  const bedroomPolygon = [
    { x: 15, y: -5 },
    { x: 20, y: -5 },
    { x: 20, y: 5 },
    { x: 15, y: 5 },
  ];

  const place: Place = { id: "place-test-house", profileId: "RES-10", position: { x: 15, y: 0 }, buildingId: "building-test-house" };
  const building: Building = {
    id: "building-test-house",
    placeId: place.id,
    footprint,
    labelKey: "test.house",
    interiorGenerated: true,
    activeFloorId: "floor-test-house-0",
  };
  const floor: Floor = { id: "floor-test-house-0", buildingId: building.id, level: 0, active: true };
  const hallway: Room = { id: "room-hallway", floorId: floor.id, polygon: hallwayPolygon, programRoleKey: null };
  const bedroom: Room = { id: "room-bedroom", floorId: floor.id, polygon: bedroomPolygon, programRoleKey: null };
  const exteriorDoor: Opening = {
    id: "opening-exterior",
    position: { x: 10, y: 0 },
    connectsRoomId: hallway.id,
    connectsOtherRoomId: null,
    connectsToExterior: true,
    widthClass: "normal",
    installedClosureId: null,
  };
  const interiorDoor: Opening = {
    id: "opening-interior",
    position: { x: 15, y: 0 },
    connectsRoomId: hallway.id,
    connectsOtherRoomId: bedroom.id,
    connectsToExterior: false,
    widthClass: "normal",
    installedClosureId: null,
  };

  const world: SemanticWorldV2 = {
    generatorVersion: "test-fixture",
    seed,
    bounds,
    arrivalPoint: { x: 0, y: 0 },
    terrainAreas: { [groundArea.id]: groundArea },
    linearFeatures: {},
    nodes: {},
    parcels: {},
    places: { [place.id]: place },
    buildings: { [building.id]: building },
    floors: { [floor.id]: floor },
    rooms: { [hallway.id]: hallway, [bedroom.id]: bedroom },
    openings: { [exteriorDoor.id]: exteriorDoor, [interiorDoor.id]: interiorDoor },
    installedClosures: {},
    obstructions: {},
    anchors: {},
    barrierSegments: {},
    perimeterNetworks: {},
    occupantProfiles: {},
    businessProfiles: {},
    placeHistories: {},
    lootPressureZones: {},
    lootingRoutes: {},
    // S9: sin tejido de edificio (mundo sintético/migrado): capas 3-5 no disponibles, accesos sí.
    buildingFabrics: {},
    buildingInstallations: {},
    buildingFinishes: {},
    navigationRevision: { global: 0, byBuilding: {} },
  };

  let fog = createInitialFogGrid({ bounds }, 5);
  fog = revealAroundObservers(fog, [{ x: 0, y: 0 }], 200);

  const firstPersonId = base.peopleOrder[0]!;
  const firstPerson = base.people[firstPersonId]!;
  const people = {
    ...base.people,
    [firstPersonId]: {
      ...firstPerson,
      public: { ...firstPerson.public, position: { x: 0, y: 0 }, activeMovementOrder: null, operationalState: "awaiting_orders" as const },
      location: { kind: "world_point" as const, point: { x: 0, y: 0 } },
    },
  };

  return { ...base, world, fog, discoveries: [], people };
}

export const TEST_HOUSE_IDS = {
  placeId: "place-test-house",
  buildingId: "building-test-house",
  hallwayRoomId: "room-hallway",
  bedroomRoomId: "room-bedroom",
  exteriorOpeningId: "opening-exterior",
  interiorOpeningId: "opening-interior",
} as const;
