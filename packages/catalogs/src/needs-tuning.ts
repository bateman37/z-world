import type { NeedDimension } from "@z-world/contracts";

/**
 * Tuning provisional de necesidades causales (WEB-002 §14.6, subhito S6).
 * Valores jugables elegidos para observar cambios durante una sesión sin
 * convertir las primeras horas en una cuenta atrás absurda, medidos a `×1`
 * y `×10` (ver `DEC-0018`). No es balance canónico definitivo.
 */
export interface NeedsTuning {
  /** Descenso pasivo por minuto simulado, aplicado siempre que la persona existe. */
  readonly passiveDeclinePerSimMinute: Readonly<Record<NeedDimension, number>>;
  /** Coste adicional por minuto de trabajo activo en fase `execute` (evita doble contabilización: sustituye, no se suma, al pasivo durante esa fase). */
  readonly workDeclinePerSimMinute: Readonly<Record<NeedDimension, number>>;
  /** Coste adicional por metro desplazado (fase `travel`/movimiento libre). */
  readonly movementDeclinePerMeter: Readonly<Record<NeedDimension, number>>;
  /** Multiplicador adicional de coste cuando el ritmo es `fast`. */
  readonly fastPaceExtraMultiplier: number;
  /** Recuperación de hidratación por litro bebido. */
  readonly hydrationRecoveryPerLiter: number;
  /** Recuperación de nutrición por porción comida. */
  readonly nutritionRecoveryPerPortion: number;
  /** Recuperación de descanso por minuto descansado, soporte de referencia (cama/colchón). */
  readonly restRecoveryPerMinuteBySupport: Readonly<Record<"bed" | "conditioned_zone" | "ground", number>>;
}

export const NEEDS_TUNING: NeedsTuning = {
  passiveDeclinePerSimMinute: {
    hydration: 0.12,
    nutrition: 0.07,
    rest: 0.05,
  },
  workDeclinePerSimMinute: {
    hydration: 0.22,
    nutrition: 0.12,
    rest: 0.2,
  },
  movementDeclinePerMeter: {
    hydration: 0.004,
    nutrition: 0.0015,
    rest: 0.003,
  },
  fastPaceExtraMultiplier: 1.3,
  hydrationRecoveryPerLiter: 18,
  nutritionRecoveryPerPortion: 30,
  restRecoveryPerMinuteBySupport: {
    bed: 100 / 240,
    conditioned_zone: 100 / 300,
    ground: 100 / 420,
  },
};
