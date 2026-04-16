import { Container, EventEmitter, Size, Ticker } from "pixi.js";
import { ScenesController } from "./components/ScenesController";
import { GameScene } from "./components/GameScene";
import { LoadScene } from "./components/LoadScene";
import { AppScreen } from "./components/AppScreen";

import type {
  UIInstance,
  UIEvents,
  GameScenes,
  BaseGameScenes,
} from "@falkura-pet/engine/types/UI";

import { LayoutManager } from "./layout/LayoutManager";
import { LayoutContainer } from "./layout/LayoutContainer";
import "./layout/LayoutHandlers";

export class UI implements UIInstance {
  layout: LayoutManager;
  scenes: ScenesController;
  ticker: Ticker;

  gameConfig: IGameConfig;
  /**
   * UI.view is main game container to work with. It created in view
   * constructor but added to the stage in GameScene.onInit method
   */
  view: LayoutContainer;

  constructor(
    public events: EventEmitter<UIEvents>,
    public stage: Container,
    sizeLandscape?: Size,
    sizePortrait?: Size,
  ) {
    const landscape = sizeLandscape || { width: 1920, height: 1080 };
    const portrait = {
      width: sizePortrait?.width || (sizeLandscape || landscape).height,
      height: sizePortrait?.height || (sizeLandscape || landscape).width,
    };

    this.layout = new LayoutManager(stage, {
      width: landscape.width,
      height: landscape.height,
      portrait: {
        width: portrait.width,
        height: portrait.height,
      },
    });

    this.view = new LayoutContainer({
      width: "sw",
      height: "sh",
    });

    this.ticker = new Ticker();
    this.ticker.start();

    if (__DEV__) {
      globalThis.ui = this;
    }
  }

  public createGameView(): LayoutContainer {
    return new LayoutContainer({
      width: "sw",
      height: "sh",
    });
  }

  public initGame(config: IGameConfig) {
    this.gameConfig = config;

    this.scenes = new ScenesController(this);
    this.stage.addChild(this.scenes.view);

    const scenes = this.createGameScenes();

    for (const key in scenes) {
      const _scene = scenes[key];
      _scene.MODULE_ID = key;
      this.scenes.add(_scene);
    }
  }

  // Override this method to override scenes
  protected createGameScenes(): GameScenes<AppScreen> {
    return {
      Game: GameScene,
      Load: LoadScene,
    };
  }

  public setScene(scene: BaseGameScenes, fast?: boolean): Promise<AppScreen>;
  public setScene(scene: string, fast?: boolean): Promise<AppScreen>;
  public setScene(scene: string, fast?: boolean): Promise<AppScreen> {
    return new Promise((resolve) => resolve(this.scenes.set(scene)));
  }

  public getScene<T extends AppScreen = AppScreen>(scene: BaseGameScenes): T;
  public getScene<T extends AppScreen = AppScreen>(scene: string): T;
  public getScene<T extends AppScreen = AppScreen>(scene: string): T {
    return this.scenes.get(scene) as T;
  }

  public onResize(width: number, height: number, resolution: number) {
    this.layout.resize(width, height, resolution);
  }
}
