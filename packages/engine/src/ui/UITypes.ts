import { Container, EventEmitter } from "pixi.js";
import { IUIEvents } from "../events/IUIEvents";
import AppScreen from "./components/basic/AppScreen";
import { ModuleConstructor } from "../modules/ModuleManager";

export declare namespace UITypes {
  interface UIClass {
    initGame(config: IGameConfig): void;
    initWrapper(config: IGamesConfig): void;

    setScene(
      scene: BaseGameScenes | BaseWrapperScenes,
      force?: boolean,
    ): Promise<AppScreen>;
    setScene(scene: string, force?: boolean): Promise<AppScreen>;

    showWindow(window: BaseWindows, force?: boolean): Promise<AppScreen>;
    showWindow(window: string, force?: boolean): Promise<AppScreen>;

    hideWindow(force?: boolean): Promise<void>;

    getScene(scene: BaseGameScenes | BaseWrapperScenes): AppScreen;
    getScene(scene: string): AppScreen;

    getWindow(window: BaseWindows): AppScreen;
    getWindow(window: string): AppScreen;

    onResize(width: number, height: number): void;
  }

  interface UIConstructor {
    new (events: EventEmitter<IUIEvents>, view: Container): UIClass;
  }

  type ScreenCtor = ModuleConstructor<AppScreen>;

  type RecordLike<TKey extends string, TValue> = {
    [K in TKey]: TValue;
  };

  type BaseGameScenes = "Game" | "Load" | "Menu" | "Result";
  type BaseWrapperScenes = "Intro";
  type BaseWindows = "Info" | "Pause";

  type GameScenes = RecordLike<BaseGameScenes, ScreenCtor> &
    Record<string, ScreenCtor>;

  type WrapperScenes = RecordLike<BaseWrapperScenes, ScreenCtor> &
    Record<string, ScreenCtor>;

  type UIWindows = RecordLike<BaseWindows, ScreenCtor> &
    Record<string, ScreenCtor>;
}
