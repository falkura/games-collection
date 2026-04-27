import { Difficulty, getMultipliers, Rows } from "./payouts";

export interface DropRequest {
  bet: number;
  difficulty: Difficulty;
  rows: Rows;
  clientId: string;
}

export interface DropResponse {
  clientId: string;
  /** Index into the bin/multiplier array (0..rows). */
  bin: number;
  multiplier: number;
  payout: number;
  /** Per-row decisions: 0 = go left, 1 = go right. Length === rows. */
  path: (0 | 1)[];
}

export interface PlinkoServer {
  drop(req: DropRequest): Promise<DropResponse>;
}

/**
 * Fake server: picks a target bin (weighted toward edges on higher difficulties),
 * then builds a random path of [0,1] decisions that routes to that bin.
 * Real server replaces this without UI changes.
 */
export class FakePlinkoServer implements PlinkoServer {
  async drop(req: DropRequest): Promise<DropResponse> {
    const { difficulty, rows, bet, clientId } = req;
    const multipliers = getMultipliers(difficulty, rows);
    const binCount = rows + 1; // 0..rows

    // Bias toward edges based on difficulty
    const edgeBias: Record<Difficulty, number> = {
      Low: 0.0,
      Medium: 0.06,
      High: 0.14,
      Expert: 0.22,
    };
    const bias = edgeBias[difficulty];

    // Sample bin via biased binomial (each step has slight drift toward edges)
    let rightSteps = 0;
    for (let i = 0; i < rows; i++) {
      const p = 0.5 + bias * (Math.random() > 0.5 ? 1 : -1) * 0.5;
      if (Math.random() < p) rightSteps++;
    }
    const bin = Math.max(0, Math.min(binCount - 1, rightSteps));

    // Build a random path of (0|1) decisions that sums to `bin` right-steps
    const path = buildPath(rows, bin);

    const multiplier = multipliers[bin];
    const payout = +(bet * multiplier).toFixed(2);

    await new Promise((res) => setTimeout(res, 80));

    return { clientId, bin, multiplier, payout, path };
  }
}

/** Generate a random [0|1] array of length `rows` with exactly `rights` ones. */
function buildPath(rows: number, rights: number): (0 | 1)[] {
  const path: (0 | 1)[] = Array(rows - rights).fill(0).concat(Array(rights).fill(1)) as (0 | 1)[];
  // Fisher-Yates shuffle
  for (let i = path.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [path[i], path[j]] = [path[j], path[i]];
  }
  return path;
}
