import { z } from "zod";

/**
 * Máscara de niebla discretizada en rejilla técnica (invisible en la
 * presentación, que solo dibuja formas orgánicas). Valores de celda:
 * `0` oculto, `1` conocido pero no visible, `2` observable ahora.
 * La resolución es un parámetro técnico provisional (§14, registrado en
 * DEC-0014), no una regla de diseño canónica.
 */
export interface FogGrid {
  readonly resolutionMeters: number;
  readonly columns: number;
  readonly rows: number;
  readonly originX: number;
  readonly originY: number;
  /** Longitud = columns * rows, orden fila-mayor. */
  readonly cells: readonly number[];
}

export const fogGridSchema = z.object({
  resolutionMeters: z.number().positive(),
  columns: z.number().int().positive(),
  rows: z.number().int().positive(),
  originX: z.number(),
  originY: z.number(),
  cells: z.array(z.union([z.literal(0), z.literal(1), z.literal(2)])),
});

export function fogCellIndex(grid: Pick<FogGrid, "columns">, col: number, row: number): number {
  return row * grid.columns + col;
}
