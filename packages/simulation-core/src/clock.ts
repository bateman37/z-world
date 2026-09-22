import { SIM_SECONDS_PER_REAL_SECOND_AT_1X, type GameSpeed, type SimulationClock } from "@z-world/contracts";

/**
 * Avanza el reloj un número de segundos reales, usando pasos fijos de un
 * segundo simulado (paso lógico provisional, ver DEC-0014). Pausa (`speed
 * === 0`) no avanza nada. El resultado es independiente de la cadencia de
 * llamada: llamar una vez con 3s reales produce el mismo estado que llamar
 * tres veces con 1s real cada una, porque el resto fraccional se acumula
 * fuera del núcleo (en la orquestación) y solo se le pasan segundos enteros
 * ya acumulados.
 */
export function advanceClock(clock: SimulationClock, elapsedRealSeconds: number): SimulationClock {
  if (clock.speed === 0 || elapsedRealSeconds <= 0) {
    return clock;
  }
  const simSecondsToAdd = Math.floor(elapsedRealSeconds * clock.speed * SIM_SECONDS_PER_REAL_SECOND_AT_1X);
  if (simSecondsToAdd <= 0) return clock;
  return {
    elapsedSimSeconds: clock.elapsedSimSeconds + simSecondsToAdd,
    speed: clock.speed,
  };
}

export function setClockSpeed(clock: SimulationClock, speed: GameSpeed): SimulationClock {
  if (clock.speed === speed) return clock;
  return { ...clock, speed };
}

export function setClockPaused(clock: SimulationClock, paused: boolean): SimulationClock {
  if (paused) return setClockSpeed(clock, 0);
  // Reanudar sin velocidad previa explícita reanuda a ×1 (regla provisional, DEC-0014).
  return clock.speed === 0 ? setClockSpeed(clock, 1) : clock;
}
