import type { Ticker } from "pixi.js";

export interface GameInstance {
  ticker: Ticker;
  start(): void;
  finish(data?: any): void;
  reset(): void;
  resize(): void;
}

export type GameConstructor<T extends GameInstance = GameInstance> = new (
  config: IGameConfig,
) => T;
