import { describe, expect, it } from "vitest";
import { advanceClock, setClockPaused, setClockSpeed } from "./clock.js";
import { toSimulatedDayTime, type SimulationClock } from "@z-world/contracts";

describe("reloj de simulación", () => {
  it("pausa congela el tiempo", () => {
    const clock: SimulationClock = { elapsedSimSeconds: 1000, speed: 0 };
    expect(advanceClock(clock, 100)).toEqual(clock);
  });

  it("un día completo equivale a 20 minutos reales a ×1", () => {
    let clock: SimulationClock = { elapsedSimSeconds: 0, speed: 1 };
    clock = advanceClock(clock, 20 * 60);
    expect(clock.elapsedSimSeconds).toBe(24 * 60 * 60);
  });

  it("×2, ×4 y ×10 avanzan proporcionalmente", () => {
    const base = { elapsedSimSeconds: 0, speed: 1 as const };
    const oneMinuteAt1x = advanceClock(base, 60).elapsedSimSeconds;

    const at2x = advanceClock({ elapsedSimSeconds: 0, speed: 2 }, 60).elapsedSimSeconds;
    const at4x = advanceClock({ elapsedSimSeconds: 0, speed: 4 }, 60).elapsedSimSeconds;
    const at10x = advanceClock({ elapsedSimSeconds: 0, speed: 10 }, 60).elapsedSimSeconds;

    expect(at2x).toBe(oneMinuteAt1x * 2);
    expect(at4x).toBe(oneMinuteAt1x * 4);
    expect(at10x).toBe(oneMinuteAt1x * 10);
  });

  it("distintas cadencias de llamada producen el mismo estado final", () => {
    const oneCall = advanceClock({ elapsedSimSeconds: 0, speed: 1 }, 10);
    let manyCalls: SimulationClock = { elapsedSimSeconds: 0, speed: 1 };
    for (let i = 0; i < 10; i++) {
      manyCalls = advanceClock(manyCalls, 1);
    }
    expect(manyCalls.elapsedSimSeconds).toBe(oneCall.elapsedSimSeconds);
  });

  it("setClockPaused y setClockSpeed son idempotentes cuando no cambia nada", () => {
    const clock = { elapsedSimSeconds: 500, speed: 4 as const };
    expect(setClockSpeed(clock, 4)).toBe(clock);
    const paused = setClockPaused(clock, false);
    expect(paused).toBe(clock);
  });

  it("convierte segundos simulados a día/hora/minuto de forma correcta", () => {
    const dt = toSimulatedDayTime(17 * 3600 + 30 * 60);
    expect(dt).toEqual({ day: 1, hour: 17, minute: 30, second: 0 });
  });
});
