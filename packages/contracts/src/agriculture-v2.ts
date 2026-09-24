import { z } from "zod";

/**
 * Entorno mutable y agricultura de WEB-002 §6.3/§19/§20. S1 dejó una forma
 * esquelética; S10 (`DEC-0020`) la profundiza de forma aditiva: ningún
 * campo existente cambia de tipo, y todo campo nuevo tiene un `.default()`
 * seguro para que un snapshot anterior a S10 siga cargando.
 */

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
  /** Progreso parcial (0-1) de la fase `prepared_soil` en curso, conservado a través de interrupción/reanudación (S10 §5.2). `0` en una parcela anterior a S10. */
  readonly preparationProgress: number;
  /** Nivel de daño/abandono acumulado (0-1): degrada el rendimiento y puede llevar a `harvested` sin cosecha útil si crece demasiado sin cuidado (S10 §5.2/§5.6). */
  readonly damageLevel: number;
}

export const cultivationPlotSchema = z.object({
  id: z.string(),
  parcelId: z.string(),
  state: z.enum(CULTIVATION_STATES),
  activeCropCycleId: z.string().nullable(),
  preparationProgress: z.number().min(0).max(1).default(0),
  damageLevel: z.number().min(0).max(1).default(0),
});

export interface CropCareEvent {
  readonly atSimSeconds: number;
  readonly sufficient: boolean;
}

export const cropCareEventSchema = z.object({ atSimSeconds: z.number().int().nonnegative(), sufficient: z.boolean() });

export interface CropCycle {
  readonly id: string;
  readonly cultivationPlotId: string;
  readonly cropId: string;
  readonly sownAtSimSeconds: number;
  readonly harvestableAtSimSeconds: number;
  /** Conservado por compatibilidad (S1): `true` si algún cuidado suficiente se registró alguna vez. La lógica real de S10 usa `careEvents`/`careScore`. */
  readonly cared: boolean;
  /** Superficie realmente sembrada (m², S10 §5.4): el rendimiento se deriva de esta cifra, nunca de la superficie nominal de la parcela. `0` en un ciclo anterior a S10 (degradación explícita: no se puede reconstruir a posteriori). */
  readonly sownAreaM2: number;
  /** Cantidad de semillas (kg) efectivamente consumida al sembrar (S10 §5.4). */
  readonly seedsSownKg: number;
  /** Historial de riegos/cuidados aplicados con su suficiencia (S10 §5.5). Determina `careScore` sin remuestrear nada. */
  readonly careEvents: readonly CropCareEvent[];
  /** Instante de simulación (segundos) del último cuidado recibido, o `null`. Usado para explicar en la UI si el cultivo lleva mucho sin atención. */
  readonly lastCaredAtSimSeconds: number | null;
  /** Instante de cosecha real, o `null` mientras no se ha cosechado (S10 §5.7). */
  readonly harvestedAtSimSeconds: number | null;
}

export const cropCycleSchema = z.object({
  id: z.string(),
  cultivationPlotId: z.string(),
  cropId: z.string(),
  sownAtSimSeconds: z.number().int().nonnegative(),
  harvestableAtSimSeconds: z.number().int().nonnegative(),
  cared: z.boolean(),
  sownAreaM2: z.number().nonnegative().default(0),
  seedsSownKg: z.number().nonnegative().default(0),
  careEvents: z.array(cropCareEventSchema).default([]),
  lastCaredAtSimSeconds: z.number().int().nonnegative().nullable().default(null),
  harvestedAtSimSeconds: z.number().int().nonnegative().nullable().default(null),
});

export const TERRAIN_CHANGE_KINDS = [
  "cleared_vegetation",
  "cleared_debris",
  "prepared_soil",
  "cleared_road",
  "way_function_removed",
  /** S10: un tramo de barrera terminó su construcción (WLD-010 §3.6). */
  "barrier_built",
] as const;
export type TerrainChangeKind = (typeof TERRAIN_CHANGE_KINDS)[number];

export interface PersistentTerrainChange {
  readonly id: string;
  readonly kind: TerrainChangeKind;
  readonly targetAreaOrLineId: string;
  readonly appliedAtSimSeconds: number;
  /** Lotes de recurso producidos por esta transformación (S10 §4.2: "los restos aprovechables se materializan como objetos o lotes con procedencia"). */
  readonly producedResourceLotIds: readonly string[];
  readonly createdByJobId: string | null;
}

export const persistentTerrainChangeSchema = z.object({
  id: z.string(),
  kind: z.enum(TERRAIN_CHANGE_KINDS),
  targetAreaOrLineId: z.string(),
  appliedAtSimSeconds: z.number().int().nonnegative(),
  producedResourceLotIds: z.array(z.string()).default([]),
  createdByJobId: z.string().nullable().default(null),
});

// --- Aptitud física (S10, WLD-010 §3.1) -------------------------------------

/** Veredicto cualitativo de aptitud de una superficie para una transformación concreta (WLD-010 §3.1). Nunca `true`/`false` desnudo. */
export const SUITABILITY_VERDICTS = [
  "valid",
  "valid_with_limitations",
  "unknown_insufficient_observation",
  "blocked_physical",
  "blocked_access",
  "blocked_requirements",
] as const;
export type SuitabilityVerdict = (typeof SUITABILITY_VERDICTS)[number];

/** Razón estructurada de una evaluación de aptitud: un código causal legible por la UI y por las pruebas, nunca solo un booleano. */
export interface SuitabilityReason {
  readonly code: string;
  readonly verdict: SuitabilityVerdict;
}

export interface TerrainSuitability {
  readonly verdict: SuitabilityVerdict;
  readonly reasons: readonly SuitabilityReason[];
}

/** Combina razones en un veredicto único: el peor veredicto presente manda, con `blocked_physical` como el más severo. */
const VERDICT_SEVERITY: Readonly<Record<SuitabilityVerdict, number>> = {
  valid: 0,
  valid_with_limitations: 1,
  unknown_insufficient_observation: 2,
  blocked_requirements: 3,
  blocked_access: 4,
  blocked_physical: 5,
};

export function combineSuitability(reasons: readonly SuitabilityReason[]): TerrainSuitability {
  if (reasons.length === 0) return { verdict: "valid", reasons: [] };
  const verdict = reasons.reduce<SuitabilityVerdict>((worst, r) => (VERDICT_SEVERITY[r.verdict] > VERDICT_SEVERITY[worst] ? r.verdict : worst), "valid");
  return { verdict, reasons };
}
