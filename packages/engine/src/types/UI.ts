import { Container, EventEmitter, Size } from "pixi.js";
import { ModuleConstructor } from "../utils/ModuleManager";

export interface UIEvents {
  "ui:start-game": () => void;
  "ui:restart-game": () => void;
  "ui:pause-game": () => void;
  "ui:resume-game": () => void;
  "ui:close-game": () => void;

  "ui:update-settings": (settings: Partial<UISettings>) => void;
}

export interface UISettings {
  volume: number;
  music: number;
  graphics: number;
}

export interface UIScreen<TUI extends UIInstance = any> extends Container {
  ui: TUI;

  /** @internal */
  init(ui: TUI): void;
}

export interface UIInstance {
  view: Container;
  createGameView(): Container;
  initGame(config: IGameConfig): void;

  setScene(scene: string, fast?: boolean): Promise<UIScreen>;
  setScene(scene: BaseGameScenes, fast?: boolean): Promise<UIScreen>;

  getScene(scene: string): UIScreen;
  getScene(scene: BaseGameScenes): UIScreen;

  onResize(width: number, height: number, resolution: number): void;
}

export interface UIConstructor<T extends UIInstance = UIInstance> {
  new (
    events: EventEmitter<UIEvents>,
    stage: Container,
    sizeLandscape?: Size,
    sizePortrait?: Size,
  ): T;
}

export type ScreenConstructor<T extends UIScreen = UIScreen> =
  ModuleConstructor<T>;
export type BaseGameScenes = "Game" | "Load";

export type GameScenes<T extends UIScreen = UIScreen> = RecordLike<
  BaseGameScenes,
  ScreenConstructor<T>
> &
  Record<string, ScreenConstructor<T>>;
