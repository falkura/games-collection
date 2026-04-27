import { Difficulty, getMultipliers, Rows } from "./payouts";

export interface DropRequest {
  bet: number;
  difficulty: Difficulty;
  rows: Rows;
  /** Stable client-generated id so the UI can correlate the result. */
  clientId: string;
}

export interface DropResponse {
  clientId: string;
  /** Index into the bin/multiplier array (0..rows). */
  bin: number;
  multiplier: number;
  payout: number;
}

export interface PlinkoServer {
  drop(req: DropRequest): Promise<DropResponse>;
}

/**
 * Fake server: samples a target bin from a binomial-ish distribution biased
 * by difficulty (low difficulty → balls cluster in the middle; expert → fatter
 * tails). Real server impl will replace this without UI changes.
 */
export class FakePlinkoServer implements PlinkoServer {
  async drop(req: DropRequest): Promise<DropResponse> {
    const { difficulty, rows, bet, clientId } = req;
    const multipliers = getMultipliers(difficulty, rows);

    const tailBias: Record<Difficulty, number> = {
      Low: 0,
      Medium: 0.04,
      High: 0.08,
      Expert: 0.12,
    };
    const bias = tailBias[difficulty];

    let leftSteps = 0;
    for (let i = 0; i < rows; i++) {
      const r = Math.random();
      const goLeft = r < 0.5 - (r > 0.5 ? -bias : bias) * (Math.random() - 0.5);
      if (goLeft) leftSteps++;
    }
    // Standard Plinko: bin = number of "right" steps.
    const bin = rows - leftSteps;
    const multiplier = multipliers[bin];
    const payout = +(bet * multiplier).toFixed(2);

    // Simulate a network round-trip.
    await new Promise((res) => setTimeout(res, 80));

    return { clientId, bin, multiplier, payout };
  }
}
