import { Assets } from "pixi.js";
import type { Cell, Level, RawLevel } from "./types";

function normalizeRowWidth(rows: string[]): string[] {
  const width = Math.max(...rows.map((row) => row.length));
  return rows.map((row) => row.padEnd(width, "."));
}

function isLabel(char: string): boolean {
  return /^[0-9A-Za-z]$/.test(char);
}

function neighbors(cell: Cell): Cell[] {
  return [
    { x: cell.x + 1, y: cell.y },
    { x: cell.x - 1, y: cell.y },
    { x: cell.x, y: cell.y + 1 },
    { x: cell.x, y: cell.y - 1 },
  ];
}

function parseLevel(level: RawLevel): Level {
  const rows = normalizeRowWidth(level.rows);
  const height = rows.length;
  const width = rows[0]?.length ?? 0;
  const perLabel = new Map<string, Cell[]>();

  for (let y = 0; y < rows.length; y++) {
    for (let x = 0; x < rows[y].length; x++) {
      const char = rows[y][x];
      if (!isLabel(char)) continue;
      const cells = perLabel.get(char) ?? [];
      cells.push({ x, y });
      perLabel.set(char, cells);
    }
  }

  const labels = Array.from(perLabel.keys()).sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true }),
  );
  const endpoints: Record<string, [Cell, Cell]> = {};

  for (const label of labels) {
    const cells = perLabel.get(label) ?? [];
    if (cells.length === 2) {
      endpoints[label] = [cells[0], cells[1]];
      continue;
    }

    // If a solved grid is ever imported instead of endpoint-only rows,
    // infer the true endpoints from degree-1 cells in the region.
    const region = new Set(cells.map((cell) => `${cell.x},${cell.y}`));
    const degreeOneCells = cells.filter((cell) => {
      const degree = neighbors(cell).filter((neighbor) =>
        region.has(`${neighbor.x},${neighbor.y}`),
      ).length;
      return degree === 1;
    });

    if (degreeOneCells.length !== 2) {
      throw new Error(
        `Level "${level.id}" has invalid endpoint count for label "${label}".`,
      );
    }

    endpoints[label] = [degreeOneCells[0], degreeOneCells[1]];
  }

  return {
    id: level.id,
    title: level.title,
    source: level.source,
    width,
    height,
    labels,
    endpoints,
  };
}

let cachedLevels: Level[] | null = null;

export function getLevels(): Level[] {
  if (cachedLevels) return cachedLevels;
  const raw = Assets.get<RawLevel[]>("levels");
  if (!raw) {
    throw new Error("Levels asset 'levels' is not loaded. Call Engine.loadAssets() first.");
  }
  cachedLevels = raw.map(parseLevel);
  return cachedLevels;
}
