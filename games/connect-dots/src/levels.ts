import type { Cell, Level, RawLevel } from "./types";

const RAW_LEVELS: RawLevel[] = [
  {
    id: "parser-warmup",
    title: "Warmup 5x4",
    source:
      "Adapted from the 5x4 parser example in thomasahle/numberlink README",
    rows: [
      "C...B",
      "A.BA.",
      "...C.",
      ".....",
    ],
  },
  {
    id: "generator-10",
    title: "Generator 10x10",
    source:
      "Adapted from the 10x10 -tubes example in thomasahle/numberlink README",
    rows: [
      "0......120",
      "3......12.",
      "...45.....",
      ".........3",
      "45.......6",
      ".........8",
      ".7..9....a",
      "...6....8.",
      "........a.",
      "97........",
    ],
  },
  {
    id: "wide-40x10",
    title: "Wide 40x10",
    source:
      "Adapted from the generated 40x10 puzzle example in thomasahle/numberlink README",
    rows: [
      "1.......................................",
      "......................6.................",
      "....24.4................8...............",
      ".......5....................5..93.......",
      "..............................7....9....",
      "....3...................................",
      "....................................8...",
      "...................627..................",
      "........................................",
      "......................1.................",
    ],
  },
  {
    id: "generator-20",
    title: "Generator 20x20",
    source:
      "Adapted from the 20x20 -tubes example in thomasahle/numberlink README",
    rows: [
      "0........223..4.....",
      "6.....17....48..9ab.",
      "c..c......de.....a..",
      "...f..71.3de8...5b..",
      ".g..6.........9.....",
      ".......gh..ij.......",
      "kk.f..............5i",
      "...l.nlho....j......",
      ".q..r.....s.......t.",
      "m...uu.o......v...p.",
      ".....r.....ww.v....t",
      ".x..n.y.zA........",
      "qxm.B..........CD...",
      ".................C.p",
      ".0...B.E...........D",
      "...y...s..E.z..G.HH",
      "......I.JJ...A..G..F",
      ".K..K...LL.M........",
      ".............O.P.NF.",
      "I......O....M..P...N",
    ],
  },
];

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

export const LEVELS = RAW_LEVELS.map(parseLevel);
