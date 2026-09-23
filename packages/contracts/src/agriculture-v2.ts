import { z } from "zod";

/** Entorno mutable y agricultura mínimos de WEB-002 §6.3/§19/§20. Forma esquelética (S1); comportamiento real en S10. */

export const CULTIVATION_STATES = [
  "unprepared",
  "cleared",
  "prepared",
  "sown",
  "growing",
  "harvestable",
  "harvested",
] as const;
export type CultivationState = (typeof CULTIVATION_STATES)[number];

export interface CultivationPlot {
  readonly id: string;
  readonly parcelId: string;
  readonly state: CultivationState;
  readonly activeCropCycleId: string | null;
}

export const cultivationPlotSchema = z.object({
  id: z.string(),
  parcelId: z.string(),
  state: z.enum(CULTIVATION_STATES),
  activeCropCycleId: z.string().nullable(),
});

export interface CropCycle {
  readonly id: string;
  readonly cultivationPlotId: string;
  readonly cropId: string;
  readonly sownAtSimSeconds: number;
  readonly harvestableAtSimSeconds: number;
  readonly cared: boolean;
}

export const cropCycleSchema = z.object({
  id: z.string(),
  cultivationPlotId: z.string(),
  cropId: z.string(),
  sownAtSimSeconds: z.number().int().nonnegative(),
  harvestableAtSimSeconds: z.number().int().nonnegative(),
  cared: z.boolean(),
});

export const TERRAIN_CHANGE_KINDS = [
  "cleared_vegetation",
  "cleared_debris",
  "prepared_soil",
  "cleared_road",
  "way_function_removed",
] as const;
export type TerrainChangeKind = (typeof TERRAIN_CHANGE_KINDS)[number];

export interface PersistentTerrainChange {
  readonly id: string;
  readonly kind: TerrainChangeKind;
  readonly targetAreaOrLineId: string;
  readonly appliedAtSimSeconds: number;
}

export const persistentTerrainChangeSchema = z.object({
  id: z.string(),
  kind: z.enum(TERRAIN_CHANGE_KINDS),
  targetAreaOrLineId: z.string(),
  appliedAtSimSeconds: z.number().int().nonnegative(),
});
