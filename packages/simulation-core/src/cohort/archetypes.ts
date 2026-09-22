import type { CharacteristicId, SkillId } from "@z-world/contracts";

/**
 * Seis arquetipos de cobertura, uno por cada garantía colectiva obligatoria
 * de §10.4 de WEB-001. Cada partida asigna exactamente uno a cada
 * protagonista (tras barajar qué persona recibe cada arquetipo), lo que
 * hace la cobertura una garantía estructural, no probabilística. Ninguno
 * presupone pasado militar, policial ni dominio de armas de fuego.
 */
export interface CohortArchetype {
  readonly id: string;
  readonly coverageDomain:
    | "medicine_first_aid"
    | "trades_repair"
    | "survival_orientation"
    | "logistics_supply"
    | "care_social_cohesion"
    | "alertness_response";
  readonly professionKey: string;
  readonly hobbiesKey: string;
  readonly signatureSkills: readonly SkillId[];
  readonly biasedCharacteristics: readonly CharacteristicId[];
}

export const COHORT_ARCHETYPES: readonly CohortArchetype[] = [
  {
    id: "field_nurse",
    coverageDomain: "medicine_first_aid",
    professionKey: "profession.field_nurse",
    hobbiesKey: "hobbies.gardening",
    signatureSkills: ["medicine"],
    biasedCharacteristics: ["empathy", "technique"],
  },
  {
    id: "maintenance_electrician",
    coverageDomain: "trades_repair",
    professionKey: "profession.maintenance_electrician",
    hobbiesKey: "hobbies.tinkering",
    signatureSkills: ["electricity", "mechanics"],
    biasedCharacteristics: ["technique", "dexterity"],
  },
  {
    id: "mountain_guide",
    coverageDomain: "survival_orientation",
    professionKey: "profession.mountain_guide",
    hobbiesKey: "hobbies.hiking",
    signatureSkills: ["survival", "orientation"],
    biasedCharacteristics: ["endurance", "perception"],
  },
  {
    id: "delivery_driver",
    coverageDomain: "logistics_supply",
    professionKey: "profession.delivery_driver",
    hobbiesKey: "hobbies.cooking",
    signatureSkills: ["driving", "cooking"],
    biasedCharacteristics: ["technique", "endurance"],
  },
  {
    id: "primary_school_teacher",
    coverageDomain: "care_social_cohesion",
    professionKey: "profession.primary_school_teacher",
    hobbiesKey: "hobbies.reading",
    signatureSkills: ["teaching", "influence"],
    biasedCharacteristics: ["empathy", "charisma"],
  },
  {
    id: "park_ranger",
    coverageDomain: "alertness_response",
    professionKey: "profession.park_ranger",
    hobbiesKey: "hobbies.birdwatching",
    signatureSkills: ["alertness", "tracking"],
    biasedCharacteristics: ["perception", "agility"],
  },
];
