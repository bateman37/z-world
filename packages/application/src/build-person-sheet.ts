import type { PersonSheetProjection, SimulationStateV1 } from "@z-world/contracts";

/**
 * Proyección detallada de una persona para la ficha (§16.3). Se construye
 * bajo demanda (no en cada tick) porque solo una persona suele estar
 * abierta a la vez; nunca incluye `hidden` (calibre oculto).
 */
export function buildPersonSheetProjection(state: SimulationStateV1, personId: string): PersonSheetProjection | null {
  const person = state.people[personId];
  if (!person) return null;
  const p = person.public;
  return {
    personId: p.id,
    firstName: p.firstName,
    lastName: p.lastName,
    ageYears: p.ageYears,
    biography: p.biography,
    characteristics: p.characteristics,
    skills: p.skills,
    potentialPhraseByCharacteristic: p.potentialPhraseByCharacteristic,
    potentialPhraseBySkill: p.potentialPhraseBySkill,
    priorities: p.priorities,
    relationships: p.relationships,
    sharedEventInterpretationKey: p.sharedEventInterpretationKey,
    possessions: p.possessions,
    arrivalCondition: p.arrivalCondition,
    operationalState: p.operationalState,
    lastBlockReasonKey: p.lastBlockReasonKey,
  };
}
