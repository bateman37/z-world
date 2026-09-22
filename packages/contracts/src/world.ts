import { z } from "zod";
import type { PlaceId } from "./ids.js";
import { worldPointSchema, type WorldPoint } from "./geometry.js";

/**
 * Geometría semántica mínima del sector de llegada (fixture procedural,
 * WLD-008/WLD-009). No es el generador semántico completo: representa solo
 * puntos, líneas, áreas y estructuras necesarios para esta entrega.
 */

export const AREA_TERRAIN_KINDS = [
  "open_ground",
  "dense_vegetation",
  "water",
  "obstacle",
] as const;
export type AreaTerrainKind = (typeof AREA_TERRAIN_KINDS)[number];

export const LINE_TERRAIN_KINDS = ["road", "watercourse"] as const;
export type LineTerrainKind = (typeof LINE_TERRAIN_KINDS)[number];

export const POINT_LANDMARK_KINDS = ["landmark", "silhouette"] as const;
export type PointLandmarkKind = (typeof POINT_LANDMARK_KINDS)[number];

export interface AreaFeature {
  readonly id: PlaceId;
  readonly kind: AreaTerrainKind;
  /** Polígono simple cerrado en coordenadas de mundo (metros). */
  readonly polygon: readonly WorldPoint[];
  /** Si es falso, ninguna ruta puede atravesar el interior del polígono. */
  readonly transitable: boolean;
  /** Multiplicador de coste de desplazamiento dentro del área (1 = normal). */
  readonly traversalCostMultiplier: number;
}

export interface LineFeature {
  readonly id: PlaceId;
  readonly kind: LineTerrainKind;
  readonly polyline: readonly WorldPoint[];
  readonly widthMeters: number;
}

export interface PointFeature {
  readonly id: PlaceId;
  readonly kind: PointLandmarkKind;
  readonly position: WorldPoint;
  readonly labelKey: string;
}

/**
 * Estructura reconocible con huella (el refugio candidato de esta entrega).
 * No tiene todavía interior, estancias ni inventario semántico (fuera de
 * alcance de WEB-001; ver CAT-002/WLD-010/WLD-011 para el horizonte).
 */
export interface StructureFeature {
  readonly id: PlaceId;
  readonly kind: "shelter_candidate";
  readonly footprint: readonly WorldPoint[];
  readonly labelKey: string;
}

export interface LocalSectorFixture {
  readonly generatorVersion: string;
  readonly seed: string;
  readonly bounds: {
    readonly minX: number;
    readonly minY: number;
    readonly maxX: number;
    readonly maxY: number;
  };
  readonly arrivalPoint: WorldPoint;
  readonly areas: readonly AreaFeature[];
  readonly lines: readonly LineFeature[];
  readonly points: readonly PointFeature[];
  readonly structures: readonly StructureFeature[];
}

const areaFeatureSchema = z.object({
  id: z.string(),
  kind: z.enum(AREA_TERRAIN_KINDS),
  polygon: z.array(worldPointSchema).min(3),
  transitable: z.boolean(),
  traversalCostMultiplier: z.number().positive(),
});

const lineFeatureSchema = z.object({
  id: z.string(),
  kind: z.enum(LINE_TERRAIN_KINDS),
  polyline: z.array(worldPointSchema).min(2),
  widthMeters: z.number().positive(),
});

const pointFeatureSchema = z.object({
  id: z.string(),
  kind: z.enum(POINT_LANDMARK_KINDS),
  position: worldPointSchema,
  labelKey: z.string(),
});

const structureFeatureSchema = z.object({
  id: z.string(),
  kind: z.literal("shelter_candidate"),
  footprint: z.array(worldPointSchema).min(3),
  labelKey: z.string(),
});

export const localSectorFixtureSchema = z.object({
  generatorVersion: z.string(),
  seed: z.string(),
  bounds: z.object({
    minX: z.number(),
    minY: z.number(),
    maxX: z.number(),
    maxY: z.number(),
  }),
  arrivalPoint: worldPointSchema,
  areas: z.array(areaFeatureSchema),
  lines: z.array(lineFeatureSchema),
  points: z.array(pointFeatureSchema),
  structures: z.array(structureFeatureSchema),
});
