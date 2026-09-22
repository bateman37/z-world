import { CHARACTERISTIC_IDS, PRIORITY_BLOCK_IDS, PRIORITY_IDS, SKILL_IDS } from "@z-world/contracts";
import { CHARACTERISTICS } from "./characteristics.js";
import { SKILLS } from "./skills.js";
import { PRIORITIES, PRIORITY_BLOCKS } from "./priorities.js";

export interface CatalogIntegrityReport {
  readonly ok: boolean;
  readonly problems: readonly string[];
}

function findDuplicates(ids: readonly string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) duplicates.add(id);
    seen.add(id);
  }
  return [...duplicates];
}

/** Valida conteos exactos e IDs sin duplicados en todo el catálogo. */
export function validateCatalogIntegrity(): CatalogIntegrityReport {
  const problems: string[] = [];

  if (CHARACTERISTICS.length !== 9) {
    problems.push(`Se esperaban 9 características, hay ${CHARACTERISTICS.length}.`);
  }
  if (SKILLS.length !== 34) {
    problems.push(`Se esperaban 34 habilidades, hay ${SKILLS.length}.`);
  }
  if (PRIORITIES.length !== 34) {
    problems.push(`Se esperaban 34 prioridades, hay ${PRIORITIES.length}.`);
  }
  if (PRIORITY_BLOCKS.length !== 9) {
    problems.push(`Se esperaban 9 bloques de prioridad, hay ${PRIORITY_BLOCKS.length}.`);
  }

  const dupCharacteristics = findDuplicates(CHARACTERISTICS.map((c) => c.id));
  if (dupCharacteristics.length > 0) problems.push(`Características duplicadas: ${dupCharacteristics.join(", ")}.`);

  const dupSkills = findDuplicates(SKILLS.map((s) => s.id));
  if (dupSkills.length > 0) problems.push(`Habilidades duplicadas: ${dupSkills.join(", ")}.`);

  const dupPriorities = findDuplicates(PRIORITIES.map((p) => p.id));
  if (dupPriorities.length > 0) problems.push(`Prioridades duplicadas: ${dupPriorities.join(", ")}.`);

  const knownCharacteristicIds = new Set<string>(CHARACTERISTIC_IDS);
  for (const c of CHARACTERISTICS) {
    if (!knownCharacteristicIds.has(c.id)) problems.push(`Característica con ID no declarado en contracts: ${c.id}.`);
  }
  const knownSkillIds = new Set<string>(SKILL_IDS);
  for (const s of SKILLS) {
    if (!knownSkillIds.has(s.id)) problems.push(`Habilidad con ID no declarado en contracts: ${s.id}.`);
  }
  const knownPriorityIds = new Set<string>(PRIORITY_IDS);
  for (const p of PRIORITIES) {
    if (!knownPriorityIds.has(p.id)) problems.push(`Prioridad con ID no declarado en contracts: ${p.id}.`);
  }
  const knownBlockIds = new Set<string>(PRIORITY_BLOCK_IDS);
  for (const p of PRIORITIES) {
    if (!knownBlockIds.has(p.blockId)) problems.push(`Prioridad con bloque roto: ${p.id} -> ${p.blockId}.`);
  }

  return { ok: problems.length === 0, problems };
}
