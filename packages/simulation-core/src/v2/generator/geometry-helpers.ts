import type { WorldPoint } from "@z-world/contracts";
import type { PrngStream } from "../../prng.js";

/** Área con signo de un polígono simple (fórmula del cordón/"shoelace"). */
export function polygonArea(polygon: readonly WorldPoint[]): number {
  let sum = 0;
  for (let i = 0; i < polygon.length; i++) {
    const a = polygon[i]!;
    const b = polygon[(i + 1) % polygon.length]!;
    sum += a.x * b.y - b.x * a.y;
  }
  return Math.abs(sum) / 2;
}

/** Polígono irregular ("blob") determinista alrededor de un centro: base orgánica reutilizada por bosque, matorral y campos (§7.3: nada de rectángulos yuxtapuestos sin causalidad). */
export function blobPolygon(
  prng: PrngStream,
  center: WorldPoint,
  baseRadius: number,
  vertexCount = 9,
  jitterFraction = 0.35,
): WorldPoint[] {
  const points: WorldPoint[] = [];
  for (let i = 0; i < vertexCount; i++) {
    const angle = (i / vertexCount) * Math.PI * 2 + prng.nextFloat() * 0.15;
    const jitter = 1 + (prng.nextFloat() * 2 - 1) * jitterFraction;
    const radius = baseRadius * jitter;
    points.push({ x: center.x + Math.cos(angle) * radius, y: center.y + Math.sin(angle) * radius });
  }
  return points;
}

/** Reescala un polígono respecto a su centroide para que su área alcance exactamente `targetArea` (§7.2: cumplir la cobertura de terreno exigida de forma cerrada, sin reintentos). */
export function scalePolygonToArea(polygon: readonly WorldPoint[], targetArea: number): WorldPoint[] {
  const currentArea = polygonArea(polygon);
  if (currentArea <= 0) return [...polygon];
  const scale = Math.sqrt(targetArea / currentArea);
  const centroid = centroidOf(polygon);
  return polygon.map((p) => ({
    x: centroid.x + (p.x - centroid.x) * scale,
    y: centroid.y + (p.y - centroid.y) * scale,
  }));
}

export function centroidOf(polygon: readonly WorldPoint[]): WorldPoint {
  let x = 0;
  let y = 0;
  for (const p of polygon) {
    x += p.x;
    y += p.y;
  }
  return { x: x / polygon.length, y: y / polygon.length };
}

export interface AxisAlignedFootprint {
  readonly polygon: readonly WorldPoint[];
  readonly minX: number;
  readonly minY: number;
  readonly maxX: number;
  readonly maxY: number;
}

/** Rectángulo orientado (frente hacia `facingRadians`, normal a la vía adyacente) centrado en `center` (§7.3: los edificios tienen frente y orientación respecto a calle/camino). */
export function orientedRectangleFootprint(
  center: WorldPoint,
  widthMeters: number,
  depthMeters: number,
  facingRadians: number,
): readonly WorldPoint[] {
  const hw = widthMeters / 2;
  const hd = depthMeters / 2;
  const corners = [
    { x: -hw, y: -hd },
    { x: hw, y: -hd },
    { x: hw, y: hd },
    { x: -hw, y: hd },
  ];
  const cos = Math.cos(facingRadians);
  const sin = Math.sin(facingRadians);
  return corners.map((c) => ({
    x: center.x + c.x * cos - c.y * sin,
    y: center.y + c.x * sin + c.y * cos,
  }));
}

/** Caja alineada a ejes que envuelve un polígono cualquiera (para comprobación de solape barata). */
export function boundingBoxOf(polygon: readonly WorldPoint[]): AxisAlignedFootprint {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of polygon) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  return { polygon, minX, minY, maxX, maxY };
}

/** Solape simple de dos cajas alineadas, con un margen mínimo entre construcciones (§8.5/§7.3: sin solapes imposibles). */
export function boxesOverlap(a: AxisAlignedFootprint, b: AxisAlignedFootprint, marginMeters = 2): boolean {
  return (
    a.minX - marginMeters < b.maxX &&
    a.maxX + marginMeters > b.minX &&
    a.minY - marginMeters < b.maxY &&
    a.maxY + marginMeters > b.minY
  );
}

export function distance(a: WorldPoint, b: WorldPoint): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function lerp(a: WorldPoint, b: WorldPoint, t: number): WorldPoint {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

/** Punto a lo largo de una polilínea, según distancia acumulada desde el inicio (0 = inicio). */
export function pointAlongPolyline(polyline: readonly WorldPoint[], distanceMeters: number): { point: WorldPoint; tangentRadians: number } {
  let remaining = distanceMeters;
  for (let i = 0; i < polyline.length - 1; i++) {
    const a = polyline[i]!;
    const b = polyline[i + 1]!;
    const segmentLength = distance(a, b);
    if (remaining <= segmentLength || i === polyline.length - 2) {
      const t = segmentLength === 0 ? 0 : Math.max(0, Math.min(1, remaining / segmentLength));
      const point = lerp(a, b, t);
      const tangentRadians = Math.atan2(b.y - a.y, b.x - a.x);
      return { point, tangentRadians };
    }
    remaining -= segmentLength;
  }
  const last = polyline[polyline.length - 1]!;
  return { point: last, tangentRadians: 0 };
}

export function polylineLength(polyline: readonly WorldPoint[]): number {
  let total = 0;
  for (let i = 0; i < polyline.length - 1; i++) total += distance(polyline[i]!, polyline[i + 1]!);
  return total;
}

export function pointInBoundsInset(point: WorldPoint, halfExtent: number, inset: number): boolean {
  return Math.abs(point.x) <= halfExtent - inset && Math.abs(point.y) <= halfExtent - inset;
}
