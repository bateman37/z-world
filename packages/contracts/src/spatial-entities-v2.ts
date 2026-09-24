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

/** Cobertura removible de una zona de terreno (WLD-010 §3.2 capa 2), separada de su `kind` base (S10). */
export const TERRAIN_COVERAGE_KINDS = ["none", "vegetation", "debris"] as const;
export type TerrainCoverageKind = (typeof TERRAIN_COVERAGE_KINDS)[number];

export interface TerrainArea {
  readonly id: string;
  readonly kind: AreaTerrainKind;
  readonly polygon: readonly WorldPoint[];
  readonly transitable: boolean;
  readonly traversalCostMultiplier: number;
  /**
   * `Place` (perfil `ENV-02`/`ENV-03`) que representa esta área como punto
   * de interés jugable, si aplica (S2 de WEB-002). `null` para terreno de
   * fondo sin perfil interactivo propio.
   */
  readonly placeId: string | null;
  /**
   * Cobertura almacenada explícitamente por el generador o por una
   * transformación de S10 (`clear_vegetation`/`clear_debris`). `null` en
   * cualquier área anterior a S10: usar `effectiveTerrainCoverage()`
   * (nunca este campo directamente) para derivar la cobertura real, que
   * para una partida anterior asume `vegetation` sobre `dense_vegetation`
   * y `none` en el resto (S10 nunca inventó escombros retroactivos).
   */
  readonly coverage: TerrainCoverageKind | null;
}

export const terrainAreaSchema = z.object({
  id: z.string(),
  kind: z.enum(AREA_TERRAIN_KINDS),
  polygon: z.array(worldPointSchema).min(3),
  transitable: z.boolean(),
  traversalCostMultiplier: z.number().positive(),
  placeId: z.string().nullable().default(null),
  coverage: z.enum(TERRAIN_COVERAGE_KINDS).nullable().default(null),
});

/** Cobertura efectiva de una zona (S10, WLD-010 §3.2): deriva un valor conservador para áreas generadas antes de S10 en vez de asumir un campo nuevo vacío. */
export function effectiveTerrainCoverage(area: Pick<TerrainArea, "kind" | "coverage">): TerrainCoverageKind {
  if (area.coverage) return area.coverage;
  return area.kind === "dense_vegetation" ? "vegetation" : "none";
}

export interface LinearFeature {
  readonly id: string;
  readonly kind: LineTerrainKind;
  readonly polyline: readonly WorldPoint[];
  readonly widthMeters: number;
  /** Estado mutable de la carretera/camino (§19.6). Irrelevante para agua. */
  readonly wayState: "transitable" | "obstructed" | "cleared" | "function_removed" | null;
  /** `Place` (perfil `ENV-04`) que representa este tramo como punto de interés, si aplica (S2). */
  readonly placeId: string | null;
}

export const linearFeatureSchema = z.object({
  id: z.string(),
  kind: z.enum(LINE_TERRAIN_KINDS),
  polyline: z.array(worldPointSchema).min(2),
  widthMeters: z.number().positive(),
  wayState: z.enum(["transitable", "obstructed", "cleared", "function_removed"]).nullable(),
  placeId: z.string().nullable().default(null),
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
  /**
   * `TerrainArea` física de la que se recortó esta parcela (S10): fuente
   * única de aptitud, cobertura y coste de tránsito. `null` en una parcela
   * generada antes de S10 (S1-S9 nunca la poblaban), que sigue siendo
   * válida pero sin capacidad de despejar cobertura hasta que una nueva
   * parcela se trace sobre terreno enlazado.
   */
  readonly terrainAreaId: string | null;
}

export const parcelSchema = z.object({
  id: z.string(),
  polygon: z.array(worldPointSchema).min(3),
  cultivationPlotId: z.string().nullable(),
  terrainAreaId: z.string().nullable().default(null),
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

/**
 * Abertura física: hueco y espacios que conecta (§17.1). Distinta del
 * cierre instalado. `connectsRoomId` es la estancia principal (el lado
 * "interior" cuando `connectsToExterior` es verdadero); `connectsOtherRoomId`
 * es la segunda estancia cuando la abertura conecta dos estancias interiores
 * (S2 de WEB-002: el esqueleto de S1 solo preveía un lado, insuficiente
 * para representar puertas entre dos habitaciones reales).
 */
export interface Opening {
  readonly id: string;
  readonly position: WorldPoint;
  readonly connectsRoomId: string | null;
  readonly connectsOtherRoomId: string | null;
  readonly connectsToExterior: boolean;
  readonly widthClass: "narrow" | "normal" | "wide" | "gate";
  readonly installedClosureId: string | null;
}

export const openingSchema = z.object({
  id: z.string(),
  position: worldPointSchema,
  connectsRoomId: z.string().nullable(),
  connectsOtherRoomId: z.string().nullable().default(null),
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
  /**
   * S9 (WLD-011 §3.4): la comunidad echó ella misma el cierre (puede
   * desbloquearlo desde cualquier lado); un cierre encontrado bloqueado solo
   * se desbloquea desde el lado interior o se fuerza. Opcional en el tipo y
   * con `.default(false)` en el esquema: los cierres anteriores a S9 cargan
   * como no bloqueados por la comunidad.
   */
  readonly lockedByCommunity?: boolean;
  /** El mecanismo quedó roto al forzarlo: no se puede volver a bloquear hasta repararlo (S9). */
  readonly lockBroken?: boolean;
  /** Refuerzo del cierre con material concreto (S9): forzarlo exige más. */
  readonly reinforced?: boolean;
}

export const installedClosureSchema = z.object({
  id: z.string(),
  openingId: z.string(),
  kind: z.enum(["door", "gate", "window"]),
  state: z.enum(["open", "closed", "locked", "destroyed"]),
  condition: z.number().min(0).max(1),
  lockedByCommunity: z.boolean().default(false),
  lockBroken: z.boolean().default(false),
  reinforced: z.boolean().default(false),
});

/** Material concreto comprometido en una modificación/obstrucción (tablones de una barricada, S9): se recupera en parte al despejarla. */
export interface ObstructionMaterial {
  readonly resourceFamily: string;
  readonly quantity: number;
}

/**
 * Modificación u obstrucción de una abertura (WLD-011 §3.1, tercer concepto
 * separado del hueco y del cierre). Bloquea el paso mientras exista; un
 * mueble que bloquea no es una pared (se despeja), y tapiar
 * (`boarded_up`) sustituye funcionalmente la abertura por un tramo cerrado
 * sin eliminarla. Campos de S9 opcionales en el tipo y con `.default()`.
 */
export interface Obstruction {
  readonly id: string;
  readonly openingId: string;
  readonly kind: "blockade" | "boarded_up" | "rubble" | "furniture_block";
  readonly materials?: readonly ObstructionMaterial[];
  readonly createdByJobId?: string | null;
  readonly createdAtSimSeconds?: number;
}

export const obstructionSchema = z.object({
  id: z.string(),
  openingId: z.string(),
  kind: z.enum(["blockade", "boarded_up", "rubble", "furniture_block"]),
  materials: z.array(z.object({ resourceFamily: z.string(), quantity: z.number().positive() })).default([]),
  createdByJobId: z.string().nullable().default(null),
  createdAtSimSeconds: z.number().int().nonnegative().default(0),
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
  /** `true` cuando el trabajo de construcción terminó (S10): solo un tramo construido cierra un perímetro o afecta a la navegación. `false` para un trazado apenas planificado. */
  readonly built: boolean;
  readonly createdByJobId: string | null;
}

export const barrierSegmentSchema = z.object({
  id: z.string(),
  fromAnchorId: z.string(),
  toAnchorId: z.string(),
  crossesWayId: z.string().nullable(),
  wayCrossingMode: z.enum(["full_block", "pedestrian_gap", "handcart_gate"]).nullable(),
  built: z.boolean().default(false),
  createdByJobId: z.string().nullable().default(null),
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
