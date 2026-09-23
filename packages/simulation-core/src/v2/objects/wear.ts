import type { FunctionalState } from "@z-world/contracts";
import type { WearProfile } from "@z-world/catalogs";

/**
 * Desgaste determinista por uso (S7 §6.2/§6.10): la avería es causal
 * (número de usos × desgaste por uso del catálogo), nunca una tirada. La
 * condición y el estado funcional siguen siendo independientes: el
 * desgaste solo cambia el estado funcional al cruzar umbrales declarados.
 */
export interface WearableEntity {
  readonly condition: number;
  readonly functionalState: FunctionalState;
  readonly functions: readonly string[];
  readonly inactiveFunctionReasons: Readonly<Record<string, string>>;
}

export interface WearResult<T extends WearableEntity> {
  readonly entity: T;
  readonly brokeDown: boolean;
}

export const WEAR_BREAKDOWN_REASON = "worn_out";

export function applyUseWear<T extends WearableEntity>(entity: T, wear: WearProfile, uses = 1): WearResult<T> {
  const condition = Math.round(Math.max(0, entity.condition - wear.perUse * uses) * 10000) / 10000;
  const wasWorking = entity.functionalState === "functional" || entity.functionalState === "degraded";
  if (wasWorking && condition < wear.breakdownBelowCondition) {
    return {
      entity: {
        ...entity,
        condition,
        functionalState: "broken",
        functions: entity.functions.filter((fn) => fn !== wear.functionAffected),
        inactiveFunctionReasons: { ...entity.inactiveFunctionReasons, [wear.functionAffected]: WEAR_BREAKDOWN_REASON },
      },
      brokeDown: true,
    };
  }
  const functionalState: FunctionalState = entity.functionalState === "functional" && condition < 0.5 ? "degraded" : entity.functionalState;
  return { entity: { ...entity, condition, functionalState }, brokeDown: false };
}

/**
 * Motivos de función inactiva que una reparación con piezas concretas puede
 * resolver (S7 §6.8: "restaura solo función soportada"). Nunca incluye
 * `no_electricity` (el frigorífico sigue sin refrigerar tras repararse) ni
 * `disassembled` (una función perdida por desmontaje es permanente).
 */
export const REPAIRABLE_INACTIVE_REASONS: ReadonlySet<string> = new Set([WEAR_BREAKDOWN_REASON, "worn_seal", "broken_wheel", "damaged"]);
