import { EventEmitter } from "pixi.js";

export type GameMode = "ai" | "pvp";
export type Difficulty = "easy" | "medium" | "hard";

/**
 * Commands. Genuine verbs that fire and forget.
 * Observable game state (screen, current player, winner, mode) lives in
 * `gameState` (./state.ts) — subscribe via useSyncExternalStore in React.
 */
export enum Events {
  /** From UI: user picked a mode/difficulty and pressed play. */
  StartRequested,
  /** From Pixi board: user clicked a column. */
  ColumnSelected,
  /** From UI: restart current game with same mode/difficulty. */
  RestartRequested,
  /** From UI: leave to menu. */
  MenuRequested,
}

interface EventTypes {
  [Events.StartRequested]: { mode: GameMode; difficulty: Difficulty };
  [Events.ColumnSelected]: { col: number };
  [Events.RestartRequested]: void;
  [Events.MenuRequested]: void;
}

export const events = new EventEmitter<EventTypes>();
