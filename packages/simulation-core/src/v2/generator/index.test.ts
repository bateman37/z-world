import { describe, expect, it } from "vitest";
import { createPrngStateByDomainV2, PrngStream } from "../../prng.js";
import { createInitialStateV2 } from "../create-initial-state-v2.js";
import { DEFAULT_VILLAGE_GENERATOR_CONFIG, generateVillage, VILLAGE_GENERATOR_VERSION, validateGeneratedVillage } from "./index.js";

function generate(seed: string, config = DEFAULT_VILLAGE_GENERATOR_CONFIG) {
  const prng = createPrngStateByDomainV2(seed);
  const worldStream = new PrngStream(prng.world);
  return generateVillage(seed, worldStream, config);
}

/**
 * Pruebas del generador puro (`generateVillage`) aisladas de la
 * materialización completa del estado (S2 de WEB-002 §7): dependencia
 * explícita de semilla, versión del generador y configuración; ausencia
 * de generación diferida A→B / B→A que altere el resultado; aislamiento
 * de versión.
 */
describe("generateVillage — dependencia explícita de semilla/versión/configuración", () => {
  it("la versión del generador es un identificador inequívoco estampado en el mundo, independiente de la configuración", () => {
    const a = generate("aldea-config-a", { ...DEFAULT_VILLAGE_GENERATOR_CONFIG, halfExtentMeters: 1200 });
    expect(a.world.generatorVersion).toBe(VILLAGE_GENERATOR_VERSION);
  });

  it("una configuración distinta (huella del sector) produce un mundo distinto con la misma semilla", () => {
    const small = generate("aldea-config-b", { ...DEFAULT_VILLAGE_GENERATOR_CONFIG, halfExtentMeters: 900 });
    const large = generate("aldea-config-b", { ...DEFAULT_VILLAGE_GENERATOR_CONFIG, halfExtentMeters: 1800 });
    expect(small.world.bounds).not.toEqual(large.world.bounds);
  });

  it("misma semilla y misma configuración producen el mismo mundo (determinismo del generador puro, no solo del orquestador completo)", () => {
    const a = generate("aldea-config-c");
    const b = generate("aldea-config-c");
    expect(a.world).toEqual(b.world);
    expect(a.shelterPlaceId).toBe(b.shelterPlaceId);
  });

  it("el resultado no depende del reloj del sistema ni de un contador global: generar la misma semilla en momentos distintos produce IDs idénticos", async () => {
    const first = generate("aldea-tiempo");
    await new Promise((resolve) => setTimeout(resolve, 5));
    const second = generate("aldea-tiempo");
    expect(Object.keys(first.world.places)).toEqual(Object.keys(second.world.places));
  });

  it("validateGeneratedVillage detecta explícitamente cuando falta un perfil (no se limita a devolver `ok`)", () => {
    const state = createInitialStateV2("aldea-validacion");
    const tampered = { ...state, world: { ...state.world, places: {} } };
    const report = validateGeneratedVillage(tampered, { shelterDistanceMeters: 150, shelterWasWithinBudget: true });
    expect(report.ok).toBe(false);
    expect(report.violations.some((v) => v.code === "missing_profile")).toBe(true);
  });
});
