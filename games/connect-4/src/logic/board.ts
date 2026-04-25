export const COLS = 7;
export const ROWS = 6;
export const WIN_LENGTH = 4;

export type Cell = 0 | 1 | 2;
export type Board = Cell[][];

export const createBoard = (): Board =>
  Array.from({ length: ROWS }, () => Array<Cell>(COLS).fill(0));

export const cloneBoard = (b: Board): Board => b.map((row) => row.slice());

/** Lowest empty row in column, or -1 if column is full. */
export const dropRow = (b: Board, col: number): number => {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (b[r][col] === 0) return r;
  }
  return -1;
};

export const drop = (b: Board, col: number, p: 1 | 2): number => {
  const r = dropRow(b, col);
  if (r >= 0) b[r][col] = p;
  return r;
};

export const validMoves = (b: Board): number[] => {
  const out: number[] = [];
  for (let c = 0; c < COLS; c++) if (b[0][c] === 0) out.push(c);
  return out;
};

export const isFull = (b: Board): boolean =>
  b[0].every((c) => c !== 0);

export interface WinInfo {
  player: 1 | 2;
  cells: Array<[number, number]>;
}

const DIRECTIONS: Array<[number, number]> = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
];

export const findWin = (b: Board): WinInfo | null => {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const v = b[r][c];
      if (v === 0) continue;
      for (const [dr, dc] of DIRECTIONS) {
        const cells: Array<[number, number]> = [[r, c]];
        for (let k = 1; k < WIN_LENGTH; k++) {
          const nr = r + dr * k;
          const nc = c + dc * k;
          if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) break;
          if (b[nr][nc] !== v) break;
          cells.push([nr, nc]);
        }
        if (cells.length >= WIN_LENGTH) {
          return { player: v as 1 | 2, cells };
        }
      }
    }
  }
  return null;
};
