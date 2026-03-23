import { Container, EventEmitter } from "pixi.js";
import { ModuleConstructor } from "../utils/ModuleManager";

export interface UIEvents {
  "ui:start-game": () => void;
  "ui:restart-game": () => void;
  "ui:pause-game": () => void;
  "ui:resume-game": () => void;
  "ui:hint-game": () => void;

  "ui:set-level": (level: number) => void;
  "ui:set-difficulty": (level: number) => void;
  "ui:set-settings": (settings: Partial<UISettings>) => void;

  "ui:open-menu": () => void;
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
  initGame(config: IGameConfig): void;
  createView(): Container;
  initWrapper(config: IGamesConfig): void;

  setScene(scene: string, force?: boolean): Promise<UIScreen>;
  showWindow(window: string, force?: boolean): Promise<UIScreen>;
  hideWindow(force?: boolean): Promise<void>;

  getScene(scene: string): UIScreen;
  getWindow(window: string): UIScreen;

  onResize(width: number, height: number, resolution: number): void;
}

export interface UIConstructor<T extends UIInstance = UIInstance> {
  new (events: EventEmitter<UIEvents>, view: Container): T;
}

export type ScreenConstructor<T extends UIScreen = UIScreen> =
  ModuleConstructor<T>;
export type SceneMap = Record<string, ScreenConstructor>;
export type WindowMap = Record<string, ScreenConstructor>;
export type BaseGameScenes = "Game" | "Load" | "Menu" | "Result";
export type BaseWrapperScenes = "Intro";
export type BaseWindows = "Info" | "Pause";

export type GameScenes<T extends UIScreen = UIScreen> = RecordLike<
  BaseGameScenes,
  ScreenConstructor<T>
> &
  Record<string, ScreenConstructor<T>>;

export type WrapperScenes<T extends UIScreen = UIScreen> = RecordLike<
  BaseWrapperScenes,
  ScreenConstructor<T>
> &
  Record<string, ScreenConstructor<T>>;

export type GameWindows<T extends UIScreen = UIScreen> = RecordLike<
  BaseWindows,
  ScreenConstructor<T>
> &
  Record<string, ScreenConstructor<T>>;
