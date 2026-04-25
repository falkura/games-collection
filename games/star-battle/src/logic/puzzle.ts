import { Mark } from "../events";

export interface Puzzle {
  size: number;
  /** Stars per row/col/region. */
  starsPer: number;
  /** size×size grid; each cell stores its region id (0..size-1). */
  regions: number[][];
  /** Reference solution: 1 if star, 0 otherwise. */
  solution: number[][];
}

/** Whether the (size, starsPer) combo is solvable. K=2 needs N≥8 (N=7 is infeasible by row-adjacency). */
export function isCombinationFeasible(size: number, starsPer: 1 | 2): boolean {
  if (starsPer === 1) return size >= 4;
  return size >= 8;
}

const NEIGHBORS_8: ReadonlyArray<readonly [number, number]> = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],          [0, 1],
  [1, -1],  [1, 0], [1, 1],
];
const NEIGHBORS_4: ReadonlyArray<readonly [number, number]> = [
  [-1, 0], [1, 0], [0, -1], [0, 1],
];

const inBounds = (n: number, r: number, c: number) =>
  r >= 0 && r < n && c >= 0 && c < n;

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Try to place K stars in an N×N grid: K per row, K per column, no two adjacent (8-neighbor). */
function placeStars(n: number, k: number): number[][] | null {
  const grid: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  const colCount = new Array(n).fill(0);

  const rowOk = (r: number, c: number): boolean => {
    if (colCount[c] >= k) return false;
    for (const [dr, dc] of NEIGHBORS_8) {
      const nr = r + dr;
      const nc = c + dc;
      if (inBounds(n, nr, nc) && grid[nr][nc] === 1) return false;
    }
    return true;
  };

  const placeRow = (r: number): boolean => {
    if (r === n) return true;
    const cols = shuffle(Array.from({ length: n }, (_, i) => i));
    return tryRow(r, cols, 0, 0);
  };

  const tryRow = (
    r: number,
    cols: number[],
    placed: number,
    startIdx: number,
  ): boolean => {
    if (placed === k) return placeRow(r + 1);
    for (let i = startIdx; i < cols.length; i++) {
      const c = cols[i];
      if (rowOk(r, c)) {
        grid[r][c] = 1;
        colCount[c]++;
        if (tryRow(r, cols, placed + 1, i + 1)) return true;
        grid[r][c] = 0;
        colCount[c]--;
      }
    }
    return false;
  };

  return placeRow(0) ? grid : null;
}

/**
 * Carve N regions, one per row of stars (each region must contain exactly K stars
 * — for K=1, one star per region; for K=2, we group two stars per region).
 *
 * Strategy: pick seed groups of K stars each (close together), then BFS-grow
 * regions to fill the grid, keeping them connected.
 */
function carveRegions(n: number, k: number, stars: number[][]): number[][] | null {
  const totalStars = n * k;
  const numRegions = totalStars / k;
  if (!Number.isInteger(numRegions)) return null;

  const starList: Array<[number, number]> = [];
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (stars[r][c] === 1) starList.push([r, c]);
    }
  }

  // Group stars into K-sized clusters by greedy nearest-neighbor pairing.
  const used = new Array(starList.length).fill(false);
  const groups: Array<Array<[number, number]>> = [];
  for (let i = 0; i < starList.length; i++) {
    if (used[i]) continue;
    const group: Array<[number, number]> = [starList[i]];
    used[i] = true;
    while (group.length < k) {
      let bestJ = -1;
      let bestD = Infinity;
      for (let j = 0; j < starList.length; j++) {
        if (used[j]) continue;
        let d = Infinity;
        for (const [r, c] of group) {
          const dd = Math.abs(starList[j][0] - r) + Math.abs(starList[j][1] - c);
          if (dd < d) d = dd;
        }
        if (d < bestD) {
          bestD = d;
          bestJ = j;
        }
      }
      if (bestJ === -1) return null;
      group.push(starList[bestJ]);
      used[bestJ] = true;
    }
    groups.push(group);
  }
  if (groups.length !== numRegions) return null;

  // Init regions: each star cell tagged with its group index.
  const regions: number[][] = Array.from({ length: n }, () =>
    Array(n).fill(-1),
  );
  for (let g = 0; g < groups.length; g++) {
    for (const [r, c] of groups[g]) regions[r][c] = g;
  }

  // BFS-expand: maintain a frontier per region, repeatedly take a random region
  // and add a random adjacent unassigned cell.
  const frontiers: Array<Array<[number, number]>> = groups.map((g) => [...g]);
  let unassigned = n * n - totalStars;

  while (unassigned > 0) {
    const order = shuffle(Array.from({ length: numRegions }, (_, i) => i));
    let progressed = false;
    for (const g of order) {
      const front = frontiers[g];
      // Try a few random frontier cells before giving up on this region this round.
      for (let attempt = 0; attempt < 6 && front.length > 0; attempt++) {
        const idx = Math.floor(Math.random() * front.length);
        const [r, c] = front[idx];
        const dirs = shuffle([...NEIGHBORS_4]);
        let added = false;
        for (const [dr, dc] of dirs) {
          const nr = r + dr;
          const nc = c + dc;
          if (!inBounds(n, nr, nc)) continue;
          if (regions[nr][nc] !== -1) continue;
          regions[nr][nc] = g;
          front.push([nr, nc]);
          unassigned--;
          progressed = true;
          added = true;
          break;
        }
        if (added) break;
        // This cell has no free neighbors; drop it from frontier.
        front.splice(idx, 1);
      }
    }
    if (!progressed) {
      // Stuck: assign remaining cells to any region that touches them.
      for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
          if (regions[r][c] !== -1) continue;
          for (const [dr, dc] of NEIGHBORS_4) {
            const nr = r + dr;
            const nc = c + dc;
            if (inBounds(n, nr, nc) && regions[nr][nc] !== -1) {
              regions[r][c] = regions[nr][nc];
              unassigned--;
              progressed = true;
              break;
            }
          }
        }
      }
      if (!progressed) return null;
    }
  }

  return regions;
}

export function generatePuzzle(size: number, starsPer: 1 | 2): Puzzle {
  if (!isCombinationFeasible(size, starsPer)) {
    throw new Error(`Infeasible puzzle: ${size}x${size} with ${starsPer} stars`);
  }
  for (let attempt = 0; attempt < 200; attempt++) {
    const stars = placeStars(size, starsPer);
    if (!stars) continue;
    const regions = carveRegions(size, starsPer, stars);
    if (!regions) continue;
    return { size, starsPer, regions, solution: stars };
  }
  throw new Error(`Failed to generate ${size}x${size}/${starsPer}-star puzzle`);
}

/** Find conflicts for stars currently on the board. Returns the set of cells participating in any rule break. */
export function findConflicts(
  marks: Mark[][],
  regions: number[][],
  starsPer: number,
): Set<string> {
  const n = marks.length;
  const conflicts = new Set<string>();
  const key = (r: number, c: number) => `${r},${c}`;

  // Adjacency conflict (any two stars touching including diagonally).
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (marks[r][c] !== 2) continue;
      for (const [dr, dc] of NEIGHBORS_8) {
        const nr = r + dr;
        const nc = c + dc;
        if (inBounds(n, nr, nc) && marks[nr][nc] === 2) {
          conflicts.add(key(r, c));
          conflicts.add(key(nr, nc));
        }
      }
    }
  }

  // Row / col / region overflow.
  const rowStars: Array<Array<[number, number]>> = Array.from({ length: n }, () => []);
  const colStars: Array<Array<[number, number]>> = Array.from({ length: n }, () => []);
  const regionStars: Array<Array<[number, number]>> = Array.from({ length: n }, () => []);

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (marks[r][c] !== 2) continue;
      rowStars[r].push([r, c]);
      colStars[c].push([r, c]);
      regionStars[regions[r][c]].push([r, c]);
    }
  }

  const flagOverflow = (groups: Array<Array<[number, number]>>) => {
    for (const g of groups) {
      if (g.length > starsPer) {
        for (const [r, c] of g) conflicts.add(key(r, c));
      }
    }
  };
  flagOverflow(rowStars);
  flagOverflow(colStars);
  flagOverflow(regionStars);

  return conflicts;
}

/** Win condition: every row, col, and region has exactly K stars, no conflicts. */
export function isSolved(
  marks: Mark[][],
  regions: number[][],
  starsPer: number,
): boolean {
  const n = marks.length;
  const rowCount = new Array(n).fill(0);
  const colCount = new Array(n).fill(0);
  const regionCount = new Array(n).fill(0);
  let total = 0;

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (marks[r][c] !== 2) continue;
      rowCount[r]++;
      colCount[c]++;
      regionCount[regions[r][c]]++;
      total++;
    }
  }

  if (total !== n * starsPer) return false;
  for (let i = 0; i < n; i++) {
    if (rowCount[i] !== starsPer) return false;
    if (colCount[i] !== starsPer) return false;
    if (regionCount[i] !== starsPer) return false;
  }
  return findConflicts(marks, regions, starsPer).size === 0;
}

export function emptyMarks(size: number): Mark[][] {
  return Array.from({ length: size }, () => Array(size).fill(0) as Mark[]);
}
