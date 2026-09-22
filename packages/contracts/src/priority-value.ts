import { z } from "zod";

/**
 * Valor de una prioridad de trabajo: `Nunca` o un nivel `1` (máxima) a `5`
 * (mínima). No asigna trabajo por sí solo (UI-003 §3.9).
 */
export const NEVER_PRIORITY = "never" as const;
export type PriorityValue = typeof NEVER_PRIORITY | 1 | 2 | 3 | 4 | 5;

export const priorityValueSchema = z.union([
  z.literal(NEVER_PRIORITY),
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
]);
