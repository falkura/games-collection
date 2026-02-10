import { EventEmitter } from "pixi.js";
import { IGameEvents } from "../events/IGameEvents";

export declare namespace GameTypes {
  interface GameClass {
    start(): void;
    finish(): void;
    pause(): void;
    resume(): void;
    reset(): void;
  }

  interface GameConstructor {
    new (events: EventEmitter<IGameEvents>, config: IGameConfig): GameClass;
  }
}
