import type { NeedDimension, NeedState, PaceMode } from "@z-world/contracts";
import { needBandFor } from "@z-world/contracts";
import { NEEDS_TUNING } from "@z-world/catalogs";

/**
 * Evolución causal de necesidades (WEB-002 §14.3/§14.6, subhito S6). Tuning
 * centralizado en `packages/catalogs/src/needs-tuning.ts`; aquí solo vive
 * la aplicación determinista. Evita doble contabilización: el coste de
 * trabajo *sustituye* al pasivo durante la fase `execute` de un trabajo
 * activo, nunca se suman ambos (§14.3).
 */

export type NeedActivity = "idle" | "moving" | "working";

function clamp(value: number): number {
  return Math.max(0, Math.min(100, value));
}

export function withValue(need: NeedState, nextValue: number): NeedState {
  const value = clamp(nextValue);
  return { ...need, value, band: needBandFor(value) };
}

/** Aplica el descenso pasivo/por actividad de un tramo de tiempo simulado ya transcurrido. */
export function declineNeedsForElapsedSimMinutes(
  needs: readonly NeedState[],
  elapsedSimMinutes: number,
  activity: NeedActivity,
  pace: PaceMode,
): readonly NeedState[] {
  if (elapsedSimMinutes <= 0) return needs;
  const rates = activity === "working" ? NEEDS_TUNING.workDeclinePerSimMinute : NEEDS_TUNING.passiveDeclinePerSimMinute;
  const paceMultiplier = activity === "working" && pace === "fast" ? NEEDS_TUNING.fastPaceExtraMultiplier : 1;
  return needs.map((need) => withValue(need, need.value - rates[need.dimension] * elapsedSimMinutes * paceMultiplier));
}

/** Coste adicional por desplazamiento libre (fuera de una fase `execute`), en metros recorridos (§14.3). */
export function declineNeedsForMovement(needs: readonly NeedState[], metersMoved: number): readonly NeedState[] {
  if (metersMoved <= 0) return needs;
  return needs.map((need) => withValue(need, need.value - NEEDS_TUNING.movementDeclinePerMeter[need.dimension] * metersMoved));
}

export function applyHydrationRecovery(needs: readonly NeedState[], liters: number): readonly NeedState[] {
  return needs.map((need) => (need.dimension === "hydration" ? withValue(need, need.value + liters * NEEDS_TUNING.hydrationRecoveryPerLiter) : need));
}

export function applyNutritionRecovery(needs: readonly NeedState[], portions: number): readonly NeedState[] {
  return needs.map((need) => (need.dimension === "nutrition" ? withValue(need, need.value + portions * NEEDS_TUNING.nutritionRecoveryPerPortion) : need));
}

export type RestSupportTier = "bed" | "conditioned_zone" | "ground";

export function applyRestRecovery(needs: readonly NeedState[], minutes: number, supportTier: RestSupportTier): readonly NeedState[] {
  if (minutes <= 0) return needs;
  const rate = NEEDS_TUNING.restRecoveryPerMinuteBySupport[supportTier];
  return needs.map((need) => (need.dimension === "rest" ? withValue(need, need.value + minutes * rate) : need));
}

export function needOf(needs: readonly NeedState[], dimension: NeedDimension): NeedState {
  const found = needs.find((n) => n.dimension === dimension);
  if (!found) throw new Error(`La persona no tiene la dimensión de necesidad ${dimension}.`);
  return found;
}
