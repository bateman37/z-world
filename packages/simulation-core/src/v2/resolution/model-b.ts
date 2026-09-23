import type { PrngStream } from "../../prng.js";
import { bandForMargin, type OutcomeBand } from "@z-world/contracts";

/**
 * Variación B determinista (WEB-002 §5.6/§12.6, subhito S4): campana
 * centrada en 0, normal truncada conceptual con desviación orientativa
 * `1,15`, limitada a `[-4,+4]`. Box-Muller sobre el stream `resolution` del
 * PRNG mulberry32 (nunca `Math.random()`), muestreada una sola vez por
 * episodio y persistida — nunca remuestreada por pausa/velocidad/recarga.
 */
export function sampleVariationB(stream: PrngStream): number {
  const u1 = Math.max(stream.nextFloat(), 1e-12);
  const u2 = stream.nextFloat();
  const standardNormal = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  const raw = standardNormal * 1.15;
  return Math.max(-4, Math.min(4, raw));
}

export { bandForMargin, type OutcomeBand };
