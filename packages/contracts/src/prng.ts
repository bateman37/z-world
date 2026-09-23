import { z } from "zod";

/**
 * Estado serializable de un generador determinista mulberry32, identificado
 * por dominio (p. ej. "cohort", "fixture") para que añadir una tirada
 * futura en un dominio no altere la secuencia de otro (§7.3 de WEB-001).
 */
export const PRNG_ALGORITHM = "mulberry32" as const;
export const PRNG_ALGORITHM_VERSION = 1 as const;

export interface PrngStreamState {
  readonly algorithm: typeof PRNG_ALGORITHM;
  readonly algorithmVersion: typeof PRNG_ALGORITHM_VERSION;
  /** Estado interno de 32 bits sin signo. */
  readonly state: number;
}

export const prngStreamStateSchema = z.object({
  algorithm: z.literal(PRNG_ALGORITHM),
  algorithmVersion: z.literal(PRNG_ALGORITHM_VERSION),
  state: z.number().int().min(0).max(0xffffffff),
});

export type PrngDomain = "cohort" | "fixture" | "navigation" | "world" | "resolution";

/**
 * Forma exacta de WEB-001/S1: nunca se cambia, para que un snapshot V1 (o
 * el `prng` heredado de una migración V1→V2) siga validando exactamente
 * igual que antes de S2. Deliberadamente no es `Record<PrngDomain, ...>`:
 * `world` (S2) no existe en esta forma.
 */
export interface PrngStateByDomain {
  readonly cohort: PrngStreamState;
  readonly fixture: PrngStreamState;
  readonly navigation: PrngStreamState;
}

export const prngStateByDomainSchema = z.object({
  cohort: prngStreamStateSchema,
  fixture: prngStreamStateSchema,
  navigation: prngStreamStateSchema,
});

/**
 * Forma del PRNG por dominio para partidas V2 generadas por el generador
 * semántico real (S2 de WEB-002 §7.4): añade el stream `world`, dedicado a
 * la generación espacial/semántica, sin tocar el stream `fixture` legado
 * (reservado a la migración V1→V2, nunca usado por partidas nuevas).
 */
export const prngStateByDomainV2Schema = z.object({
  cohort: prngStreamStateSchema,
  fixture: prngStreamStateSchema,
  navigation: prngStreamStateSchema,
  world: prngStreamStateSchema,
  /** Stream dedicado a la variación B del motor de resolución (S4 de WEB-002 §12.6): independiente de `world`/`cohort` para que una comprobación incierta no altere la generación ni la cohorte. */
  resolution: prngStreamStateSchema,
});
export type PrngStateByDomainV2 = z.infer<typeof prngStateByDomainV2Schema>;
