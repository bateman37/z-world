import type { LinearFeature, NaturalOrTechnicalNode, TerrainArea, WorldPoint } from "@z-world/contracts";
import type { PrngStream } from "../../prng.js";
import { TERRAIN_COVERAGE_RATIO, VILLAGE_BUDGET } from "@z-world/catalogs";
import type { VillageGeneratorConfig } from "./config.js";
import { IdAllocator } from "./id-allocator.js";
import { blobPolygon, polygonArea, scalePolygonToArea } from "./geometry-helpers.js";

/**
 * Capa 1-5 de generación de WLD-008 (§7.1 de WEB-002): relieve/terreno
 * difícil, hidrología, vegetación/usos de suelo, y la red de carretera,
 * calles, caminos y senderos. La semántica precede a la geometría visual:
 * este módulo produce únicamente terreno y vías; el asentamiento
 * (parcelas, lugares, edificios) es responsabilidad de `settlement.ts`.
 */
export interface TerrainResult {
  readonly bounds: { readonly minX: number; readonly minY: number; readonly maxX: number; readonly maxY: number };
  readonly arrivalPoint: WorldPoint;
  readonly terrainAreas: TerrainArea[];
  readonly linearFeatures: LinearFeature[];
  readonly nodes: NaturalOrTechnicalNode[];
  readonly mainRoad: LinearFeature;
  readonly secondaryStreets: LinearFeature[];
  readonly ruralTracks: LinearFeature[];
  readonly mainWaterNode: NaturalOrTechnicalNode;
  readonly secondaryWaterNodes: NaturalOrTechnicalNode[];
  /** Franja alrededor de la vía principal donde se apoya el asentamiento (§7.3: la vía y el asentamiento respetan el valle). */
  readonly settlementCorridor: { readonly minX: number; readonly maxX: number; readonly minY: number; readonly maxY: number };
  readonly forestAreaIds: readonly string[];
  readonly fieldAreaIds: readonly string[];
}

export function generateTerrain(prng: PrngStream, config: VillageGeneratorConfig, ids: IdAllocator): TerrainResult {
  const half = config.halfExtentMeters;
  const bounds = { minX: -half, minY: -half, maxX: half, maxY: half };
  const totalArea = (bounds.maxX - bounds.minX) * (bounds.maxY - bounds.minY);

  // Vía principal: cruza todo el sector siguiendo un valle jitterado (nunca una línea recta perfecta).
  const roadWaypointCount = 6;
  const mainRoadPolyline: WorldPoint[] = [];
  let previousY = prng.nextInt(-60, 60);
  for (let i = 0; i < roadWaypointCount; i++) {
    const x = bounds.minX + (i / (roadWaypointCount - 1)) * (bounds.maxX - bounds.minX);
    const y = i === 0 || i === roadWaypointCount - 1 ? previousY : previousY + prng.nextInt(-120, 120);
    previousY = y;
    mainRoadPolyline.push({ x, y });
  }
  const mainRoad: LinearFeature = {
    id: ids.next("way"),
    kind: "road",
    polyline: mainRoadPolyline,
    widthMeters: 6,
    wayState: "transitable",
    placeId: null,
  };

  const villageCenterX = prng.nextInt(-150, 150);
  const villageCenterIndex = Math.round(((villageCenterX - bounds.minX) / (bounds.maxX - bounds.minX)) * (roadWaypointCount - 1));
  const villageCenterY = mainRoadPolyline[Math.max(0, Math.min(roadWaypointCount - 1, villageCenterIndex))]!.y;

  const settlementCorridor = {
    minX: villageCenterX - 420,
    maxX: villageCenterX + 420,
    minY: villageCenterY - 120,
    maxY: villageCenterY + 320,
  };

  const secondaryStreetCount = prng.nextInt(VILLAGE_BUDGET.secondaryStreets.min, VILLAGE_BUDGET.secondaryStreets.max);
  const secondaryStreets: LinearFeature[] = [];
  for (let i = 0; i < secondaryStreetCount; i++) {
    const branchX = villageCenterX + prng.nextInt(-350, 350);
    const branchPoint = { x: branchX, y: villageCenterY };
    const length = prng.nextInt(120, 260);
    const angle = prng.nextFloat() * Math.PI - Math.PI / 2; // hacia el lado "cuesta arriba" del valle
    const end = { x: branchPoint.x + Math.cos(angle) * length, y: branchPoint.y + Math.abs(Math.sin(angle)) * length };
    secondaryStreets.push({
      id: ids.next("way"),
      kind: "road",
      polyline: [branchPoint, { x: (branchPoint.x + end.x) / 2 + prng.nextInt(-15, 15), y: (branchPoint.y + end.y) / 2 }, end],
      widthMeters: 4,
      wayState: "transitable",
      placeId: null,
    });
  }

  const ruralTrackCount = prng.nextInt(VILLAGE_BUDGET.ruralTracks.min, VILLAGE_BUDGET.ruralTracks.max);
  const ruralTracks: LinearFeature[] = [];
  for (let i = 0; i < ruralTrackCount; i++) {
    const source = prng.nextBool() && secondaryStreets.length > 0 ? prng.pick(secondaryStreets).polyline.at(-1)! : mainRoadPolyline[prng.nextInt(0, roadWaypointCount - 1)]!;
    const length = prng.nextInt(150, 420);
    const angle = prng.nextFloat() * Math.PI * 2;
    const end = { x: source.x + Math.cos(angle) * length, y: source.y + Math.sin(angle) * length };
    ruralTracks.push({
      id: ids.next("way"),
      kind: "road",
      polyline: [source, end],
      widthMeters: 2.5,
      wayState: "transitable",
      placeId: null,
    });
  }

  const blockedAccessCount = prng.nextInt(VILLAGE_BUDGET.blockedRegionalAccesses.min, VILLAGE_BUDGET.blockedRegionalAccesses.max);
  const blockedAccesses: LinearFeature[] = [];
  for (let i = 0; i < blockedAccessCount; i++) {
    const fromEnd = prng.nextBool() ? mainRoadPolyline[0]! : mainRoadPolyline[mainRoadPolyline.length - 1]!;
    const inward = prng.nextInt(60, 140);
    const stub: WorldPoint = { x: fromEnd.x + (fromEnd.x < 0 ? inward : -inward), y: fromEnd.y + prng.nextInt(-40, 40) };
    blockedAccesses.push({
      id: ids.next("way"),
      kind: "road",
      polyline: [fromEnd, stub],
      widthMeters: 5,
      wayState: "obstructed",
      placeId: null,
    });
  }

  // Hidrología: el cauce sigue una pendiente plausible cruzando el sector; la fuente principal nace en su cabecera.
  const riverY = villageCenterY - prng.nextInt(200, 400);
  const river: LinearFeature = {
    id: ids.next("way"),
    kind: "watercourse",
    polyline: [
      { x: bounds.minX, y: riverY - prng.nextInt(-40, 40) },
      { x: villageCenterX - prng.nextInt(50, 150), y: riverY },
      { x: bounds.maxX, y: riverY + prng.nextInt(-40, 40) },
    ],
    widthMeters: prng.nextInt(3, 7),
    wayState: null,
    placeId: null,
  };
  const mainWaterNode: NaturalOrTechnicalNode = {
    id: ids.next("node"),
    kind: "water_source",
    position: { x: bounds.minX + prng.nextInt(40, 120), y: riverY + prng.nextInt(-20, 20) },
    placeId: null,
    labelKey: "water_source.mountain_spring",
  };
  const secondaryWaterCount = prng.nextInt(VILLAGE_BUDGET.secondaryWaterSources.min, VILLAGE_BUDGET.secondaryWaterSources.max);
  const secondaryWaterNodes: NaturalOrTechnicalNode[] = [];
  for (let i = 0; i < secondaryWaterCount; i++) {
    secondaryWaterNodes.push({
      id: ids.next("node"),
      kind: "water_source",
      position: { x: villageCenterX + prng.nextInt(-300, 300), y: villageCenterY + prng.nextInt(-150, 350) },
      placeId: null,
      labelKey: i === 0 ? "water_source.communal_well" : "water_source.small_pond",
    });
  }

  // Fondo transitable de todo el sector (§7.2: "resto coherente"), sobre el que se recortan semánticamente bosque/campo/roca.
  const backgroundOpenGround: TerrainArea = {
    id: ids.next("area"),
    kind: "open_ground",
    polygon: [
      { x: bounds.minX, y: bounds.minY },
      { x: bounds.maxX, y: bounds.minY },
      { x: bounds.maxX, y: bounds.maxY },
      { x: bounds.minX, y: bounds.maxY },
    ],
    transitable: true,
    traversalCostMultiplier: 1,
    placeId: null,
  };

  const forestFraction = TERRAIN_COVERAGE_RATIO.forestOrScrub.min + prng.nextFloat() * (TERRAIN_COVERAGE_RATIO.forestOrScrub.max - TERRAIN_COVERAGE_RATIO.forestOrScrub.min);
  const forestBlobCount = prng.nextInt(3, 6);
  const forestBlobsRaw: WorldPoint[][] = [];
  for (let i = 0; i < forestBlobCount; i++) {
    let center: WorldPoint;
    do {
      center = { x: prng.nextInt(bounds.minX + 80, bounds.maxX - 80), y: prng.nextInt(bounds.minY + 80, bounds.maxY - 80) };
    } while (Math.abs(center.x - villageCenterX) < 260 && Math.abs(center.y - villageCenterY) < 220);
    const baseRadius = prng.nextInt(120, 260);
    forestBlobsRaw.push(blobPolygon(prng, center, baseRadius, 10, 0.4));
  }
  const forestBlobs = rescaleGroupToTargetArea(forestBlobsRaw, forestFraction * totalArea);

  const fieldFraction = TERRAIN_COVERAGE_RATIO.fieldsOrOpen.min + prng.nextFloat() * (TERRAIN_COVERAGE_RATIO.fieldsOrOpen.max - TERRAIN_COVERAGE_RATIO.fieldsOrOpen.min);
  const fieldBlobCount = prng.nextInt(3, 6);
  const fieldBlobsRaw: WorldPoint[][] = [];
  for (let i = 0; i < fieldBlobCount; i++) {
    const angle = prng.nextFloat() * Math.PI * 2;
    const radiusFromCenter = prng.nextInt(280, 620);
    const center: WorldPoint = { x: villageCenterX + Math.cos(angle) * radiusFromCenter, y: villageCenterY + Math.sin(angle) * radiusFromCenter };
    const baseRadius = prng.nextInt(70, 150);
    fieldBlobsRaw.push(blobPolygon(prng, center, baseRadius, 8, 0.3));
  }
  const fieldBlobs = rescaleGroupToTargetArea(fieldBlobsRaw, fieldFraction * totalArea);

  const rockyAreaCount = prng.nextInt(1, 2);
  const rockyAreas: TerrainArea[] = [];
  for (let i = 0; i < rockyAreaCount; i++) {
    const center: WorldPoint = { x: prng.nextInt(bounds.minX + 100, bounds.maxX - 100), y: prng.nextInt(bounds.minY + 100, bounds.maxY - 100) };
    rockyAreas.push({
      id: ids.next("area"),
      kind: "obstacle",
      polygon: blobPolygon(prng, center, prng.nextInt(40, 90), 9, 0.25),
      transitable: false,
      traversalCostMultiplier: 1,
      placeId: null,
    });
  }

  const forestAreas: TerrainArea[] = forestBlobs.map((polygon) => ({
    id: ids.next("area"),
    kind: "dense_vegetation",
    polygon,
    transitable: true,
    traversalCostMultiplier: 1.8,
    placeId: null,
  }));
  const fieldAreas: TerrainArea[] = fieldBlobs.map((polygon) => ({
    id: ids.next("area"),
    kind: "open_ground",
    polygon,
    transitable: true,
    traversalCostMultiplier: 1,
    placeId: null,
  }));

  const arrivalPoint: WorldPoint = {
    x: villageCenterX + prng.nextInt(-40, 40),
    y: villageCenterY + prng.nextInt(60, 140),
  };

  return {
    bounds,
    arrivalPoint,
    terrainAreas: [backgroundOpenGround, ...forestAreas, ...fieldAreas, ...rockyAreas],
    linearFeatures: [mainRoad, ...secondaryStreets, ...ruralTracks, ...blockedAccesses, river],
    nodes: [mainWaterNode, ...secondaryWaterNodes],
    mainRoad,
    secondaryStreets,
    ruralTracks,
    mainWaterNode,
    secondaryWaterNodes,
    settlementCorridor,
    forestAreaIds: forestAreas.map((a) => a.id),
    fieldAreaIds: fieldAreas.map((a) => a.id),
  };
}

/** Reescala un grupo de polígonos generados en conjunto para que su área total cumpla exactamente la cobertura exigida (§7.2), conservando la forma orgánica relativa de cada uno. */
function rescaleGroupToTargetArea(polygons: readonly WorldPoint[][], targetTotalArea: number): WorldPoint[][] {
  const currentTotal = polygons.reduce((sum, p) => sum + polygonArea(p), 0);
  if (currentTotal <= 0) return polygons.map((p) => [...p]);
  return polygons.map((polygon) => {
    const share = polygonArea(polygon) / currentTotal;
    return scalePolygonToArea(polygon, targetTotalArea * share);
  });
}
