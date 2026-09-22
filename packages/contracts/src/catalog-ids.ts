/**
 * IDs estables de catálogo (CHR-006, UI-003). Viven en `contracts` porque el
 * núcleo y la persistencia deben poder validar contra ellos sin depender del
 * paquete `catalogs` (que añade los datos de presentación en español).
 */

export const CHARACTERISTIC_IDS = [
  "strength",
  "endurance",
  "agility",
  "dexterity",
  "perception",
  "technique",
  "reasoning",
  "charisma",
  "empathy",
] as const;
export type CharacteristicId = (typeof CHARACTERISTIC_IDS)[number];

export const SKILL_IDS = [
  "climbing",
  "swimming",
  "marksmanship",
  "melee_combat",
  "alertness",
  "tracking",
  "stealth",
  "orientation",
  "survival",
  "foraging",
  "fishing",
  "animal_handling",
  "carpentry",
  "construction",
  "metalworking",
  "sewing",
  "excavation_extraction",
  "mechanics",
  "electricity",
  "electronics",
  "systems_communications",
  "locksmithing",
  "driving",
  "cooking",
  "agriculture",
  "medicine",
  "sciences",
  "influence",
  "negotiation",
  "leadership",
  "teaching",
  "intimidation",
  "self_control",
  "artistic_expression",
] as const;
export type SkillId = (typeof SKILL_IDS)[number];

export const PRIORITY_BLOCK_IDS = [
  "vital_response_care",
  "security_coexistence",
  "basic_supply",
  "exploration_recovery",
  "raw_materials",
  "food_production",
  "construction_infrastructure",
  "trades_logistics",
  "knowledge",
] as const;
export type PriorityBlockId = (typeof PRIORITY_BLOCK_IDS)[number];

export const PRIORITY_IDS = [
  "emergency_response",
  "medicine_priority",
  "rescue",
  "recovery_care",
  "hygiene_sanitation",
  "watch_patrol",
  "combat_threat_clearance",
  "prisoner_management",
  "community_diplomacy",
  "water_supply",
  "foraging_priority",
  "hunting",
  "fishing_priority",
  "scavenge_recovery",
  "exploration_expeditions",
  "dismantling_recycling",
  "logging",
  "extraction",
  "agriculture_priority",
  "animal_husbandry",
  "cooking_preservation",
  "construction_fortification",
  "repair",
  "maintenance",
  "carpentry_priority",
  "metalworking_priority",
  "mechanics_priority",
  "electrical_electronics",
  "textiles",
  "logistics",
  "knowledge_cataloguing",
  "study_interpretation",
  "experimentation_tinkering",
  "teaching_transmission",
] as const;
export type PriorityId = (typeof PRIORITY_IDS)[number];
