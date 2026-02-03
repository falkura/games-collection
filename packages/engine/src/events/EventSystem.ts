import { EventEmitter } from "pixi.js";
import { IUIEvents } from "./IUIEvents";
import { IGameEvents } from "./IGameEvents";
import { IEngineEvents } from "./IEngineEvents";

export class EventSystem {
  public readonly internal = new EventEmitter<IEngineEvents>();
  public readonly game = new EventEmitter<IGameEvents>();
  public readonly ui = new EventEmitter<IUIEvents>();
}
