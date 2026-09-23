import type { ActionMethodDefinition, PersonPublicFacts } from "@z-world/contracts";

/**
 * Capacidad efectiva exacta (WEB-002 §5.3/§12.3, subhito S4). `0` es
 * competencia real, nunca un valor desconocido: no se sustituye ni se
 * elige oportunistamente el más alto de la ficha.
 */
export function computeEffectiveCapacity(
  person: PersonPublicFacts,
  def: Pick<ActionMethodDefinition, "characteristicIds" | "skillIds" | "profile">,
): number {
  const characteristicValue =
    def.characteristicIds.length === 0
      ? null
      : def.characteristicIds.reduce((sum, id) => sum + (person.characteristics[id] ?? 0), 0) / def.characteristicIds.length;
  const skillValue = def.skillIds.length === 0 ? null : def.skillIds.reduce((sum, id) => sum + (person.skills[id] ?? 0), 0) / def.skillIds.length;

  if (characteristicValue === null && skillValue === null) {
    // Método universal sin gating de capacidad declarado (p. ej. beber,
    // comer): cualquier persona puede intentarlo; la dificultad/requisitos
    // duros siguen aplicando por separado.
    return Number.POSITIVE_INFINITY;
  }
  if (characteristicValue === null) return skillValue as number;
  if (skillValue === null) return characteristicValue;

  switch (def.profile) {
    case "physical_70_30":
      return 0.7 * characteristicValue + 0.3 * skillValue;
    case "balanced_50_50":
      return 0.5 * characteristicValue + 0.5 * skillValue;
    case "technical_30_70":
      return 0.3 * characteristicValue + 0.7 * skillValue;
    default: {
      const exhaustive: never = def.profile;
      throw new Error(`Perfil de capacidad no reconocido: ${JSON.stringify(exhaustive)}`);
    }
  }
}

/** Un método sin características ni habilidades declaradas no exige el margen `+3` de la ejecución directa (§12.4): su capacidad es universal por diseño. */
export function isUniversalCapacity(capacityEffective: number): boolean {
  return !Number.isFinite(capacityEffective);
}
