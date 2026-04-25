import {
  Board,
  COLS,
  ROWS,
  WIN_LENGTH,
  cloneBoard,
  drop,
  findWin,
  isFull,
  validMoves,
} from "./board";

const COLUMN_ORDER = [3, 2, 4, 1, 5, 0, 6];

const opponent = (p: 1 | 2): 1 | 2 => (p === 1 ? 2 : 1);

/** Score window of WIN_LENGTH cells from the AI's perspective. */
const scoreWindow = (window: number[], ai: 1 | 2): number => {
  const opp = opponent(ai);
  let aiCount = 0;
  let oppCount = 0;
  let empty = 0;
  for (const v of window) {
    if (v === ai) aiCount++;
    else if (v === opp) oppCount++;
    else empty++;
  }
  if (aiCount > 0 && oppCount > 0) return 0;
  if (aiCount === 4) return 1_000_000;
  if (oppCount === 4) return -1_000_000;
  if (aiCount === 3 && empty === 1) return 50;
  if (aiCount === 2 && empty === 2) return 10;
  if (oppCount === 3 && empty === 1) return -80;
  if (oppCount === 2 && empty === 2) return -8;
  return 0;
};

const heuristic = (b: Board, ai: 1 | 2): number => {
  let score = 0;
  // Prefer center
  for (let r = 0; r < ROWS; r++) {
    if (b[r][3] === ai) score += 4;
  }
  // Score every window of 4
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      // Horizontal
      if (c <= COLS - WIN_LENGTH) {
        const w = [b[r][c], b[r][c + 1], b[r][c + 2], b[r][c + 3]];
        score += scoreWindow(w, ai);
      }
      // Vertical
      if (r <= ROWS - WIN_LENGTH) {
        const w = [b[r][c], b[r + 1][c], b[r + 2][c], b[r + 3][c]];
        score += scoreWindow(w, ai);
      }
      // Diagonal down-right
      if (r <= ROWS - WIN_LENGTH && c <= COLS - WIN_LENGTH) {
        const w = [
          b[r][c],
          b[r + 1][c + 1],
          b[r + 2][c + 2],
          b[r + 3][c + 3],
        ];
        score += scoreWindow(w, ai);
      }
      // Diagonal up-right
      if (r >= WIN_LENGTH - 1 && c <= COLS - WIN_LENGTH) {
        const w = [
          b[r][c],
          b[r - 1][c + 1],
          b[r - 2][c + 2],
          b[r - 3][c + 3],
        ];
        score += scoreWindow(w, ai);
      }
    }
  }
  return score;
};

interface MinimaxResult {
  col: number;
  score: number;
}

const minimax = (
  b: Board,
  depth: number,
  alpha: number,
  beta: number,
  maximizing: boolean,
  ai: 1 | 2,
): MinimaxResult => {
  const win = findWin(b);
  if (win) {
    return {
      col: -1,
      score: win.player === ai ? 1_000_000 + depth : -1_000_000 - depth,
    };
  }
  const moves = validMoves(b);
  if (moves.length === 0) return { col: -1, score: 0 };
  if (depth === 0) return { col: -1, score: heuristic(b, ai) };

  const ordered = [...moves].sort(
    (a, b) => COLUMN_ORDER.indexOf(a) - COLUMN_ORDER.indexOf(b),
  );

  let bestCol = ordered[0];
  if (maximizing) {
    let value = -Infinity;
    for (const col of ordered) {
      const next = cloneBoard(b);
      drop(next, col, ai);
      const { score } = minimax(next, depth - 1, alpha, beta, false, ai);
      if (score > value) {
        value = score;
        bestCol = col;
      }
      alpha = Math.max(alpha, value);
      if (alpha >= beta) break;
    }
    return { col: bestCol, score: value };
  } else {
    const opp = opponent(ai);
    let value = Infinity;
    for (const col of ordered) {
      const next = cloneBoard(b);
      drop(next, col, opp);
      const { score } = minimax(next, depth - 1, alpha, beta, true, ai);
      if (score < value) {
        value = score;
        bestCol = col;
      }
      beta = Math.min(beta, value);
      if (alpha >= beta) break;
    }
    return { col: bestCol, score: value };
  }
};

export const pickAIMove = (b: Board, ai: 1 | 2, depth = 5): number => {
  if (isFull(b)) return -1;
  return minimax(b, depth, -Infinity, Infinity, true, ai).col;
};

/** Easy AI: take a winning move if available, block opponent's immediate win,
 *  otherwise pick a random valid column biased toward the center. */
export const pickEasyMove = (b: Board, ai: 1 | 2): number => {
  const moves = validMoves(b);
  if (moves.length === 0) return -1;
  const opp = opponent(ai);

  // Win now if possible.
  for (const col of moves) {
    const next = cloneBoard(b);
    drop(next, col, ai);
    if (findWin(next)?.player === ai) return col;
  }
  // Block opponent's win.
  for (const col of moves) {
    const next = cloneBoard(b);
    drop(next, col, opp);
    if (findWin(next)?.player === opp) return col;
  }
  // Center-biased random.
  const weights = moves.map((c) => 4 - Math.abs(3 - c));
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < moves.length; i++) {
    r -= weights[i];
    if (r <= 0) return moves[i];
  }
  return moves[moves.length - 1];
};
