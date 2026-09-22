import { PRIORITY_BLOCK_IDS, PRIORITY_IDS, type PriorityBlockId, type PriorityId } from "@z-world/contracts";

export interface PriorityBlockDefinition {
  readonly id: PriorityBlockId;
  readonly nameEs: string;
  readonly order: number;
}

export const PRIORITY_BLOCKS: readonly PriorityBlockDefinition[] = [
  { id: "vital_response_care", nameEs: "Respuesta vital y cuidados", order: 1 },
  { id: "security_coexistence", nameEs: "Seguridad y convivencia", order: 2 },
  { id: "basic_supply", nameEs: "Abastecimiento básico", order: 3 },
  { id: "exploration_recovery", nameEs: "Exploración y recuperación", order: 4 },
  { id: "raw_materials", nameEs: "Materias primas", order: 5 },
  { id: "food_production", nameEs: "Producción alimentaria", order: 6 },
  { id: "construction_infrastructure", nameEs: "Construcción e infraestructura", order: 7 },
  { id: "trades_logistics", nameEs: "Oficios y logística", order: 8 },
  { id: "knowledge", nameEs: "Conocimiento", order: 9 },
];

export interface PriorityDefinition {
  readonly id: PriorityId;
  readonly nameEs: string;
  readonly blockId: PriorityBlockId;
  readonly order: number;
}

/** 34 prioridades exactas en sus nueve bloques (UI-003 §3.3), `approved`. */
export const PRIORITIES: readonly PriorityDefinition[] = [
  { id: "emergency_response", nameEs: "Emergencias", blockId: "vital_response_care", order: 1 },
  { id: "medicine_priority", nameEs: "Medicina", blockId: "vital_response_care", order: 2 },
  { id: "rescue", nameEs: "Rescate", blockId: "vital_response_care", order: 3 },
  { id: "recovery_care", nameEs: "Recuperación y cuidados", blockId: "vital_response_care", order: 4 },
  { id: "hygiene_sanitation", nameEs: "Higiene y saneamiento", blockId: "vital_response_care", order: 5 },
  { id: "watch_patrol", nameEs: "Vigilancia y patrulla", blockId: "security_coexistence", order: 6 },
  { id: "combat_threat_clearance", nameEs: "Combate y limpieza de amenazas", blockId: "security_coexistence", order: 7 },
  { id: "prisoner_management", nameEs: "Prisioneros", blockId: "security_coexistence", order: 8 },
  { id: "community_diplomacy", nameEs: "Comunidad y diplomacia", blockId: "security_coexistence", order: 9 },
  { id: "water_supply", nameEs: "Agua", blockId: "basic_supply", order: 10 },
  { id: "foraging_priority", nameEs: "Recolección", blockId: "basic_supply", order: 11 },
  { id: "hunting", nameEs: "Caza", blockId: "basic_supply", order: 12 },
  { id: "fishing_priority", nameEs: "Pesca", blockId: "basic_supply", order: 13 },
  { id: "scavenge_recovery", nameEs: "Saqueo y recuperación", blockId: "exploration_recovery", order: 14 },
  { id: "exploration_expeditions", nameEs: "Exploración y expediciones", blockId: "exploration_recovery", order: 15 },
  { id: "dismantling_recycling", nameEs: "Desmontaje y reciclaje", blockId: "exploration_recovery", order: 16 },
  { id: "logging", nameEs: "Tala", blockId: "raw_materials", order: 17 },
  { id: "extraction", nameEs: "Extracción", blockId: "raw_materials", order: 18 },
  { id: "agriculture_priority", nameEs: "Agricultura", blockId: "food_production", order: 19 },
  { id: "animal_husbandry", nameEs: "Ganadería", blockId: "food_production", order: 20 },
  { id: "cooking_preservation", nameEs: "Cocina y conservación", blockId: "food_production", order: 21 },
  { id: "construction_fortification", nameEs: "Construcción y fortificación", blockId: "construction_infrastructure", order: 22 },
  { id: "repair", nameEs: "Reparación", blockId: "construction_infrastructure", order: 23 },
  { id: "maintenance", nameEs: "Mantenimiento", blockId: "construction_infrastructure", order: 24 },
  { id: "carpentry_priority", nameEs: "Carpintería", blockId: "trades_logistics", order: 25 },
  { id: "metalworking_priority", nameEs: "Metalurgia", blockId: "trades_logistics", order: 26 },
  { id: "mechanics_priority", nameEs: "Mecánica", blockId: "trades_logistics", order: 27 },
  { id: "electrical_electronics", nameEs: "Electricidad y electrónica", blockId: "trades_logistics", order: 28 },
  { id: "textiles", nameEs: "Textil", blockId: "trades_logistics", order: 29 },
  { id: "logistics", nameEs: "Logística", blockId: "trades_logistics", order: 30 },
  { id: "knowledge_cataloguing", nameEs: "Catalogar conocimiento", blockId: "knowledge", order: 31 },
  { id: "study_interpretation", nameEs: "Estudiar e interpretar", blockId: "knowledge", order: 32 },
  { id: "experimentation_tinkering", nameEs: "Experimentar, aplicar y cacharrear", blockId: "knowledge", order: 33 },
  { id: "teaching_transmission", nameEs: "Enseñar y transmitir", blockId: "knowledge", order: 34 },
];

export const PRIORITIES_BY_ID: ReadonlyMap<PriorityId, PriorityDefinition> = new Map(
  PRIORITIES.map((p) => [p.id, p]),
);

if (PRIORITIES.length !== PRIORITY_IDS.length) {
  throw new Error(`Catálogo de prioridades incompleto: se esperaban ${PRIORITY_IDS.length}, hay ${PRIORITIES.length}.`);
}
if (PRIORITY_BLOCKS.length !== PRIORITY_BLOCK_IDS.length) {
  throw new Error(`Catálogo de bloques incompleto: se esperaban ${PRIORITY_BLOCK_IDS.length}, hay ${PRIORITY_BLOCKS.length}.`);
}
