import { EventEmitter } from "pixi.js";
import { UIInstance } from "./UI";

export interface GameEvents {
  "game:finished": (data: any) => void;
}

export interface GameInstance {
  start(): void;
  finish(): void;
  pause(): void;
  resume(): void;
  reset(): void;
}

export type GameConstructor<T extends GameInstance = GameInstance> = new (
  events: EventEmitter<GameEvents>,
  config: IGameConfig,
  ui: UIInstance,
) => T;
