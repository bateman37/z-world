import { describe, expect, it } from "vitest";
import { ARRIVAL_ELAPSED_SIM_SECONDS } from "@z-world/contracts";
import { createInitialState } from "./create-initial-state.js";
import { COHORT_SIZE } from "./cohort/generate.js";

describe("createInitialState", () => {
  it("produce exactamente seis protagonistas", () => {
    const state = createInitialState("test-seed-1");
    expect(state.peopleOrder).toHaveLength(COHORT_SIZE);
    expect(Object.keys(state.people)).toHaveLength(COHORT_SIZE);
  });

  it("arranca el reloj en Día 1, 17:30, en pausa", () => {
    const state = createInitialState("test-seed-1");
    expect(state.clock.elapsedSimSeconds).toBe(ARRIVAL_ELAPSED_SIM_SECONDS);
    expect(state.clock.speed).toBe(0);
  });

  it("es determinista: misma semilla produce el mismo estado inicial", () => {
    const a = createInitialState("determinism-seed");
    const b = createInitialState("determinism-seed");
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it("distinta semilla produce variación válida", () => {
    const a = createInitialState("seed-a");
    const b = createInitialState("seed-b");
    expect(JSON.stringify(a)).not.toBe(JSON.stringify(b));
    expect(a.peopleOrder).toHaveLength(COHORT_SIZE);
    expect(b.peopleOrder).toHaveLength(COHORT_SIZE);
  });

  it("cumple la distribución oculta de calibre 5/4+/4+/3+/3+/3+", () => {
    const state = createInitialState("caliber-seed");
    const tiers = Object.values(state.people)
      .map((p) => p.hidden.caliberTier)
      .sort((a, b) => b - a);
    expect(tiers[0]).toBe(5);
    expect(tiers[1]).toBeGreaterThanOrEqual(4);
    expect(tiers[2]).toBeGreaterThanOrEqual(4);
    expect(tiers[3]).toBeGreaterThanOrEqual(3);
    expect(tiers[4]).toBeGreaterThanOrEqual(3);
    expect(tiers[5]).toBeGreaterThanOrEqual(3);
  });

  it("cada persona tiene nueve características y 34 habilidades", () => {
    const state = createInitialState("catalog-seed");
    for (const person of Object.values(state.people)) {
      expect(Object.keys(person.public.characteristics)).toHaveLength(9);
      expect(Object.keys(person.public.skills)).toHaveLength(34);
      expect(Object.keys(person.public.priorities)).toHaveLength(34);
    }
  });

  it("todos los IDs de persona son únicos", () => {
    const state = createInitialState("unique-seed");
    const ids = Object.keys(state.people);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("la cobertura colectiva mínima está garantizada estructuralmente", () => {
    const state = createInitialState("coverage-seed");
    const allSkillLevels = Object.values(state.people).flatMap((p) => Object.entries(p.public.skills));
    const hasLevelAtLeast = (skillId: string, min: number) =>
      allSkillLevels.some(([id, level]) => id === skillId && level >= min);

    expect(hasLevelAtLeast("medicine", 4)).toBe(true);
    expect(hasLevelAtLeast("electricity", 4) || hasLevelAtLeast("mechanics", 4)).toBe(true);
    expect(hasLevelAtLeast("survival", 4) || hasLevelAtLeast("orientation", 4)).toBe(true);
    expect(hasLevelAtLeast("driving", 4) || hasLevelAtLeast("cooking", 4)).toBe(true);
    expect(hasLevelAtLeast("teaching", 4) || hasLevelAtLeast("influence", 4)).toBe(true);
    expect(hasLevelAtLeast("alertness", 4) || hasLevelAtLeast("tracking", 4)).toBe(true);
  });

  it("no expone calibre en ninguna clave pública", () => {
    const state = createInitialState("hidden-seed");
    for (const person of Object.values(state.people)) {
      expect(JSON.stringify(person.public)).not.toContain("caliberTier");
    }
  });

  it("no usa Math.random en ningún punto de la generación (comprobación indirecta por determinismo)", () => {
    const a = createInitialState("no-random-seed");
    const b = createInitialState("no-random-seed");
    expect(a).toEqual(b);
  });

  it("la red de relaciones cumple las condiciones mínimas de SCN-002", () => {
    const state = createInitialState("relationships-seed");
    const people = Object.values(state.people);
    for (const person of people) {
      expect(person.public.relationships.length).toBeGreaterThan(0);
    }
    const kinds = people.flatMap((p) => p.public.relationships.map((r) => r.kind));
    expect(kinds).toContain("prior_bond");
    expect(kinds).toContain("forged_during_crisis");
    expect(kinds).toContain("strained_by_recent_decision");
    expect(kinds).toContain("recently_joined_low_trust");
    expect(kinds).toContain("vouches_for_newcomer");
    const priorBondCount = kinds.filter((k) => k === "prior_bond").length;
    // Cada par cuenta dos veces (una entrada por persona), así que dos
    // pares con relación previa son cuatro entradas.
    expect(priorBondCount).toBeGreaterThanOrEqual(4);
  });

  it("mantiene todas las garantías estructurales en 50 semillas distintas", () => {
    for (let i = 0; i < 50; i++) {
      const state = createInitialState(`robustness-seed-${i}`);
      const people = Object.values(state.people);

      expect(people).toHaveLength(COHORT_SIZE);

      const tiers = people.map((p) => p.hidden.caliberTier).sort((a, b) => b - a);
      expect(tiers[0]).toBe(5);
      expect(tiers.filter((t) => t >= 4).length).toBeGreaterThanOrEqual(3);
      expect(tiers.filter((t) => t >= 3).length).toBe(6);

      const allSkillLevels = people.flatMap((p) => Object.entries(p.public.skills));
      const hasLevelAtLeast = (skillId: string, min: number) =>
        allSkillLevels.some(([id, level]) => id === skillId && level >= min);
      for (const [a, b] of [
        ["medicine", null],
        ["electricity", "mechanics"],
        ["survival", "orientation"],
        ["driving", "cooking"],
        ["teaching", "influence"],
        ["alertness", "tracking"],
      ] as const) {
        expect(hasLevelAtLeast(a, 4) || (b ? hasLevelAtLeast(b, 4) : false)).toBe(true);
      }

      const outstandingSkillCount = people.filter((p) => Object.values(p.public.skills).some((l) => l >= 8)).length;
      expect(outstandingSkillCount).toBeLessThanOrEqual(2);
      const noStandoutCount = people.filter((p) => Object.values(p.public.skills).every((l) => l <= 5)).length;
      expect(noStandoutCount).toBeGreaterThanOrEqual(2);

      const ids = people.map((p) => p.public.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
});
