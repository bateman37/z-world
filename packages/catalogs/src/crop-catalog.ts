import type { ResourceFamily } from "@z-world/contracts";

/**
 * Catálogo mínimo y profundo de cultivos de S10 (`DEC-0020`, SET-011 §3.3).
 * Un solo cultivo real jugable (`garden_vegetables`) cubre por completo el
 * ciclo unprepared→cosechado; un segundo perfil (`test_fast_vegetables`)
 * existe únicamente para que la fixture E2E use tiempos abreviados con el
 * mismo motor determinista, nunca un botón de "crecer ahora" (§10.3 del
 * prompt de subhito). Ninguna cifra pretende ser definitiva: SET-011 §7
 * deja abiertos el catálogo completo, las fórmulas y los tiempos exactos.
 */
export const CROP_CATALOG_VERSION = "s10-v1" as const;

export interface CropProfile {
  readonly id: string;
  readonly version: number;
  readonly labelKey: string;
  readonly seedResourceFamily: ResourceFamily;
  readonly harvestResourceFamily: ResourceFamily;
  /** Semillas (kg) por m² para una siembra a densidad completa. */
  readonly seedKgPerM2: number;
  /** Minutos de trabajo de siembra por m² (modelo D). */
  readonly sowMinutesPerM2: number;
  /** Minutos de crecimiento a tiempo simulado completo (reloj, sin cuidado insuficiente ni daño). */
  readonly growthSimSeconds: number;
  /** El cultivo necesita agua/riego real para no perder rendimiento (SET-011 §3.3). */
  readonly needsWater: boolean;
  /** Cada cuánto tiempo simulado se considera "vencido" el último cuidado antes de contar como insuficiente. */
  readonly careIntervalSimSeconds: number;
  /** Rendimiento base (kg de cosecha por m² sembrado) en condiciones plenas, antes de modificadores causales. */
  readonly baseYieldKgPerM2: number;
  /** Herramienta requerida para sembrar/cuidar/cosechar con eficacia (CAT-005 §3.2: `tool_set.agriculture`). Sin ella, el método queda bloqueado, nunca degradado en silencio. */
  readonly requiredToolVariant: string;
  /** Minutos de cosecha por m² cosechado (modelo D). */
  readonly harvestMinutesPerM2: number;
  /** Minutos de preparación de suelo por m² (modelo D), independiente de la limpieza de cobertura previa. */
  readonly prepareMinutesPerM2: number;
}

export const CROP_PROFILES: readonly CropProfile[] = [
  {
    id: "garden_vegetables",
    version: 1,
    labelKey: "crop.garden_vegetables.label",
    seedResourceFamily: "seeds",
    harvestResourceFamily: "fresh_food",
    seedKgPerM2: 0.02,
    sowMinutesPerM2: 1.5,
    // Sin estaciones (SET-011 §3.4): una hortaliza de ciclo corto madura en unos 12 días de tiempo simulado bajo cuidado
    // pleno. No puede resolver la primera noche (12 días > cualquier ventana de la primera noche del escenario).
    growthSimSeconds: 12 * 24 * 60 * 60,
    needsWater: true,
    careIntervalSimSeconds: 2 * 24 * 60 * 60,
    baseYieldKgPerM2: 1.2,
    requiredToolVariant: "tool_set.agriculture",
    harvestMinutesPerM2: 2,
    prepareMinutesPerM2: 3,
  },
  /**
   * Perfil exclusivo de la fixture E2E (§10.3 del prompt de subhito): mismo
   * motor y mismas reglas causales, tiempos abreviados y versionados de
   * forma explícita para que una prueba de Chromium razonable no exija
   * esperar 12 días reales de tiempo simulado. Nunca se usa en una partida
   * jugable normal (el generador solo referencia `garden_vegetables`).
   */
  {
    id: "test_fast_vegetables",
    version: 1,
    labelKey: "crop.test_fast_vegetables.label",
    seedResourceFamily: "seeds",
    harvestResourceFamily: "fresh_food",
    seedKgPerM2: 0.02,
    sowMinutesPerM2: 0.2,
    growthSimSeconds: 10 * 60,
    needsWater: true,
    careIntervalSimSeconds: 5 * 60,
    baseYieldKgPerM2: 1.2,
    requiredToolVariant: "tool_set.agriculture",
    harvestMinutesPerM2: 0.5,
    prepareMinutesPerM2: 0.5,
  },
];

export const CROP_PROFILES_BY_ID: ReadonlyMap<string, CropProfile> = new Map(CROP_PROFILES.map((c) => [c.id, c]));

export function validateCropCatalog(): readonly string[] {
  const problems: string[] = [];
  for (const crop of CROP_PROFILES) {
    if (crop.growthSimSeconds <= 0) problems.push(`${crop.id}: growthSimSeconds debe ser positivo.`);
    if (crop.baseYieldKgPerM2 <= 0) problems.push(`${crop.id}: baseYieldKgPerM2 debe ser positivo.`);
    if (crop.seedKgPerM2 <= 0) problems.push(`${crop.id}: seedKgPerM2 debe ser positivo.`);
  }
  return problems;
}
