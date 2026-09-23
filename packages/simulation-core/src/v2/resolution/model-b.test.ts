import { describe, expect, it } from "vitest";
import { bandForMargin } from "@z-world/contracts";
import { PrngStream } from "../../prng.js";
import { createPrngStreamState } from "../../prng.js";
import { sampleVariationB } from "./model-b.js";

describe("sampleVariationB (WEB-002 §5.6/§12.6)", () => {
  it("siempre queda acotada a [-4, 4]", () => {
    const stream = new PrngStream(createPrngStreamState("model-b-seed", "resolution"));
    for (let i = 0; i < 500; i++) {
      const v = sampleVariationB(stream);
      expect(v).toBeGreaterThanOrEqual(-4);
      expect(v).toBeLessThanOrEqual(4);
    }
  });

  it("es determinista: el mismo estado inicial produce la misma secuencia", () => {
    const a = new PrngStream(createPrngStreamState("model-b-seed-2", "resolution"));
    const b = new PrngStream(createPrngStreamState("model-b-seed-2", "resolution"));
    const sequenceA = Array.from({ length: 10 }, () => sampleVariationB(a));
    const sequenceB = Array.from({ length: 10 }, () => sampleVariationB(b));
    expect(sequenceA).toEqual(sequenceB);
  });

  it("distribución estructuralmente razonable: la mayoría de las muestras caen cerca de 0", () => {
    const stream = new PrngStream(createPrngStreamState("model-b-distribution", "resolution"));
    const samples = Array.from({ length: 2000 }, () => sampleVariationB(stream));
    const withinOneSigma = samples.filter((v) => Math.abs(v) <= 1.15).length / samples.length;
    // Para una normal, ~68% cae dentro de 1 desviación; con el truncado a
    // [-4,4] y n=2000 basta una banda amplia para evitar un test frágil.
    expect(withinOneSigma).toBeGreaterThan(0.55);
    expect(withinOneSigma).toBeLessThan(0.85);
  });
});

describe("bandForMargin (bandas exactas de §12.6)", () => {
  it.each([
    [3, "exceptional"],
    [10, "exceptional"],
    [2.999, "favorable"],
    [1, "favorable"],
    [0.999, "uncertain"],
    [-1, "uncertain"],
    [-1.001, "recoverable_poor"],
    [-2.999, "recoverable_poor"],
    [-3, "severe"],
    [-4, "severe"],
  ] as const)("margen %f → banda %s", (margin, expected) => {
    expect(bandForMargin(margin)).toBe(expected);
  });
});
