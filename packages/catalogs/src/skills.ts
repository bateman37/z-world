import { SKILL_IDS, type SkillId } from "@z-world/contracts";

export const SKILL_CATEGORIES = [
  "movement",
  "combat",
  "attention_exploration",
  "survival_nature",
  "construction_trades_resources",
  "technology",
  "transport",
  "production_supply",
  "health",
  "sciences",
  "social",
  "personal",
  "culture_expression",
] as const;
export type SkillCategory = (typeof SKILL_CATEGORIES)[number];

export interface SkillDefinition {
  readonly id: SkillId;
  readonly nameEs: string;
  readonly category: SkillCategory;
  readonly summaryEs: string;
}

/** Catálogo completo de 34 habilidades base (CHR-006 §3.3), datos versionados. */
export const SKILLS: readonly SkillDefinition[] = [
  { id: "climbing", nameEs: "Escalada", category: "movement", summaryEs: "Ascender, descender, usar apoyos, moverse por desniveles, usar cuerdas y equipo apropiado." },
  { id: "swimming", nameEs: "Natación", category: "movement", summaryEs: "Desenvolverse en el agua: cruzar cauces, rescatar personas, escapar, recuperar material sumergido." },
  { id: "marksmanship", nameEs: "Tiro", category: "combat", summaryEs: "Competencia con armas a distancia." },
  { id: "melee_combat", nameEs: "Combate cuerpo a cuerpo", category: "combat", summaryEs: "Competencia en lucha cercana." },
  { id: "alertness", nameEs: "Advertir", category: "attention_exploration", summaryEs: "Prestar atención, detectar amenazas y elementos relevantes del entorno." },
  { id: "tracking", nameEs: "Rastreo", category: "attention_exploration", summaryEs: "Leer y seguir señales de movimiento o presencia." },
  { id: "stealth", nameEs: "Sigilo", category: "attention_exploration", summaryEs: "Moverse sin ser detectado, reducir ruido, usar cobertura." },
  { id: "orientation", nameEs: "Orientación", category: "attention_exploration", summaryEs: "Situarse, guiarse y no perderse, independiente de Supervivencia." },
  { id: "survival", nameEs: "Supervivencia", category: "survival_nature", summaryEs: "Habilidad amplia y central de vida en el entorno natural." },
  { id: "foraging", nameEs: "Forrajeo", category: "survival_nature", summaryEs: "Localizar recursos útiles en el entorno natural." },
  { id: "fishing", nameEs: "Pesca", category: "survival_nature", summaryEs: "Experiencia práctica pescando: selección de lugar, lectura del agua, técnica." },
  { id: "animal_handling", nameEs: "Manejo de animales", category: "survival_nature", summaryEs: "Acercarse, manipular, cuidar y domesticar animales." },
  { id: "carpentry", nameEs: "Carpintería", category: "construction_trades_resources", summaryEs: "Trabajo con madera: estructuras, muebles, reparaciones." },
  { id: "construction", nameEs: "Obra", category: "construction_trades_resources", summaryEs: "Construcción general, sustituye la separación rígida entre albañilería y afines." },
  { id: "metalworking", nameEs: "Trabajo del metal", category: "construction_trades_resources", summaryEs: "Competencia general trabajando metales." },
  { id: "sewing", nameEs: "Confección", category: "construction_trades_resources", summaryEs: "Trabajo con materiales textiles: coser, remendar, adaptar." },
  { id: "excavation_extraction", nameEs: "Excavación y Extracción", category: "construction_trades_resources", summaryEs: "Excavar y extraer materiales del terreno." },
  { id: "mechanics", nameEs: "Mecánica", category: "technology", summaryEs: "Sistemas mecánicos: vehículos, motores, bombas." },
  { id: "electricity", nameEs: "Electricidad", category: "technology", summaryEs: "Corriente, cableado, instalaciones, cuadros eléctricos." },
  { id: "electronics", nameEs: "Electrónica", category: "technology", summaryEs: "Circuitos, placas, sensores, componentes, reparación." },
  { id: "systems_communications", nameEs: "Sistemas y Comunicaciones", category: "technology", summaryEs: "Informática y comunicaciones unificadas." },
  { id: "locksmithing", nameEs: "Cerrajería", category: "technology", summaryEs: "Cerraduras, mecanismos de cierre, apertura." },
  { id: "driving", nameEs: "Conducción", category: "transport", summaryEs: "Conducir vehículos (automóvil, furgoneta, camión, maquinaria)." },
  { id: "cooking", nameEs: "Cocina", category: "production_supply", summaryEs: "Preparación de alimentos y seguridad alimentaria." },
  { id: "agriculture", nameEs: "Agricultura", category: "production_supply", summaryEs: "Cultivos, suelo, siembra, cuidado, cosecha." },
  { id: "medicine", nameEs: "Medicina", category: "health", summaryEs: "Competencia sanitaria general, desde primeros auxilios hasta tratamiento avanzado." },
  { id: "sciences", nameEs: "Ciencias", category: "sciences", summaryEs: "Comprensión y aplicación de conocimiento científico relevante, no un saber universal." },
  { id: "influence", nameEs: "Influencia", category: "social", summaryEs: "Unifica persuasión y engaño: conducir la decisión de otra persona." },
  { id: "negotiation", nameEs: "Negociación", category: "social", summaryEs: "Encontrar acuerdos, equilibrar intereses, comercio." },
  { id: "leadership", nameEs: "Liderazgo", category: "social", summaryEs: "Dirigir, coordinar, organizar grupos, tomar decisiones colectivas." },
  { id: "teaching", nameEs: "Enseñanza", category: "social", summaryEs: "Explicar, demostrar, corregir, adaptar la formación." },
  { id: "intimidation", nameEs: "Intimidación", category: "social", summaryEs: "Influir mediante amenaza, presión o miedo." },
  { id: "self_control", nameEs: "Autocontrol", category: "personal", summaryEs: "Gestionar la propia respuesta ante miedo, presión o pérdida." },
  { id: "artistic_expression", nameEs: "Expresión artística", category: "culture_expression", summaryEs: "Capacidades creativas y expresivas." },
];

export const SKILLS_BY_ID: ReadonlyMap<SkillId, SkillDefinition> = new Map(
  SKILLS.map((s) => [s.id, s]),
);

if (SKILLS.length !== SKILL_IDS.length) {
  throw new Error(`Catálogo de habilidades incompleto: se esperaban ${SKILL_IDS.length}, hay ${SKILLS.length}.`);
}
