import type { LocalSectorFixture } from "@z-world/contracts";
import { PrngStream } from "./prng.js";

/**
 * Fixture procedural determinista del sector de llegada (§12 de WEB-001).
 * No es el generador semántico completo de WLD-008/WLD-009: es un sector
 * de detalle acotado (300 × 300 m, valor técnico provisional registrado en
 * DEC-0014) preparado dentro del formato de datos definitivo, para poder
 * ampliarse hacia el presupuesto futuro de ~3 × 3 km sin cambiar contratos.
 */
export const FIXTURE_GENERATOR_VERSION = "web-001-fixture-v1";
const HALF_EXTENT_METERS = 150;

export function generateLocalSectorFixture(seed: string, prng: PrngStream): LocalSectorFixture {
  const bounds = {
    minX: -HALF_EXTENT_METERS,
    minY: -HALF_EXTENT_METERS,
    maxX: HALF_EXTENT_METERS,
    maxY: HALF_EXTENT_METERS,
  };

  const arrivalPoint = { x: prng.nextInt(-20, 20), y: prng.nextInt(60, 90) };

  const roadY = prng.nextInt(50, 70);
  const roadJitter = prng.nextInt(-10, 10);

  const forestMinX = prng.nextInt(-140, -60);
  const forestMinY = prng.nextInt(-40, 10);
  const forestWidth = prng.nextInt(70, 110);
  const forestHeight = prng.nextInt(80, 120);

  const riverStartX = prng.nextInt(-150, -100);
  const riverEndX = prng.nextInt(100, 150);
  const riverMidY = prng.nextInt(-20, 10);

  const obstacleCenterX = prng.nextInt(60, 110);
  const obstacleCenterY = prng.nextInt(-60, -20);
  const obstacleRadius = prng.nextInt(20, 35);

  const shelterOffsetX = prng.nextInt(-25, 25);
  const shelterOffsetY = prng.nextInt(15, 35);
  const shelterX = arrivalPoint.x + shelterOffsetX;
  const shelterY = arrivalPoint.y - shelterOffsetY;
  const shelterHalfWidth = 8;
  const shelterHalfDepth = 6;

  return {
    generatorVersion: FIXTURE_GENERATOR_VERSION,
    seed,
    bounds,
    arrivalPoint,
    areas: [
      {
        id: "area-open-ground",
        kind: "open_ground",
        polygon: [
          { x: bounds.minX, y: bounds.minY },
          { x: bounds.maxX, y: bounds.minY },
          { x: bounds.maxX, y: bounds.maxY },
          { x: bounds.minX, y: bounds.maxY },
        ],
        transitable: true,
        traversalCostMultiplier: 1,
      },
      {
        id: "area-forest",
        kind: "dense_vegetation",
        polygon: [
          { x: forestMinX, y: forestMinY },
          { x: forestMinX + forestWidth, y: forestMinY },
          { x: forestMinX + forestWidth, y: forestMinY + forestHeight },
          { x: forestMinX, y: forestMinY + forestHeight },
        ],
        transitable: true,
        traversalCostMultiplier: 1.8,
      },
      {
        id: "area-rocky-slope",
        kind: "obstacle",
        polygon: circlePolygon(obstacleCenterX, obstacleCenterY, obstacleRadius, 10),
        transitable: false,
        traversalCostMultiplier: 1,
      },
    ],
    lines: [
      {
        id: "line-approach-road",
        kind: "road",
        polyline: [
          { x: bounds.minX, y: roadY - roadJitter },
          { x: 0, y: roadY },
          { x: bounds.maxX, y: roadY + roadJitter },
        ],
        widthMeters: 5,
      },
      {
        id: "line-river",
        kind: "watercourse",
        polyline: [
          { x: riverStartX, y: riverMidY },
          { x: (riverStartX + riverEndX) / 2, y: riverMidY - 15 },
          { x: riverEndX, y: riverMidY + 10 },
        ],
        widthMeters: 6,
      },
    ],
    points: [
      { id: "point-distant-silo", kind: "silhouette", position: { x: bounds.minX + 20, y: bounds.minY + 25 }, labelKey: "landmark.distant_silo" },
      { id: "point-old-signpost", kind: "landmark", position: { x: arrivalPoint.x + 15, y: arrivalPoint.y + 10 }, labelKey: "landmark.old_signpost" },
    ],
    structures: [
      {
        id: "structure-shelter-candidate",
        kind: "shelter_candidate",
        footprint: [
          { x: shelterX - shelterHalfWidth, y: shelterY - shelterHalfDepth },
          { x: shelterX + shelterHalfWidth, y: shelterY - shelterHalfDepth },
          { x: shelterX + shelterHalfWidth, y: shelterY + shelterHalfDepth },
          { x: shelterX - shelterHalfWidth, y: shelterY + shelterHalfDepth },
        ],
        labelKey: "structure.shelter_candidate",
      },
    ],
  };
}

function circlePolygon(cx: number, cy: number, radius: number, segments: number) {
  const points: { x: number; y: number }[] = [];
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    points.push({ x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius });
  }
  return points;
}
