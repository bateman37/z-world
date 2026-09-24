import type { ResourceFamily } from "@z-world/contracts";

/**
 * Tuning versionado del deterioro explicable de S7 (WEB-002 §6.6 del
 * prompt S7-S9). Solo el alimento fresco se deteriora en este recorte; no
 * se abre ningún simulador químico, térmico ni sanitario.
 *
 * Fórmula (determinista, sin azar, función cerrada del tiempo simulado):
 *
 *   Δh = max(0, (tAhora − decayStartedAtSimSeconds) / 3600)
 *   condición(Δh) = conditionAtDecayStart × max(0, 1 − Δh / shelfLifeSimHours)
 *
 * redondeada a 4 decimales. Al ser una función del instante absoluto y no
 * una resta acumulada por tick, pausar, cambiar de velocidad, avanzar en
 * pasos grandes o pequeños, o guardar y recargar producen exactamente la
 * misma condición: no hay doble contabilización posible.
 *
 * El frigorífico no refrigera sin electricidad (y la electricidad no existe
 * en este recorte): guardar alimento fresco dentro de él no aplica ningún
 * multiplicador; `refrigeratedShelfLifeMultiplier` queda declarado pero
 * inactivo hasta que exista una fuente eléctrica real.
 */
export interface DecayTuning {
  readonly family: ResourceFamily;
  readonly version: number;
  readonly shelfLifeSimHours: number;
  /** Por debajo: «empezando a deteriorarse» (aún consumible). */
  readonly deterioratingBelowCondition: number;
  /** Por debajo: «echado a perder» (no consumible, nunca se presenta como utilizable). */
  readonly spoiledBelowCondition: number;
  readonly refrigeratedShelfLifeMultiplier: number;
}

export const DECAY_TUNINGS: readonly DecayTuning[] = [
  {
    family: "fresh_food",
    version: 1,
    shelfLifeSimHours: 72,
    deterioratingBelowCondition: 0.6,
    spoiledBelowCondition: 0.25,
    refrigeratedShelfLifeMultiplier: 3,
  },
];

export const DECAY_TUNING_BY_FAMILY: ReadonlyMap<ResourceFamily, DecayTuning> = new Map(DECAY_TUNINGS.map((t) => [t.family, t]));
