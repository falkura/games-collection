import { EventEmitter } from "pixi.js";

/** Empty | Dot (eliminated) | Star */
export type Mark = 0 | 1 | 2;

export interface PuzzleConfig {
  size: number;
  starsPer: 1 | 2;
}

export enum Events {
  /** From UI: user picked size+starsPer and pressed play. */
  StartRequested,
  /** From UI: restart current puzzle (same level). */
  RestartRequested,
  /** From UI: load a new puzzle of the same config. */
  NewPuzzleRequested,
  /** From UI: leave to menu. */
  MenuRequested,
  /** From Pixi board: user tapped a cell. */
  CellTapped,
  /** From UI: toggle pause. */
  PauseToggleRequested,
}

interface EventTypes {
  [Events.StartRequested]: PuzzleConfig;
  [Events.RestartRequested]: void;
  [Events.NewPuzzleRequested]: void;
  [Events.MenuRequested]: void;
  [Events.CellTapped]: { row: number; col: number };
  [Events.PauseToggleRequested]: void;
}

export const events = new EventEmitter<EventTypes>();
