import { z } from "zod";

/** Necesidades básicas mínimas de WEB-002 §6.3/§14. Forma esquelética (S1); evolución causal real en S6. */

export const NEED_DIMENSIONS = ["hydration", "nutrition", "rest"] as const;
export type NeedDimension = (typeof NEED_DIMENSIONS)[number];

export const NEED_BANDS = ["stable", "in_need", "urgent", "critical"] as const;
export type NeedBand = (typeof NEED_BANDS)[number];

export interface NeedState {
  readonly dimension: NeedDimension;
  /** Valor interno persistente, escala 0 (agotado) a 100 (pleno). */
  readonly value: number;
  readonly band: NeedBand;
}

export const needStateSchema = z.object({
  dimension: z.enum(NEED_DIMENSIONS),
  value: z.number().min(0).max(100),
  band: z.enum(NEED_BANDS),
});

export function needBandFor(value: number): NeedBand {
  if (value >= 50) return "stable";
  if (value >= 25) return "in_need";
  if (value >= 10) return "urgent";
  return "critical";
}
