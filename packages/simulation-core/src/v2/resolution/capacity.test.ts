import { describe, expect, it } from "vitest";
import type { PersonPublicFacts } from "@z-world/contracts";
import { computeEffectiveCapacity, isUniversalCapacity } from "./capacity.js";

function person(characteristics: Record<string, number>, skills: Record<string, number>): PersonPublicFacts {
  return { characteristics, skills } as unknown as PersonPublicFacts;
}

describe("computeEffectiveCapacity (WEB-002 §5.3/§12.3)", () => {
  it("una sola característica usa su valor directo", () => {
    const p = person({ perception: 7 }, {});
    expect(computeEffectiveCapacity(p, { characteristicIds: ["perception"], skillIds: [], profile: "balanced_50_50" })).toBe(7);
  });

  it("dos características usan la media aritmética", () => {
    const p = person({ perception: 6, technique: 4 }, {});
    expect(computeEffectiveCapacity(p, { characteristicIds: ["perception", "technique"], skillIds: [], profile: "balanced_50_50" })).toBe(5);
  });

  it("dos habilidades usan la media aritmética", () => {
    const p = person({}, { alertness: 8, tracking: 2 });
    expect(computeEffectiveCapacity(p, { characteristicIds: [], skillIds: ["alertness", "tracking"], profile: "balanced_50_50" })).toBe(5);
  });

  it("perfil físico 70/30", () => {
    const p = person({ strength: 10 }, { survival: 0 });
    expect(computeEffectiveCapacity(p, { characteristicIds: ["strength"], skillIds: ["survival"], profile: "physical_70_30" })).toBeCloseTo(7);
  });

  it("perfil equilibrado 50/50", () => {
    const p = person({ strength: 8 }, { survival: 4 });
    expect(computeEffectiveCapacity(p, { characteristicIds: ["strength"], skillIds: ["survival"], profile: "balanced_50_50" })).toBeCloseTo(6);
  });

  it("perfil técnico 30/70", () => {
    const p = person({ technique: 2 }, { mechanics: 9 });
    expect(computeEffectiveCapacity(p, { characteristicIds: ["technique"], skillIds: ["mechanics"], profile: "technical_30_70" })).toBeCloseTo(0.3 * 2 + 0.7 * 9);
  });

  it("el nivel 0 es una competencia real, no se descarta", () => {
    const p = person({ perception: 0 }, {});
    expect(computeEffectiveCapacity(p, { characteristicIds: ["perception"], skillIds: [], profile: "balanced_50_50" })).toBe(0);
  });

  it("sin características ni habilidades declaradas, la capacidad es universal (infinita)", () => {
    const p = person({}, {});
    const capacity = computeEffectiveCapacity(p, { characteristicIds: [], skillIds: [], profile: "balanced_50_50" });
    expect(isUniversalCapacity(capacity)).toBe(true);
  });
});
