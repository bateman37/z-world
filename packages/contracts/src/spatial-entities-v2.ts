import { z } from "zod";
import { worldPointSchema, type WorldPoint } from "./geometry.js";
import { AREA_TERRAIN_KINDS, LINE_TERRAIN_KINDS, type AreaTerrainKind, type LineTerrainKind } from "./world.js";

/**
 * Entidades espaciales mínimas de WEB-002 §6.3. Esta versión es
 * deliberadamente "esquelética" (S1 de WEB-002): la forma existe y valida,
 * pero el generador semántico real (S2) y la geometría interior completa
 * (S3) todavía no la pueblan con contenido rico. No crea una clase por
 * sustantivo: son datos puros con un `kind` explícito.
 */

export interface TerrainArea {
  readonly id: string;
  readonly kind: AreaTerrainKind;
  readonly polygon: readonly WorldPoint[];
  readonly transitable: boolean;
  readonly traversalCostMultiplier: number;
}

export const terrainAreaSchema = z.object({
  id: z.string(),
  kind: z.enum(AREA_TERRAIN_KINDS),
  polygon: z.array(worldPointSchema).min(3),
  transitable: z.boolean(),
  traversalCostMultiplier: z.number().positive(),
});

export interface LinearFeature {
  readonly id: string;
  readonly kind: LineTerrainKind;
  readonly polyline: readonly WorldPoint[];
  readonly widthMeters: number;
  /** Estado mutable de la carretera/camino (§19.6). Irrelevante para agua. */
  readonly wayState: "transitable" | "obstructed" | "cleared" | "function_removed" | null;
}

export const linearFeatureSchema = z.object({
  id: z.string(),
  kind: z.enum(LINE_TERRAIN_KINDS),
  polyline: z.array(worldPointSchema).min(2),
  widthMeters: z.number().positive(),
  wayState: z.enum(["transitable", "obstructed", "cleared", "function_removed"]).nullable(),
});

export const NATURAL_OR_TECHNICAL_NODE_KINDS = ["water_source", "landmark", "silhouette"] as const;
export type NaturalOrTechnicalNodeKind = (typeof NATURAL_OR_TECHNICAL_NODE_KINDS)[number];

export interface NaturalOrTechnicalNode {
  readonly id: string;
  readonly kind: NaturalOrTechnicalNodeKind;
  readonly position: WorldPoint;
  readonly placeId: string | null;
  readonly labelKey: string;
}

export const naturalOrTechnicalNodeSchema = z.object({
  id: z.string(),
  kind: z.enum(NATURAL_OR_TECHNICAL_NODE_KINDS),
  position: worldPointSchema,
  placeId: z.string().nullable(),
  labelKey: z.string(),
});

export interface Parcel {
  readonly id: string;
  readonly polygon: readonly WorldPoint[];
  readonly cultivationPlotId: string | null;
}

export const parcelSchema = z.object({
  id: z.string(),
  polygon: z.array(worldPointSchema).min(3),
  cultivationPlotId: z.string().nullable(),
});

/** Perfiles aprobados de CAT-004 (§8.1 de WEB-002). Exactamente ocho. */
export const PLACE_PROFILE_IDS = [
  "RES-10",
  "RES-17",
  "COM-02",
  "TAL-01",
  "ENV-01",
  "ENV-02",
  "ENV-03",
  "ENV-04",
] as const;
export type PlaceProfileId = (typeof PLACE_PROFILE_IDS)[number];

export interface Place {
  readonly id: string;
  readonly profileId: PlaceProfileId;
  readonly position: WorldPoint;
  readonly buildingId: string | null;
}

export const placeSchema = z.object({
  id: z.string(),
  profileId: z.enum(PLACE_PROFILE_IDS),
  position: worldPointSchema,
  buildingId: z.string().nullable(),
});

/**
 * Edificio mínimo. `interiorGenerated: false` marca explícitamente que el
 * programa/grafo funcional de S3 todavía no existe para esta instancia
 * (caso esperado en la migración V1→V2 de S1, degradación documentada).
 */
export interface Building {
  readonly id: string;
  readonly placeId: string;
  readonly footprint: readonly WorldPoint[];
  readonly labelKey: string;
  readonly interiorGenerated: boolean;
  readonly activeFloorId: string | null;
}

export const buildingSchema = z.object({
  id: z.string(),
  placeId: z.string(),
  footprint: z.array(worldPointSchema).min(3),
  labelKey: z.string(),
  interiorGenerated: z.boolean(),
  activeFloorId: z.string().nullable(),
});

export interface Floor {
  readonly id: string;
  readonly buildingId: string;
  readonly level: number;
  readonly active: boolean;
}

export const floorSchema = z.object({
  id: z.string(),
  buildingId: z.string(),
  level: z.number().int(),
  active: z.boolean(),
});

export interface Room {
  readonly id: string;
  readonly floorId: string;
  readonly polygon: readonly WorldPoint[];
  readonly programRoleKey: string | null;
}

export const roomSchema = z.object({
  id: z.string(),
  floorId: z.string(),
  polygon: z.array(worldPointSchema).min(3),
  programRoleKey: z.string().nullable(),
});

/** Abertura física: hueco y espacios que conecta (§17.1). Distinta del cierre instalado. */
export interface Opening {
  readonly id: string;
  readonly position: WorldPoint;
  readonly connectsRoomId: string | null;
  readonly connectsToExterior: boolean;
  readonly widthClass: "narrow" | "normal" | "wide" | "gate";
  readonly installedClosureId: string | null;
}

export const openingSchema = z.object({
  id: z.string(),
  position: worldPointSchema,
  connectsRoomId: z.string().nullable(),
  connectsToExterior: z.boolean(),
  widthClass: z.enum(["narrow", "normal", "wide", "gate"]),
  installedClosureId: z.string().nullable(),
});

export interface InstalledClosure {
  readonly id: string;
  readonly openingId: string;
  readonly kind: "door" | "gate" | "window";
  readonly state: "open" | "closed" | "locked" | "destroyed";
  readonly condition: number;
}

export const installedClosureSchema = z.object({
  id: z.string(),
  openingId: z.string(),
  kind: z.enum(["door", "gate", "window"]),
  state: z.enum(["open", "closed", "locked", "destroyed"]),
  condition: z.number().min(0).max(1),
});

export interface Obstruction {
  readonly id: string;
  readonly openingId: string;
  readonly kind: "blockade" | "boarded_up" | "rubble" | "furniture_block";
}

export const obstructionSchema = z.object({
  id: z.string(),
  openingId: z.string(),
  kind: z.enum(["blockade", "boarded_up", "rubble", "furniture_block"]),
});

export interface Anchor {
  readonly id: string;
  readonly position: WorldPoint;
  readonly kind: "building_corner" | "compatible_wall" | "post" | "barrier_end" | "opening" | "natural_feature";
}

export const anchorSchema = z.object({
  id: z.string(),
  position: worldPointSchema,
  kind: z.enum(["building_corner", "compatible_wall", "post", "barrier_end", "opening", "natural_feature"]),
});

export interface BarrierSegment {
  readonly id: string;
  readonly fromAnchorId: string;
  readonly toAnchorId: string;
  readonly crossesWayId: string | null;
  readonly wayCrossingMode: "full_block" | "pedestrian_gap" | "handcart_gate" | null;
}

export const barrierSegmentSchema = z.object({
  id: z.string(),
  fromAnchorId: z.string(),
  toAnchorId: z.string(),
  crossesWayId: z.string().nullable(),
  wayCrossingMode: z.enum(["full_block", "pedestrian_gap", "handcart_gate"]).nullable(),
});

export interface PerimeterNetwork {
  readonly id: string;
  readonly segmentIds: readonly string[];
  readonly closed: boolean;
}

export const perimeterNetworkSchema = z.object({
  id: z.string(),
  segmentIds: z.array(z.string()),
  closed: z.boolean(),
});
