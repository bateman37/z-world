import { z } from "zod";
import type { SimSeconds } from "./units.js";

/** Velocidades de reloj visibles (DEC-0014, ARC-004). */
export const GAME_SPEEDS = [0, 1, 2, 4, 10] as const;
export type GameSpeed = (typeof GAME_SPEEDS)[number];
export const gameSpeedSchema = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(4),
  z.literal(10),
]);

/** `0` representa pausa; el resto son multiplicadores reales de avance. */
export interface SimulationClock {
  /** Segundos simulados transcurridos desde el instante de llegada. */
  readonly elapsedSimSeconds: SimSeconds;
  /** Velocidad actual (0 = pausa). */
  readonly speed: GameSpeed;
}

export const simulationClockSchema = z.object({
  elapsedSimSeconds: z.number().int().nonnegative(),
  speed: gameSpeedSchema,
});

/** El reloj de partida arranca en Día 1, 17:30 (DEC-0012/SCN-003). */
export const ARRIVAL_DAY = 1;
export const ARRIVAL_HOUR = 17;
export const ARRIVAL_MINUTE = 30;
export const ARRIVAL_ELAPSED_SIM_SECONDS: SimSeconds =
  ARRIVAL_HOUR * 3600 + ARRIVAL_MINUTE * 60;

export interface SimulatedDayTime {
  readonly day: number;
  readonly hour: number;
  readonly minute: number;
  readonly second: number;
}

/** Convierte segundos simulados totales (desde el día 1) a día/hora/min/seg. */
export function toSimulatedDayTime(elapsedSimSeconds: SimSeconds): SimulatedDayTime {
  const SECONDS_PER_DAY = 86400;
  const day = ARRIVAL_DAY + Math.floor(elapsedSimSeconds / SECONDS_PER_DAY);
  const secondOfDay = elapsedSimSeconds % SECONDS_PER_DAY;
  const hour = Math.floor(secondOfDay / 3600);
  const minute = Math.floor((secondOfDay % 3600) / 60);
  const second = Math.floor(secondOfDay % 60);
  return { day, hour, minute, second };
}
