import { z } from "zod";

/**
 * Niebla de guerra espacial (visibilidad), separada de los estados de
 * conocimiento semántico de un lugar (WLD-002/CAT-004). Un edificio puede
 * ser `observable` como silueta y seguir sin inspeccionar.
 */
export const VISIBILITY_STATES = ["hidden", "known", "observable"] as const;
export type VisibilityState = (typeof VISIBILITY_STATES)[number];
export const visibilityStateSchema = z.enum(VISIBILITY_STATES);
