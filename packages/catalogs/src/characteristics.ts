import { CHARACTERISTIC_IDS, type CharacteristicId } from "@z-world/contracts";

/**
 * Las nueve características canónicas (CHR-006 §3.2). Los textos son datos
 * versionados de catálogo, no prosa libre del código.
 */
export interface CharacteristicDefinition {
  readonly id: CharacteristicId;
  readonly nameEs: string;
  readonly summaryEs: string;
}

export const CHARACTERISTICS: readonly CharacteristicDefinition[] = [
  { id: "strength", nameEs: "Fuerza", summaryEs: "Potencia física, ejercer fuerza, levantar/arrastrar/empujar, forcejeos, golpes, trabajos que exigen potencia." },
  { id: "endurance", nameEs: "Resistencia", summaryEs: "Capacidad de sostener esfuerzo, tolerancia a trabajo físico prolongado, recuperación ante actividad." },
  { id: "agility", nameEs: "Agilidad", summaryEs: "Movimiento corporal, equilibrio, coordinación global, cambios de posición." },
  { id: "dexterity", nameEs: "Destreza", summaryEs: "Precisión manual, control fino, coordinación de manos, manipulación delicada." },
  { id: "perception", nameEs: "Percepción", summaryEs: "Capacidad sensorial general (vista, oído, olfato, tacto y otras señales)." },
  { id: "technique", nameEs: "Técnica", summaryEs: "Aptitud general para trabajar con herramientas, seguir procedimientos prácticos y adaptarse a métodos de trabajo." },
  { id: "reasoning", nameEs: "Razonamiento", summaryEs: "Análisis, relación entre datos, inferencia, resolución de problemas, comprensión de situaciones nuevas." },
  { id: "charisma", nameEs: "Carisma", summaryEs: "Presencia personal, impacto, capacidad de hacerse escuchar y atraer atención." },
  { id: "empathy", nameEs: "Empatía", summaryEs: "Comprender a otras personas, leer emociones, interpretar intenciones, captar necesidades y tensiones sociales." },
];

export const CHARACTERISTICS_BY_ID: ReadonlyMap<CharacteristicId, CharacteristicDefinition> = new Map(
  CHARACTERISTICS.map((c) => [c.id, c]),
);

if (CHARACTERISTICS.length !== CHARACTERISTIC_IDS.length) {
  throw new Error(
    `Catálogo de características incompleto: se esperaban ${CHARACTERISTIC_IDS.length}, hay ${CHARACTERISTICS.length}.`,
  );
}
