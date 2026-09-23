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
      case "requires_transformation_profile": {
        const profileId = resolveTransformationProfileId(state, target, def.key);
        if (!profileId) return fail("block.no_transformation_profile");
        continue;
      }
      case "requires_concrete_materials":
        // Comprobado junto con `requires_transformation_profile` contra las
        // recetas versionadas (§15.5/CAT-005 §4.3: nunca una pila
        // universal `repair_materials`); la disponibilidad real de
        // materiales se resuelve en fase `prepare`, no aquí.
        continue;
      case "requires_irreversible_confirmation":
        continue; // comprobado aparte en `checkIrreversibleConfirmation` (depende de `Job.irreversibleConfirmed`, que no existe todavía al crear el trabajo).
      default: {
        const exhaustive: never = requirement.kind;
        throw new Error(`Requisito duro no reconocido: ${JSON.stringify(exhaustive)}`);
      }
    }
  }
  return ok;
}

/**
 * Perfil de reparación/desmontaje concreto declarado por el objeto o
 * mueble objetivo, según el método (§16.2/§16.3, S7). `null` si el
 * objetivo no tiene ese perfil: nunca se inventa una receta genérica.
 */
export function resolveTransformationProfileId(state: SimulationStateV2, target: JobTarget, actionKey: string): string | null {
  const entity = target.kind === "world_object" ? state.worldObjects[target.worldObjectId] : target.kind === "furniture" ? state.furniture[target.furnitureId] : null;
  if (!entity) return null;
  if (actionKey === "repair") return entity.repairProfileId;
  if (actionKey === "disassemble_selective" || actionKey === "disassemble_destructive") return entity.disassemblyProfileId;
  return null;
}

/** `Nunca` excluye tanto la selección automática como una orden directa silenciosa (§6.3/§11.7 del prompt S4-S6). */
export function priorityAllowsWork(value: PriorityValue): boolean {
  return value !== "never";
}
