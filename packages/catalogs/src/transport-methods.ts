import type { BulkClass, CapacityProfile, CharacteristicId, HandlingTag, SkillId, TransportMethod } from "@z-world/contracts";
import { TRANSPORT_METHODS } from "@z-world/contracts";

/**
 * Datos versionados de los cinco métodos de transporte activos de SET-010
 * §3.2/§3.4 (S8 — Puerta B, §7.3 del prompt S7-S9). Un único motor de
 * transporte (`simulation-core/src/v2/transport`) los consume: carretilla
 * y carro no son dos sistemas, sino dos entradas de datos distintas.
 *
 * Todas las cifras son provisionales (SET-010 §7 deja abiertas capacidades,
 * velocidades, pendientes, anchuras, ruido y fatiga exactos). Se eligieron
 * para que las diferencias sean observables y defendibles en el pueblo
 * generado, y están documentadas en `docs/STATUS.md` («S8 — Puerta B»).
 *
 * Datos declarados pero sin terreno que los ejercite todavía (el generador
 * no produce pendientes, escalones, escaleras, barro, grava ni escombros):
 * `maxSlopePercent`, `stairs` y las superficies `mud`/`gravel`/`rubble` no
 * existen como celdas del mundo, así que no se inventan.
 */

export const TRANSPORT_TUNING_VERSION = "s8-v1" as const;

export const OPENING_WIDTH_CLASSES = ["narrow", "normal", "wide", "gate"] as const;
export type OpeningWidthClass = (typeof OPENING_WIDTH_CLASSES)[number];
/** Orden de anchura cualitativa de WLD-011 §3.7 (estrecho < normal < ancho < portón). */
export const OPENING_WIDTH_RANK: Readonly<Record<OpeningWidthClass, number>> = { narrow: 0, normal: 1, wide: 2, gate: 3 };

export const BULK_RANK: Readonly<Record<BulkClass, number>> = { small: 0, medium: 1, large: 2, bulky: 3 };

/** Superficies que el mundo generado distingue hoy (carretera firme, tierra, vegetación densa/bosque, interior). */
export const SURFACE_KINDS = ["road", "open_ground", "dense_vegetation", "interior"] as const;
export type SurfaceKind = (typeof SURFACE_KINDS)[number];

export interface SurfaceBehaviour {
  /** Multiplicador de velocidad sobre la marcha base a pie cargado. */
  readonly speed: number;
  /** Ruido por metro recorrido (unidades provisionales). */
  readonly noisePerMeter: number;
  /** Multiplicador de esfuerzo/fatiga sobre el coste de desplazamiento de S6. */
  readonly effort: number;
}

export interface TransportMethodDefinition {
  readonly method: TransportMethod;
  readonly version: number;
  readonly labelKey: string;
  /** Usa un `TransportMeans` localizado (carretilla/carro). */
  readonly usesMeans: boolean;
  /** Usa un recipiente/equipamiento personal real que lleva la persona (mochila, saco, caja). */
  readonly usesPersonalContainer: boolean;
  readonly minOperators: number;
  readonly maxOperators: number;
  /** Capacidad de porte individual: reutiliza `computeEffectiveCapacity` con estos datos (perfiles 70/30, 50/50, 30/70 de S4). */
  readonly carryCapacity: { readonly characteristicIds: readonly CharacteristicId[]; readonly skillIds: readonly SkillId[]; readonly profile: CapacityProfile };
  /** Kg por persona = base + porCapacidad × capacidad efectiva (0-10). Ignorado si el método usa un medio. */
  readonly perPersonBaseKg: number;
  readonly perPersonKgPerCapacityPoint: number;
  /** Volumen máximo (L): por persona en métodos manuales, total en un medio. */
  readonly maxVolumeLiters: number;
  /** Bulto máximo que admite el método (peso y bulto bloquean de forma independiente). */
  readonly maxBulk: BulkClass;
  /** Etiquetas de manipulación incompatibles con el método. */
  readonly forbiddenHandlingTags: readonly HandlingTag[];
  /** Anchura mínima de acceso que exige el método con carga (WLD-011 §3.7). */
  readonly minOpeningClass: OpeningWidthClass;
  /** Comportamiento por superficie; `null` = intransitable para este método. */
  readonly surfaces: Readonly<Record<SurfaceKind, SurfaceBehaviour | null>>;
  /** Velocidad cuando el medio va vacío (ida a recoger, vuelta a devolver), sobre la marcha base. */
  readonly emptySpeed: number;
  readonly prepareMinutes: number;
  readonly loadMinutes: number;
  readonly unloadMinutes: number;
  /** Pendiente máxima declarada (%). Sin terreno inclinado generado todavía. */
  readonly maxSlopePercent: number;
  /** Puede subir/bajar escaleras. Sin escaleras generadas todavía. */
  readonly stairs: boolean;
  /** Facilidad de abandono ante peligro (SET-010 §3.4), cualitativa. */
  readonly abandonEase: "easy" | "medium" | "hard";
}

const MANUAL_CAPACITY = { characteristicIds: ["strength", "endurance"] as const, skillIds: [] as const, profile: "physical_70_30" as const };
const WHEELED_CAPACITY = { characteristicIds: ["strength", "agility"] as const, skillIds: [] as const, profile: "physical_70_30" as const };

export const TRANSPORT_METHOD_DEFINITIONS: readonly TransportMethodDefinition[] = [
  {
    method: "hand_carry",
    version: 1,
    labelKey: "transport_method.hand_carry",
    usesMeans: false,
    usesPersonalContainer: false,
    minOperators: 1,
    maxOperators: 4,
    carryCapacity: MANUAL_CAPACITY,
    perPersonBaseKg: 10,
    perPersonKgPerCapacityPoint: 2.5,
    maxVolumeLiters: 45,
    maxBulk: "large",
    forbiddenHandlingTags: [],
    minOpeningClass: "narrow",
    surfaces: {
      road: { speed: 0.85, noisePerMeter: 0.1, effort: 1.8 },
      open_ground: { speed: 0.8, noisePerMeter: 0.1, effort: 2 },
      dense_vegetation: { speed: 0.65, noisePerMeter: 0.15, effort: 2.4 },
      interior: { speed: 0.8, noisePerMeter: 0.1, effort: 1.8 },
    },
    emptySpeed: 1,
    prepareMinutes: 0,
    loadMinutes: 1,
    unloadMinutes: 1,
    maxSlopePercent: 40,
    stairs: true,
    abandonEase: "easy",
  },
  {
    method: "personal_container",
    version: 1,
    labelKey: "transport_method.personal_container",
    usesMeans: false,
    usesPersonalContainer: true,
    minOperators: 1,
    maxOperators: 1,
    carryCapacity: MANUAL_CAPACITY,
    perPersonBaseKg: 12,
    perPersonKgPerCapacityPoint: 2.8,
    maxVolumeLiters: 40,
    maxBulk: "medium",
    forbiddenHandlingTags: ["bulky", "long"],
    minOpeningClass: "narrow",
    surfaces: {
      road: { speed: 0.95, noisePerMeter: 0.05, effort: 1.3 },
      open_ground: { speed: 0.9, noisePerMeter: 0.05, effort: 1.4 },
      dense_vegetation: { speed: 0.8, noisePerMeter: 0.08, effort: 1.7 },
      interior: { speed: 0.9, noisePerMeter: 0.05, effort: 1.3 },
    },
    emptySpeed: 1,
    prepareMinutes: 0,
    loadMinutes: 2,
    unloadMinutes: 2,
    maxSlopePercent: 40,
    stairs: true,
    abandonEase: "easy",
  },
  {
    method: "coordinated_carry",
    version: 1,
    labelKey: "transport_method.coordinated_carry",
    usesMeans: false,
    usesPersonalContainer: false,
    minOperators: 2,
    maxOperators: 4,
    carryCapacity: MANUAL_CAPACITY,
    perPersonBaseKg: 10,
    perPersonKgPerCapacityPoint: 3,
    maxVolumeLiters: 900,
    maxBulk: "bulky",
    forbiddenHandlingTags: [],
    // Dos porteadores no pasan por una puerta normal con un bulto (WLD-011 §3.7: «Ancho: dos porteadores»).
    minOpeningClass: "wide",
    surfaces: {
      road: { speed: 0.6, noisePerMeter: 0.3, effort: 2.4 },
      open_ground: { speed: 0.55, noisePerMeter: 0.3, effort: 2.6 },
      dense_vegetation: { speed: 0.35, noisePerMeter: 0.45, effort: 3.2 },
      interior: { speed: 0.5, noisePerMeter: 0.3, effort: 2.4 },
    },
    emptySpeed: 1,
    prepareMinutes: 1,
    loadMinutes: 3,
    unloadMinutes: 3,
    maxSlopePercent: 25,
    stairs: true,
    abandonEase: "medium",
  },
  {
    method: "wheelbarrow",
    version: 1,
    labelKey: "transport_method.wheelbarrow",
    usesMeans: true,
    usesPersonalContainer: false,
    minOperators: 1,
    maxOperators: 2,
    carryCapacity: WHEELED_CAPACITY,
    perPersonBaseKg: 0,
    perPersonKgPerCapacityPoint: 0,
    maxVolumeLiters: 120,
    maxBulk: "bulky",
    // Una carretilla bascula: lo que debe ir vertical (frigorífico) no viaja en ella.
    forbiddenHandlingTags: ["keep_upright"],
    minOpeningClass: "wide",
    surfaces: {
      road: { speed: 0.95, noisePerMeter: 0.5, effort: 1.3 },
      open_ground: { speed: 0.85, noisePerMeter: 0.6, effort: 1.5 },
      // Una rueda en bosque: posible pero lenta y cansada.
      dense_vegetation: { speed: 0.45, noisePerMeter: 0.8, effort: 2.3 },
      interior: { speed: 0.8, noisePerMeter: 0.5, effort: 1.3 },
    },
    emptySpeed: 0.95,
    prepareMinutes: 1,
    loadMinutes: 2,
    unloadMinutes: 2,
    maxSlopePercent: 20,
    stairs: false,
    abandonEase: "easy",
  },
  {
    method: "handcart",
    version: 1,
    labelKey: "transport_method.handcart",
    usesMeans: true,
    usesPersonalContainer: false,
    minOperators: 1,
    maxOperators: 2,
    carryCapacity: WHEELED_CAPACITY,
    perPersonBaseKg: 0,
    perPersonKgPerCapacityPoint: 0,
    maxVolumeLiters: 250,
    maxBulk: "bulky",
    // Un carro de compra/mano no admite cargas largas que sobresalen.
    forbiddenHandlingTags: ["long"],
    minOpeningClass: "wide",
    surfaces: {
      // Eficiente sobre firme; torpe y ruidoso fuera de él (SET-010 §8).
      road: { speed: 1.05, noisePerMeter: 0.7, effort: 1.1 },
      open_ground: { speed: 0.6, noisePerMeter: 1.4, effort: 1.8 },
      dense_vegetation: null,
      interior: { speed: 0.9, noisePerMeter: 0.6, effort: 1.1 },
    },
    emptySpeed: 1,
    prepareMinutes: 1,
    loadMinutes: 2,
    unloadMinutes: 2,
    maxSlopePercent: 10,
    stairs: false,
    abandonEase: "medium",
  },
];

export const TRANSPORT_METHOD_DEFINITIONS_BY_METHOD: ReadonlyMap<TransportMethod, TransportMethodDefinition> = new Map(TRANSPORT_METHOD_DEFINITIONS.map((d) => [d.method, d]));

/**
 * Topes de contribución de la cooperación real (§7.4 del prompt S7-S9,
 * deuda de S4-S6 en `DEC-0018`): ejecutor principal 100 %, primer ayudante
 * útil hasta 60 %, segundo hasta 35 %, tercero hasta 20 %.
 */
export const HELPER_CONTRIBUTION_CAPS: readonly number[] = [1, 0.6, 0.35, 0.2];

/** Ayudantes útiles según el bulto de la carga (espacio alrededor del objeto): nunca bonificación genérica (SET-010 §3.10). */
export const USEFUL_CARRIERS_BY_BULK: Readonly<Record<BulkClass, number>> = { small: 1, medium: 1, large: 2, bulky: 4 };

/** Porteadores que caben a la vez por la abertura más estrecha de la ruta (WLD-011 §3.7). */
export const USEFUL_CARRIERS_BY_OPENING: Readonly<Record<OpeningWidthClass | "none", number>> = { narrow: 1, normal: 1, wide: 2, gate: 4, none: 4 };

/** Ritmo en fases de transporte (§7.4: «rápido ahorra tiempo con más fatiga/ruido»). La fatiga reutiliza `fastPaceExtraMultiplier` de S6. */
export const TRANSPORT_PACE_SPEED: Readonly<Record<"relaxed" | "normal" | "fast", number>> = { relaxed: 0.85, normal: 1, fast: 1.15 };
export const TRANSPORT_PACE_NOISE: Readonly<Record<"relaxed" | "normal" | "fast", number>> = { relaxed: 0.8, normal: 1, fast: 1.3 };
/** Atención `careful` en carga/descarga: más lenta, protege lo frágil. `thorough` no tiene significado en transporte y se trata como `standard`. */
export const CAREFUL_LOAD_TIME_MULTIPLIER = 1.3;
/** Pérdida de condición de un objeto frágil por cada 10 m de superficie irregular (tierra/bosque) en un medio con ruedas; la mitad con atención `careful`. */
export const FRAGILE_WHEELED_ROUGH_LOSS_PER_10M = 0.01;

/** Tramo de ruta (m) tras el que se registra el ruido acumulado como consecuencia (nunca por tick). */
export const NOISE_REPORT_INTERVAL_METERS = 20;
/** Umbrales de banda de ruido por metro medio del tramo (unidades provisionales). */
export const NOISE_BAND_THRESHOLDS = { audible: 0.25, loud: 0.9 } as const;

/** Pesos de la valoración de `Auto` (SET-010 §3.9): minutos + fatiga + ruido, solo con información conocida. */
export const AUTO_SCORE_WEIGHTS = { minutes: 1, fatigue: 0.6, noise: 0.05, fragileRisk: 20 } as const;

/** Etiquetas de manipulación que un lote hereda de su familia (el agua es líquido). */
export const RESOURCE_HANDLING_TAGS: Readonly<Record<string, readonly HandlingTag[]>> = { water: ["liquid"] };

/** Volumen aproximado por unidad de lote (L): litros 1:1, kilos de material ~1 L, raciones ~0,5 L. */
export const RESOURCE_VOLUME_PER_UNIT: Readonly<Record<"liter" | "kilogram" | "unit", number>> = { liter: 1, kilogram: 1, unit: 0.5 };

export function validateTransportCatalog(): readonly string[] {
  const problems: string[] = [];
  if (TRANSPORT_METHOD_DEFINITIONS.length !== TRANSPORT_METHODS.length) problems.push(`Se esperaban exactamente ${TRANSPORT_METHODS.length} métodos activos.`);
  for (const method of TRANSPORT_METHODS) {
    if (!TRANSPORT_METHOD_DEFINITIONS_BY_METHOD.has(method)) problems.push(`Falta la definición del método ${method}.`);
  }
  for (const def of TRANSPORT_METHOD_DEFINITIONS) {
    if (def.minOperators < 1 || def.maxOperators < def.minOperators) problems.push(`Operadores inválidos en ${def.method}.`);
    if (!def.usesMeans && def.perPersonBaseKg <= 0) problems.push(`${def.method} no declara capacidad de porte por persona.`);
    if (!Object.values(def.surfaces).some((s) => s !== null)) problems.push(`${def.method} no es transitable en ninguna superficie.`);
  }
  return problems;
}
