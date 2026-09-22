import { POTENTIAL_PHRASE_KEYS, type PotentialPhraseKey } from "@z-world/contracts";

/**
 * Catálogo cerrado de frases cualitativas de potencial (CHR-007 §3.9), sin
 * cifras. En WEB-001 solo se usa `insufficient_evidence`; el resto queda
 * preparado como datos versionados para cuando existan evidencias.
 */
export const POTENTIAL_PHRASES: Readonly<Record<PotentialPhraseKey, string>> = {
  insufficient_evidence: "Todavía no conocemos bien sus posibilidades en este ámbito.",
  can_improve_enormously: "Puede mejorar muchísimo en este ámbito.",
  much_room: "Tiene mucho margen de mejora en este ámbito.",
  notable_room: "Tiene un margen notable de mejora en este ámbito.",
  moderate_room: "Tiene un margen moderado de mejora en este ámbito.",
  levelling_off: "Su evolución en este ámbito se está estabilizando.",
  near_maximum: "Está cerca de su máximo en este ámbito.",
  almost_fully_developed: "Tiene prácticamente todo desarrollado en este ámbito.",
};

if (Object.keys(POTENTIAL_PHRASES).length !== POTENTIAL_PHRASE_KEYS.length) {
  throw new Error("Catálogo de frases de potencial incompleto.");
}
