import { EventEmitter } from "pixi.js";
import { GameEvents } from "./types/Game";
import { UIEvents } from "./types/UI";

export interface EngineEvents {
  "engine:game-started": () => void;
  "engine:game-finished": (data: Partial<any>) => void;
  "engine:game-paused": () => void;
  "engine:game-resumed": () => void;
  "engine:game-reseted": () => void;
  "engine:game-closed": () => void;

  // Wrapper event
  "engine:game-chosen": (gameKey: string) => void;
}

export class EventSystem {
  public readonly internal = new EventEmitter<EngineEvents>();
  public readonly game = new EventEmitter<GameEvents>();
  public readonly ui = new EventEmitter<UIEvents>();
}
