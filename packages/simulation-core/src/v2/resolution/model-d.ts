import type { PrngStream } from "../../prng.js";

/**
 * Variación determinista de hasta `±8 %` del modelo D (WEB-002 §5.5/§12.5,
 * subhito S4): muestra única y persistente por fase/sesión significativa
 * (aquí, por trabajo), nunca remuestreada por pausa, velocidad, guardado o
 * reanudación.
 */
export function sampleVariationD(stream: PrngStream): number {
  return (stream.nextFloat() * 2 - 1) * 0.08;
}
