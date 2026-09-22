import { describe, expect, it } from "vitest";
import { validateCatalogIntegrity } from "./validate.js";
import { CHARACTERISTICS } from "./characteristics.js";
import { SKILLS } from "./skills.js";
import { PRIORITIES, PRIORITY_BLOCKS } from "./priorities.js";

describe("integridad de catálogo", () => {
  it("no reporta problemas", () => {
    const report = validateCatalogIntegrity();
    expect(report.problems).toEqual([]);
    expect(report.ok).toBe(true);
  });

  it("tiene exactamente nueve características", () => {
    expect(CHARACTERISTICS).toHaveLength(9);
  });

  it("tiene exactamente 34 habilidades", () => {
    expect(SKILLS).toHaveLength(34);
  });

  it("tiene exactamente 34 prioridades en nueve bloques", () => {
    expect(PRIORITIES).toHaveLength(34);
    expect(PRIORITY_BLOCKS).toHaveLength(9);
  });

  it("no tiene IDs de habilidad duplicados", () => {
    const ids = SKILLS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("no tiene IDs de prioridad duplicados", () => {
    const ids = PRIORITIES.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
