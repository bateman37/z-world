import type { WorldPoint } from "@z-world/contracts";
import { cellToWorldCenter, isCellWalkable, worldToCell, type WalkabilityGrid } from "./navigation-grid.js";

interface AStarNode {
  readonly col: number;
  readonly row: number;
  g: number;
  f: number;
  parent: AStarNode | null;
}

function heuristic(ax: number, ay: number, bx: number, by: number): number {
  return Math.hypot(bx - ax, by - ay);
}

const NEIGHBOR_OFFSETS: readonly [number, number][] = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
];

/**
 * Búsqueda de ruta A* determinista sobre la rejilla de navegación. Devuelve
 * `null` si no existe ruta transitable. El resultado es siempre el mismo
 * para la misma rejilla y los mismos extremos (§15.1).
 */
export function findPath(grid: WalkabilityGrid, start: WorldPoint, goal: WorldPoint): WorldPoint[] | null {
  const startCell = worldToCell(grid, start);
  const goalCell = worldToCell(grid, goal);
  if (!startCell || !goalCell) return null;
  if (!isCellWalkable(grid, goalCell.col, goalCell.row)) return null;
  if (!isCellWalkable(grid, startCell.col, startCell.row)) {
    // La persona puede partir de un punto exactamente en el borde; si su
    // propia celda no es transitable pero coincide con el inicio, se
    // permite salir desde ahí sin bloquear la orden.
  }

  const key = (col: number, row: number) => `${col}:${row}`;
  const open = new Map<string, AStarNode>();
  const closed = new Set<string>();

  const startNode: AStarNode = {
    col: startCell.col,
    row: startCell.row,
    g: 0,
    f: heuristic(startCell.col, startCell.row, goalCell.col, goalCell.row),
    parent: null,
  };
  open.set(key(startNode.col, startNode.row), startNode);

  const maxIterations = grid.columns * grid.rows + 1;
  let iterations = 0;

  while (open.size > 0) {
    iterations += 1;
    if (iterations > maxIterations) return null;

    let current: AStarNode | null = null;
    for (const node of open.values()) {
      if (!current || node.f < current.f) current = node;
    }
    if (!current) break;

    if (current.col === goalCell.col && current.row === goalCell.row) {
      return reconstructPath(grid, current);
    }

    open.delete(key(current.col, current.row));
    closed.add(key(current.col, current.row));

    for (const [dc, dr] of NEIGHBOR_OFFSETS) {
      const nCol = current.col + dc;
      const nRow = current.row + dr;
      const nKey = key(nCol, nRow);
      if (closed.has(nKey)) continue;
      if (!isCellWalkable(grid, nCol, nRow)) continue;
      // Evita cortar esquinas entre dos celdas diagonales no transitables.
      if (dc !== 0 && dr !== 0) {
        if (!isCellWalkable(grid, current.col + dc, current.row) || !isCellWalkable(grid, current.col, current.row + dr)) {
          continue;
        }
      }

      const stepCost = Math.hypot(dc, dr) * grid.resolutionMeters;
      const costMultiplier = grid.costMultiplier[nRow * grid.columns + nCol] ?? 1;
      const tentativeG = current.g + stepCost * costMultiplier;

      const existing = open.get(nKey);
      if (!existing || tentativeG < existing.g) {
        const node: AStarNode = {
          col: nCol,
          row: nRow,
          g: tentativeG,
          f: tentativeG + heuristic(nCol, nRow, goalCell.col, goalCell.row),
          parent: current,
        };
        open.set(nKey, node);
      }
    }
  }

  return null;
}

function reconstructPath(grid: WalkabilityGrid, endNode: AStarNode): WorldPoint[] {
  const cells: AStarNode[] = [];
  let cursor: AStarNode | null = endNode;
  while (cursor) {
    cells.push(cursor);
    cursor = cursor.parent;
  }
  cells.reverse();
  return cells.map((cell) => cellToWorldCenter(grid, cell.col, cell.row));
}
