import { z } from "zod";
import type { Meters } from "./units.js";

/** Punto en coordenadas de mundo, en metros, independiente de píxeles. */
export interface WorldPoint {
  readonly x: Meters;
  readonly y: Meters;
}

export const worldPointSchema = z.object({
  x: z.number(),
  y: z.number(),
});

/** Rectángulo de mundo alineado a ejes, en metros. */
export interface WorldBounds {
  readonly minX: Meters;
  readonly minY: Meters;
  readonly maxX: Meters;
  readonly maxY: Meters;
}

export const worldBoundsSchema = z.object({
  minX: z.number(),
  minY: z.number(),
  maxX: z.number(),
  maxY: z.number(),
});

export function pointInBounds(point: WorldPoint, bounds: WorldBounds): boolean {
  return (
    point.x >= bounds.minX &&
    point.x <= bounds.maxX &&
    point.y >= bounds.minY &&
    point.y <= bounds.maxY
  );
}

export function distance(a: WorldPoint, b: WorldPoint): Meters {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
