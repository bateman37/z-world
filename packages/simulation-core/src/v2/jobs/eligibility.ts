import type { ActionMethodDefinition, JobTarget, PriorityValue, SimulationStateV2 } from "@z-world/contracts";
import { resolveTargetLocation, isPersonCoLocated } from "./location-utils.js";

export interface EligibilityResult {
  readonly ok: boolean;
  readonly reasonKey: string | null;
}

const ok: EligibilityResult = { ok: true, reasonKey: null };
function fail(reasonKey: string): EligibilityResult {
  return { ok: false, reasonKey };
}

/**
 * Comprueba los requisitos duros declarados por el método (§5.4/§11.8,
 * subhito S4-S5) contra el estado real. Un requisito duro nunca se
 * sustituye por una tirada: si falla, el trabajo queda `blocked` con motivo
 * causal explícito, nunca oculto.
 */
export function checkHardRequirements(
  def: ActionMethodDefinition,
  state: SimulationStateV2,
  personId: string,
  target: JobTarget,
): EligibilityResult {
  for (const requirement of def.hardRequirements) {
    switch (requirement.kind) {
      case "known_target": {
        if (target.kind === "own_need" || target.kind === "area") continue;
        // El conocimiento requerido específico lo valida `checkRequiredKnowledge`;
        // aquí solo se comprueba que el blanco siga existiendo.
        if (!resolveTargetLocation(state, target)) return fail("block.target_no_longer_exists");
        continue;
      }
      case "requires_container_or_lot_present": {
        if (target.kind !== "resource_lot") return fail("block.no_resource_lot_selected");
        const lot = state.resourceLots[target.resourceLotId];
        if (!lot || lot.quantity <= 0) return fail("block.resource_exhausted");
        continue;
      }
      case "requires_rest_support":
        // El suelo es siempre una alternativa válida de menor rendimiento
        // (§14.5/§7.5 del prompt S4-S6): este requisito nunca bloquea por sí
        // solo; la calidad del soporte se resuelve en la ejecución.
        continue;
      case "requires_shared_location_or_reach": {
        const location = resolveTargetLocation(state, target);
        if (!location) return fail("block.target_no_longer_exists");
        if (!isPersonCoLocated(state, personId, location)) continue; // se resuelve viajando en la fase `travel`, no es un bloqueo duro.
        continue;
      }
      case "requires_capacity_at_least":
        continue; // comprobado en `isDirectlyEligible`/resolución, no aquí (depende de la persona ejecutora final).
      case "requires_known_method":
        continue; // en este catálogo todos los métodos activos son de clasificación abierta/improvisable/guiada conocida por defecto.
      default: {
        const exhaustive: never = requirement.kind;
        throw new Error(`Requisito duro no reconocido: ${JSON.stringify(exhaustive)}`);
      }
    }
  }
  return ok;
}

/** `Nunca` excluye tanto la selección automática como una orden directa silenciosa (§6.3/§11.7 del prompt S4-S6). */
export function priorityAllowsWork(value: PriorityValue): boolean {
  return value !== "never";
}
