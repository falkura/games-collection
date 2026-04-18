export type Vec = { x: number; y: number };

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
