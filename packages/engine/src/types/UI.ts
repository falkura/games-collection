import { Container, EventEmitter, Size } from "pixi.js";
import { ModuleConstructor } from "../utils/ModuleManager";

export interface UIEvents {
  "ui:restart-game": () => void;
  "ui:change-game-paused": () => void;
  "ui:update-settings": (settings: Partial<UISettings>) => void;
  "wrapper:chose-game": (gameKey: string) => void;
}

export interface UISettings {
  graphics: "Low" | "Medium" | "High";
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
