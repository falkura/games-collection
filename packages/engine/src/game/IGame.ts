import { EventEmitter } from "pixi.js";
import { IGameEvents } from "../events/IGameEvents";

export interface IGame {
  start(): void;
  finish(): void;
  pause(): void;
  resume(): void;
  reset(): void;
}

export interface GameConstructor {
  new (events: EventEmitter<IGameEvents>, config: IGameConfig): IGame;
}
