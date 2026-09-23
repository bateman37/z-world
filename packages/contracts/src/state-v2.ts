import { z } from "zod";
import { simulationClockSchema, type SimulationClock } from "./clock.js";
import {
  personHiddenFactsSchema,
  personPublicFactsSchema,
  type PersonHiddenFacts,
  type PersonId,
  type PersonPublicFacts,
} from "./person.js";
import { fogGridSchema, type FogGrid } from "./fog-grid.js";
import { prngStateByDomainSchema, type PrngStateByDomain } from "./prng.js";
import { needStateSchema, type NeedState } from "./needs-v2.js";
import { entityLocationSchema, type EntityLocation } from "./location-v2.js";
import {
  anchorSchema,
  barrierSegmentSchema,
  buildingSchema,
  floorSchema,
  installedClosureSchema,
  linearFeatureSchema,
  naturalOrTechnicalNodeSchema,
  obstructionSchema,
  openingSchema,
  parcelSchema,
  perimeterNetworkSchema,
  placeSchema,
  roomSchema,
  terrainAreaSchema,
  type Anchor,
  type BarrierSegment,
  type Building,
  type Floor,
  type InstalledClosure,
  type LinearFeature,
  type NaturalOrTechnicalNode,
  type Obstruction,
  type Opening,
  type Parcel,
  type PerimeterNetwork,
  type Place,
  type Room,
  type TerrainArea,
} from "./spatial-entities-v2.js";
import {
  containerSchema,
  furnitureSchema,
  loadBundleSchema,
  resourceLotSchema,
  transferPointSchema,
  transportMeansSchema,
  worldObjectSchema,
  type Container,
  type Furniture,
  type LoadBundle,
  type ResourceLot,
  type TransferPoint,
  type TransportMeans,
  type WorldObject,
} from "./objects-v2.js";
import {
  cropCycleSchema,
  cultivationPlotSchema,
  persistentTerrainChangeSchema,
  type CropCycle,
  type CultivationPlot,
  type PersistentTerrainChange,
} from "./agriculture-v2.js";
import {
  businessProfileSchema,
  discoveryRecordSchema,
  lootPressureZoneSchema,
  lootingRouteSchema,
  occupantProfileSchema,
  placeHistorySchema,
  type BusinessProfile,
  type DiscoveryRecord,
  type LootPressureZone,
  type LootingRoute,
  type OccupantProfile,
  type PlaceHistory,
} from "./place-history-v2.js";
import {
  designationSchema,
  jobSchema,
  reservationSchema,
  workEpisodeSchema,
  workZoneSchema,
  type Designation,
  type Job,
  type Reservation,
  type WorkEpisode,
  type WorkZone,
} from "./work-v2.js";
import type { LocalSectorFixture } from "./world.js";
import { localSectorFixtureSchema } from "./world.js";

export const SIMULATION_STATE_V2_SCHEMA_VERSION = 2 as const;

/**
 * Persona en `SimulationStateV2`: conserva íntegramente la forma de
 * `PersonPublicFacts`/`PersonHiddenFacts` de WEB-001 (características,
 * habilidades, prioridades, biografía, relaciones, pertenencias, estado
 * operativo, movimiento directo) y añade necesidades, ubicación única y
 * equipamiento/carga real (§6.3, §14 de WEB-002).
 */
export interface PersonStateV2 {
  readonly public: PersonPublicFacts;
  readonly hidden: PersonHiddenFacts;
  readonly needs: readonly NeedState[];
  readonly location: EntityLocation;
  readonly carriedLoadBundleId: string | null;
  readonly activeJobId: string | null;
}

export const personStateV2Schema = z.object({
  public: personPublicFactsSchema,
  hidden: personHiddenFactsSchema,
  needs: z.array(needStateSchema),
  location: entityLocationSchema,
  carriedLoadBundleId: z.string().nullable(),
  activeJobId: z.string().nullable(),
});

export interface SemanticWorldV2 {
  readonly generatorVersion: string;
  readonly seed: string;
  readonly bounds: { readonly minX: number; readonly minY: number; readonly maxX: number; readonly maxY: number };
  readonly arrivalPoint: { readonly x: number; readonly y: number };
  readonly terrainAreas: Readonly<Record<string, TerrainArea>>;
  readonly linearFeatures: Readonly<Record<string, LinearFeature>>;
  readonly nodes: Readonly<Record<string, NaturalOrTechnicalNode>>;
  readonly parcels: Readonly<Record<string, Parcel>>;
  readonly places: Readonly<Record<string, Place>>;
  readonly buildings: Readonly<Record<string, Building>>;
  readonly floors: Readonly<Record<string, Floor>>;
  readonly rooms: Readonly<Record<string, Room>>;
  readonly openings: Readonly<Record<string, Opening>>;
  readonly installedClosures: Readonly<Record<string, InstalledClosure>>;
  readonly obstructions: Readonly<Record<string, Obstruction>>;
  readonly anchors: Readonly<Record<string, Anchor>>;
  readonly barrierSegments: Readonly<Record<string, BarrierSegment>>;
  readonly perimeterNetworks: Readonly<Record<string, PerimeterNetwork>>;
  readonly occupantProfiles: Readonly<Record<string, OccupantProfile>>;
  readonly businessProfiles: Readonly<Record<string, BusinessProfile>>;
  readonly placeHistories: Readonly<Record<string, PlaceHistory>>;
  readonly lootPressureZones: Readonly<Record<string, LootPressureZone>>;
  readonly lootingRoutes: Readonly<Record<string, LootingRoute>>;
}

export const semanticWorldV2Schema = z.object({
  generatorVersion: z.string(),
  seed: z.string(),
  bounds: z.object({ minX: z.number(), minY: z.number(), maxX: z.number(), maxY: z.number() }),
  arrivalPoint: z.object({ x: z.number(), y: z.number() }),
  terrainAreas: z.record(z.string(), terrainAreaSchema),
  linearFeatures: z.record(z.string(), linearFeatureSchema),
  nodes: z.record(z.string(), naturalOrTechnicalNodeSchema),
  parcels: z.record(z.string(), parcelSchema),
  places: z.record(z.string(), placeSchema),
  buildings: z.record(z.string(), buildingSchema),
  floors: z.record(z.string(), floorSchema),
  rooms: z.record(z.string(), roomSchema),
  openings: z.record(z.string(), openingSchema),
  installedClosures: z.record(z.string(), installedClosureSchema),
  obstructions: z.record(z.string(), obstructionSchema),
  anchors: z.record(z.string(), anchorSchema),
  barrierSegments: z.record(z.string(), barrierSegmentSchema),
  perimeterNetworks: z.record(z.string(), perimeterNetworkSchema),
  occupantProfiles: z.record(z.string(), occupantProfileSchema),
  businessProfiles: z.record(z.string(), businessProfileSchema),
  placeHistories: z.record(z.string(), placeHistorySchema),
  lootPressureZones: z.record(z.string(), lootPressureZoneSchema),
  lootingRoutes: z.record(z.string(), lootingRouteSchema),
});

export interface MigrationRecord {
  readonly fromSchemaVersion: number;
  readonly toSchemaVersion: number;
  readonly migratedAtSimSeconds: number;
  readonly degradations: readonly string[];
}

export const migrationRecordSchema = z.object({
  fromSchemaVersion: z.number().int(),
  toSchemaVersion: z.number().int(),
  migratedAtSimSeconds: z.number().int().nonnegative(),
  degradations: z.array(z.string()),
});

/**
 * Estado canónico V2 (§6.2 de WEB-002). Forma esquelética de S1: todas las
 * entidades de §6.3 existen como datos validados; el generador semántico
 * real (S2), los edificios con programa (S3), el motor de resolución
 * (S4), el planificador (S5), las necesidades causales (S6), los objetos
 * profundos (S7), el transporte (S8), la explotación (S9) y la
 * agricultura (S10) las pueblan de comportamiento en subhitos posteriores.
 */
export interface SimulationStateV2 {
  readonly schemaVersion: typeof SIMULATION_STATE_V2_SCHEMA_VERSION;
  readonly seed: string;
  readonly scenario: { readonly scenarioId: "SCN-001"; readonly arrivalMonth: "april"; readonly title: string };
  readonly clock: SimulationClock;
  readonly people: Readonly<Record<PersonId, PersonStateV2>>;
  readonly peopleOrder: readonly PersonId[];
  readonly world: SemanticWorldV2;
  readonly discoveries: readonly DiscoveryRecord[];
  readonly fog: FogGrid;
  readonly workZones: Readonly<Record<string, WorkZone>>;
  readonly designations: Readonly<Record<string, Designation>>;
  readonly jobs: Readonly<Record<string, Job>>;
  readonly episodes: Readonly<Record<string, WorkEpisode>>;
  readonly reservations: Readonly<Record<string, Reservation>>;
  readonly furniture: Readonly<Record<string, Furniture>>;
  readonly containers: Readonly<Record<string, Container>>;
  readonly worldObjects: Readonly<Record<string, WorldObject>>;
  readonly resourceLots: Readonly<Record<string, ResourceLot>>;
  readonly transportMeans: Readonly<Record<string, TransportMeans>>;
  readonly loadBundles: Readonly<Record<string, LoadBundle>>;
  readonly transferPoints: Readonly<Record<string, TransferPoint>>;
  readonly cultivationPlots: Readonly<Record<string, CultivationPlot>>;
  readonly cropCycles: Readonly<Record<string, CropCycle>>;
  readonly terrainChanges: Readonly<Record<string, PersistentTerrainChange>>;
  readonly prng: PrngStateByDomain;
  readonly sequences: {
    readonly nextDomainEventSequence: number;
    readonly nextPersonOrdinal: number;
    readonly nextPlaceOrdinal: number;
    readonly nextEntityOrdinal: number;
  };
  readonly migration: MigrationRecord | null;
}

export const simulationStateV2Schema = z.object({
  schemaVersion: z.literal(SIMULATION_STATE_V2_SCHEMA_VERSION),
  seed: z.string(),
  scenario: z.object({
    scenarioId: z.literal("SCN-001"),
    arrivalMonth: z.literal("april"),
    title: z.string(),
  }),
  clock: simulationClockSchema,
  people: z.record(z.string(), personStateV2Schema),
  peopleOrder: z.array(z.string()),
  world: semanticWorldV2Schema,
  discoveries: z.array(discoveryRecordSchema),
  fog: fogGridSchema,
  workZones: z.record(z.string(), workZoneSchema),
  designations: z.record(z.string(), designationSchema),
  jobs: z.record(z.string(), jobSchema),
  episodes: z.record(z.string(), workEpisodeSchema),
  reservations: z.record(z.string(), reservationSchema),
  furniture: z.record(z.string(), furnitureSchema),
  containers: z.record(z.string(), containerSchema),
  worldObjects: z.record(z.string(), worldObjectSchema),
  resourceLots: z.record(z.string(), resourceLotSchema),
  transportMeans: z.record(z.string(), transportMeansSchema),
  loadBundles: z.record(z.string(), loadBundleSchema),
  transferPoints: z.record(z.string(), transferPointSchema),
  cultivationPlots: z.record(z.string(), cultivationPlotSchema),
  cropCycles: z.record(z.string(), cropCycleSchema),
  terrainChanges: z.record(z.string(), persistentTerrainChangeSchema),
  prng: prngStateByDomainSchema,
  sequences: z.object({
    nextDomainEventSequence: z.number().int().nonnegative(),
    nextPersonOrdinal: z.number().int().nonnegative(),
    nextPlaceOrdinal: z.number().int().nonnegative(),
    nextEntityOrdinal: z.number().int().nonnegative(),
  }),
  migration: migrationRecordSchema.nullable(),
});

export interface ParseSimulationStateV2Result {
  readonly success: boolean;
  readonly data?: SimulationStateV2;
  readonly error?: string;
}

/**
 * Valida un valor desconocido contra el esquema Zod de V2. Igual que
 * `parseSimulationStateV1`, el `as` está localizado aquí a propósito: Zod
 * valida la forma con más generalidad que las uniones de literales de los
 * tipos de dominio.
 */
export function parseSimulationStateV2(data: unknown): ParseSimulationStateV2Result {
  const result = simulationStateV2Schema.safeParse(data);
  if (!result.success) {
    return { success: false, error: result.error.message };
  }
  return { success: true, data: result.data as unknown as SimulationStateV2 };
}

/** Fixture V1 conservado únicamente como referencia de forma para pruebas de migración, nunca como mundo jugable (§7.1). */
export type { LocalSectorFixture as LegacyV1Fixture };
export { localSectorFixtureSchema as legacyV1FixtureSchema };
