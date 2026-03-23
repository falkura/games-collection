import { EventEmitter } from "pixi.js";
import { GameEvents, GameFinishData } from "./types/Game";
import { UIEvents } from "./types/UI";

export interface EngineEvents {
  "engine:game-started": () => void;
  "engine:game-finished": (data: Partial<GameFinishData>) => void;
  "engine:game-paused": () => void;
  "engine:game-resumed": () => void;
  "engine:game-reseted": () => void;
  "engine:game-hint-used": () => void;
  "engine:game-closed": () => void;

  // Wrapper event
  "engine:game-chosen": (gameKey: string) => void;
}

export class EventSystem {
  public readonly internal = new EventEmitter<EngineEvents>();
  public readonly game = new EventEmitter<GameEvents>();
  public readonly ui = new EventEmitter<UIEvents>();
}
