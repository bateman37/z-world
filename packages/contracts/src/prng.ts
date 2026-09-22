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

export type PrngDomain = "cohort" | "fixture" | "navigation";

export type PrngStateByDomain = Readonly<Record<PrngDomain, PrngStreamState>>;

export const prngStateByDomainSchema = z.object({
  cohort: prngStreamStateSchema,
  fixture: prngStreamStateSchema,
  navigation: prngStreamStateSchema,
});
