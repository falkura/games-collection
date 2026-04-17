export type Vec = { x: number; y: number };

export const TOTAL_LEVELS = 10;

export const LEVEL_NAMES = [
  "First Light",
  "Twin Suns",
  "Asteroid Belt",
  "The Corridor",
  "Hunter's Orbit",
  "Crossfire",
  "Black Sites",
  "Gravity Well",
  "Maelstrom",
  "Event Horizon",
];

export type FinishReason =
  | "collision"
  | "out-of-bounds"
  | "chaser"
  | "projectile"
  | "wall"
  | "win";

export type FinishData = {
  won: boolean;
  collected: number;
  total: number;
  level: number;
  levelName: string;
  time: number;
  shots: number;
  reason?: FinishReason;
};
