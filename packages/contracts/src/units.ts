/**
 * Unidades canónicas del núcleo de simulación.
 *
 * - Espacio: metros (`Meters`), en punto flotante de doble precisión.
 * - Tiempo simulado: segundos simulados enteros (`SimSeconds`), nunca
 *   `Date` ni milisegundos reales.
 *
 * Estos alias documentan la unidad en la firma del tipo; no son "branded
 * types" para mantener la interoperabilidad simple con JSON/Zod en toda la
 * frontera de serialización (ver DEC-0014).
 */
export type Meters = number;

/** Segundos de tiempo simulado, siempre un entero no negativo. */
export type SimSeconds = number;

/** Un día de juego completo equivale a 20 minutos reales a velocidad ×1. */
export const REAL_SECONDS_PER_SIM_DAY_AT_1X = 20 * 60;

/** Segundos simulados que contiene un día de juego completo. */
export const SIM_SECONDS_PER_DAY = 24 * 60 * 60;

/**
 * Factor de conversión: cuántos segundos simulados avanzan por cada
 * segundo real transcurrido a velocidad ×1.
 */
export const SIM_SECONDS_PER_REAL_SECOND_AT_1X =
  SIM_SECONDS_PER_DAY / REAL_SECONDS_PER_SIM_DAY_AT_1X;
