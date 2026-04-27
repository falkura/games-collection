export type Difficulty = "Low" | "Medium" | "High" | "Expert";
export type Rows = 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16;

// Multiplier tables — symmetric, indexed by bin (0..rows). Values are
// approximations of Stake's published Plinko tables. These drive both payout
// and the weighted random target-bin selection on the fake server.
type Table = Record<Rows, number[]>;

const LOW: Table = {
  8: [5.6, 2.1, 1.1, 1.0, 0.5, 1.0, 1.1, 2.1, 5.6],
  9: [5.6, 2.0, 1.6, 1.0, 0.7, 0.7, 1.0, 1.6, 2.0, 5.6],
  10: [8.9, 3.0, 1.4, 1.1, 1.0, 0.5, 1.0, 1.1, 1.4, 3.0, 8.9],
  11: [8.4, 3.0, 1.9, 1.3, 1.0, 0.7, 0.7, 1.0, 1.3, 1.9, 3.0, 8.4],
  12: [10.0, 3.0, 1.6, 1.4, 1.1, 1.0, 0.5, 1.0, 1.1, 1.4, 1.6, 3.0, 10.0],
  13: [8.1, 4.0, 3.0, 1.9, 1.2, 0.9, 0.7, 0.7, 0.9, 1.2, 1.9, 3.0, 4.0, 8.1],
  14: [
    7.1, 4.0, 1.9, 1.4, 1.3, 1.1, 1.0, 0.5, 1.0, 1.1, 1.3, 1.4, 1.9, 4.0, 7.1,
  ],
  15: [
    15.0, 8.0, 3.0, 2.0, 1.5, 1.1, 1.0, 0.7, 0.7, 1.0, 1.1, 1.5, 2.0, 3.0, 8.0,
    15.0,
  ],
  16: [
    16.0, 9.0, 2.0, 1.4, 1.4, 1.2, 1.1, 1.0, 0.5, 1.0, 1.1, 1.2, 1.4, 1.4, 2.0,
    9.0, 16.0,
  ],
};

const MEDIUM: Table = {
  8: [13.0, 3.0, 1.3, 0.7, 0.4, 0.7, 1.3, 3.0, 13.0],
  9: [18.0, 4.0, 1.7, 0.9, 0.5, 0.5, 0.9, 1.7, 4.0, 18.0],
  10: [22.0, 5.0, 2.0, 1.4, 0.6, 0.4, 0.6, 1.4, 2.0, 5.0, 22.0],
  11: [24.0, 6.0, 3.0, 1.8, 0.7, 0.5, 0.5, 0.7, 1.8, 3.0, 6.0, 24.0],
  12: [33.0, 11.0, 4.0, 2.0, 1.1, 0.6, 0.3, 0.6, 1.1, 2.0, 4.0, 11.0, 33.0],
  13: [
    43.0, 13.0, 6.0, 3.0, 1.3, 0.7, 0.4, 0.4, 0.7, 1.3, 3.0, 6.0, 13.0, 43.0,
  ],
  14: [
    58.0, 15.0, 7.0, 4.0, 1.9, 1.0, 0.5, 0.2, 0.5, 1.0, 1.9, 4.0, 7.0, 15.0,
    58.0,
  ],
  15: [
    88.0, 18.0, 11.0, 5.0, 3.0, 1.3, 0.5, 0.3, 0.3, 0.5, 1.3, 3.0, 5.0, 11.0,
    18.0, 88.0,
  ],
  16: [
    110.0, 41.0, 10.0, 5.0, 3.0, 1.5, 1.0, 0.5, 0.3, 0.5, 1.0, 1.5, 3.0, 5.0,
    10.0, 41.0, 110.0,
  ],
};

const HIGH: Table = {
  8: [29.0, 4.0, 1.5, 0.3, 0.2, 0.3, 1.5, 4.0, 29.0],
  9: [43.0, 7.0, 2.0, 0.6, 0.2, 0.2, 0.6, 2.0, 7.0, 43.0],
  10: [76.0, 10.0, 3.0, 0.9, 0.3, 0.2, 0.3, 0.9, 3.0, 10.0, 76.0],
  11: [120.0, 14.0, 5.2, 1.4, 0.4, 0.2, 0.2, 0.4, 1.4, 5.2, 14.0, 120.0],
  12: [170.0, 24.0, 8.1, 2.0, 0.7, 0.2, 0.2, 0.2, 0.7, 2.0, 8.1, 24.0, 170.0],
  13: [
    260.0, 37.0, 11.0, 4.0, 1.0, 0.2, 0.2, 0.2, 0.2, 1.0, 4.0, 11.0, 37.0,
    260.0,
  ],
  14: [
    420.0, 56.0, 18.0, 5.0, 1.9, 0.3, 0.2, 0.2, 0.2, 0.3, 1.9, 5.0, 18.0, 56.0,
    420.0,
  ],
  15: [
    620.0, 83.0, 27.0, 8.0, 3.0, 0.5, 0.2, 0.2, 0.2, 0.2, 0.5, 3.0, 8.0, 27.0,
    83.0, 620.0,
  ],
  16: [
    1000.0, 130.0, 26.0, 9.0, 4.0, 2.0, 0.2, 0.2, 0.2, 0.2, 0.2, 2.0, 4.0, 9.0,
    26.0, 130.0, 1000.0,
  ],
};

// Expert — sharper edges than High; same spirit, more concentrated low values
// in the middle. (Stake doesn't publish this difficulty; treated as a custom tier.)
const EXPERT: Table = {
  8: [50.0, 6.0, 2.0, 0.2, 0.1, 0.2, 2.0, 6.0, 50.0],
  9: [80.0, 10.0, 3.0, 0.4, 0.1, 0.1, 0.4, 3.0, 10.0, 80.0],
  10: [130.0, 16.0, 4.5, 0.6, 0.2, 0.1, 0.2, 0.6, 4.5, 16.0, 130.0],
  11: [200.0, 24.0, 8.0, 1.0, 0.3, 0.1, 0.1, 0.3, 1.0, 8.0, 24.0, 200.0],
  12: [300.0, 40.0, 13.0, 2.5, 0.5, 0.1, 0.1, 0.1, 0.5, 2.5, 13.0, 40.0, 300.0],
  13: [
    500.0, 65.0, 18.0, 5.0, 0.8, 0.1, 0.1, 0.1, 0.1, 0.8, 5.0, 18.0, 65.0,
    500.0,
  ],
  14: [
    800.0, 100.0, 28.0, 7.0, 1.5, 0.2, 0.1, 0.1, 0.1, 0.2, 1.5, 7.0, 28.0,
    100.0, 800.0,
  ],
  15: [
    1200.0, 150.0, 45.0, 11.0, 2.5, 0.3, 0.1, 0.1, 0.1, 0.1, 0.3, 2.5, 11.0,
    45.0, 150.0, 1200.0,
  ],
  16: [
    2000.0, 250.0, 50.0, 14.0, 5.0, 1.5, 0.1, 0.1, 0.1, 0.1, 0.1, 1.5, 5.0,
    14.0, 50.0, 250.0, 2000.0,
  ],
};

const TABLES: Record<Difficulty, Table> = {
  Low: LOW,
  Medium: MEDIUM,
  High: HIGH,
  Expert: EXPERT,
};

export function getMultipliers(difficulty: Difficulty, rows: Rows): number[] {
  return TABLES[difficulty][rows];
}

export const DIFFICULTIES: Difficulty[] = ["Low", "Medium", "High", "Expert"];
export const ROW_OPTIONS: Rows[] = [8, 9, 10, 11, 12, 13, 14, 15, 16];

export const DIFFICULTY_GRADIENT: Record<
  Difficulty,
  { edge: string; center: string }
> = {
  Low: { edge: "#163aa0", center: "#60a5fa" },
  Medium: { edge: "#06762f", center: "#4ade80" },
  High: { edge: "#7119b8", center: "#c084fc" },
  Expert: { edge: "#c20c0c", center: "#fb923c" },
};

/** Returns the CSS hex color of a bin — mirrors Board's lerpColor logic exactly. */
export function getBinColor(difficulty: Difficulty, rows: Rows, binIndex: number): string {
  const { edge, center } = DIFFICULTY_GRADIENT[difficulty];
  const binCount = rows + 1;
  const c = (binCount - 1) / 2;
  const dist = Math.abs(binIndex - c) / c;

  const ah = parseInt(center.slice(1), 16);
  const bh = parseInt(edge.slice(1), 16);
  const r = Math.round(((ah >> 16) & 0xff) + (((bh >> 16) & 0xff) - ((ah >> 16) & 0xff)) * dist);
  const g = Math.round(((ah >> 8) & 0xff) + (((bh >> 8) & 0xff) - ((ah >> 8) & 0xff)) * dist);
  const b = Math.round((ah & 0xff) + ((bh & 0xff) - (ah & 0xff)) * dist);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
