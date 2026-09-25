import type { MaterialQuantity } from "./building-exploitation.js";

/**
 * Cifras versionadas del entorno mutable inicial de S10 (`DEC-0020`,
 * WLD-010 §3.5-§3.7): limpieza de cobertura, carretera y barrera lineal.
 * Datos puros; la lógica vive en `packages/simulation-core/src/v2/terrain/`.
 * Todas las cifras son provisionales y quedan documentadas como calibración
 * técnica de S10, no como fórmula canónica cerrada (WLD-010 §8).
 */
export const TERRAIN_TRANSFORM_TUNING_VERSION = "s10-v1" as const;

export const TERRAIN_TRANSFORM_TUNING = {
  /** Despejar vegetación (matorral/bosque): minutos y madera recuperada por m² realmente trabajado. */
  clearVegetation: {
    minutesPerM2: 1.2,
    woodKgPerM2: 0.9,
  },
  /** Retirar escombros ligeros: minutos por m² y escombro recuperado (aprovechable como material de relleno/barrera, nunca como recurso mágico). */
  clearDebris: {
    minutesPerM2: 0.8,
    rubbleKgPerM2: 1.5,
  },
  /** Despejar un tramo de vía obstruido (WLD-010 §3.7): conserva la función viaria. */
  clearRoad: {
    minutesPerMeter: 0.6,
  },
  /** Retirar la función viaria de un tramo (irreversible en este alcance): más lento que despejarlo, deja terreno despejado. */
  removeWayFunction: {
    minutesPerMeter: 1.5,
  },
  /** Barrera lineal sencilla entre anclajes (WLD-010 §3.6): madera por metro y minutos de construcción por metro. */
  buildBarrier: {
    minutesPerMeter: 4,
    materialsPerMeter: [{ resourceFamily: "wood_and_planks", quantity: 3 }] as readonly MaterialQuantity[],
  },
} as const;
