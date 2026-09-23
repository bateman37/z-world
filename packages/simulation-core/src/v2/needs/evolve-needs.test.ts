import { describe, expect, it } from "vitest";
import type { NeedState } from "@z-world/contracts";
import { needBandFor } from "@z-world/contracts";
import {
  applyHydrationRecovery,
  applyNutritionRecovery,
  applyRestRecovery,
  declineNeedsForElapsedSimMinutes,
  declineNeedsForMovement,
  needOf,
} from "./evolve-needs.js";

function needs(hydration: number, nutrition: number, rest: number): readonly NeedState[] {
  return [
    { dimension: "hydration", value: hydration, band: needBandFor(hydration) },
    { dimension: "nutrition", value: nutrition, band: needBandFor(nutrition) },
    { dimension: "rest", value: rest, band: needBandFor(rest) },
  ];
}

describe("needBandFor (bandas cualitativas exactas, S6 §14.4)", () => {
  it.each([
    [100, "stable"],
    [50, "stable"],
    [49.99, "in_need"],
    [25, "in_need"],
    [24.99, "urgent"],
    [10, "urgent"],
    [9.99, "critical"],
    [0, "critical"],
  ] as const)("valor %f → banda %s", (value, expected) => {
    expect(needBandFor(value)).toBe(expected);
  });
});

describe("declineNeedsForElapsedSimMinutes", () => {
  it("la pausa (0 minutos) no cambia nada", () => {
    const before = needs(80, 80, 80);
    expect(declineNeedsForElapsedSimMinutes(before, 0, "idle", "normal")).toEqual(before);
  });

  it("el trabajo activo cuesta más que estar inactivo para el mismo tiempo (evita doble contabilización: sustituye, no suma)", () => {
    const idleResult = declineNeedsForElapsedSimMinutes(needs(80, 80, 80), 60, "idle", "normal");
    const workingResult = declineNeedsForElapsedSimMinutes(needs(80, 80, 80), 60, "working", "normal");
    expect(needOf(workingResult, "hydration").value).toBeLessThan(needOf(idleResult, "hydration").value);
  });

  it("x1 y x10 producen el mismo resultado para el mismo tiempo simulado (determinismo de velocidad)", () => {
    // 60 s a x1 y 6 s "reales" a x10 representan el mismo tiempo simulado (60s = 1 min); el descenso depende solo del tiempo simulado, nunca de cuántos ticks reales lo compusieron.
    const oneBigStep = declineNeedsForElapsedSimMinutes(needs(80, 80, 80), 1, "idle", "normal");
    const tenSmallSteps = Array.from({ length: 10 }).reduce<readonly NeedState[]>((acc) => declineNeedsForElapsedSimMinutes(acc, 0.1, "idle", "normal"), needs(80, 80, 80));
    expect(needOf(tenSmallSteps, "hydration").value).toBeCloseTo(needOf(oneBigStep, "hydration").value, 10);
  });

  it("nunca baja de 0", () => {
    const result = declineNeedsForElapsedSimMinutes(needs(1, 1, 1), 100000, "working", "fast");
    expect(needOf(result, "hydration").value).toBe(0);
  });
});

describe("declineNeedsForMovement", () => {
  it("0 metros no cambia nada", () => {
    const before = needs(80, 80, 80);
    expect(declineNeedsForMovement(before, 0)).toEqual(before);
  });

  it("más distancia recorrida cuesta más", () => {
    const short = declineNeedsForMovement(needs(80, 80, 80), 10);
    const long = declineNeedsForMovement(needs(80, 80, 80), 100);
    expect(needOf(long, "hydration").value).toBeLessThan(needOf(short, "hydration").value);
  });
});

describe("recuperación (beber/comer/descansar, S6 §14.5)", () => {
  it("beber mejora solo hidratación, sin superar 100", () => {
    const result = applyHydrationRecovery(needs(90, 50, 50), 5);
    expect(needOf(result, "hydration").value).toBe(100);
    expect(needOf(result, "nutrition").value).toBe(50);
  });

  it("comer mejora solo nutrición", () => {
    const result = applyNutritionRecovery(needs(50, 10, 50), 1);
    expect(needOf(result, "nutrition").value).toBeGreaterThan(10);
    expect(needOf(result, "hydration").value).toBe(50);
  });

  it("descansar en cama recupera más rápido que en el suelo para el mismo tiempo", () => {
    const inBed = applyRestRecovery(needs(50, 50, 20), 60, "bed");
    const onGround = applyRestRecovery(needs(50, 50, 20), 60, "ground");
    expect(needOf(inBed, "rest").value).toBeGreaterThan(needOf(onGround, "rest").value);
  });
});
