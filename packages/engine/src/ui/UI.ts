import { Container, EventEmitter, Ticker } from "pixi.js";
import ScenesController from "./components/controllers/ScenesController";
import WindowsController from "./components/controllers/WindowsController";
import { Background } from "./components/basic/Background";
import { IUIEvents, UIEvent } from "../events/IUIEvents";
import GameScene from "./components/scenes/GameScene";
import LoadScene from "./components/scenes/LoadScene";
import MenuScene from "./components/scenes/MenuScene";
import ResultScene from "./components/scenes/ResultScene";
import IntroScene from "./components/scenes/wrapper/IntroScene";
import InfoWindow from "./components/windows/InfoWindow";
import PauseWindow from "./components/windows/PauseWindow";
import { UITypes } from "./UITypes";
import AppScreen from "./components/basic/AppScreen";

export default class UI implements UITypes.UIClass {
  scenes: ScenesController;
  windows: WindowsController;
  background: Background;

  ticker: Ticker;

  gameConfig: IGameConfig;

  constructor(
    public events: EventEmitter<IUIEvents>,
    public view: Container,
  ) {
    globalThis.ui = this;

    this.view.layout = {
      alignItems: "center",
      justifyContent: "center",
    };

    this.ticker = new Ticker();
    this.ticker.start();

    this.background = new Background({
      // todo
      texture: undefined,
    });

    this.scenes = new ScenesController(this);
    this.windows = new WindowsController(this);

    // TODO make it as render layers https://pixijs.com/8.x/guides/concepts/render-layers
    this.view.addChild(this.background, this.scenes.view, this.windows.view);
  }

  public onInfo() {
    if (this.gameConfig) {
      this.events.emit(UIEvent.PauseGame);

      this.showGameInfo(this.gameConfig);
    } else {
      console.error("No game config");
    }
  }

  public onPlay() {
    // todo let engine decide to start the game
    this.setScene("Game", false);
  }

  public onCloseInfo() {
    this.hideWindow().then(() => this.events.emit(UIEvent.ResumeGame));
  }

  public showGameInfo(gameConfig: IGameConfig) {
    const window = this.getWindow<InfoWindow>("Info");

    window.setData({
      title: gameConfig.title,
      description: gameConfig.description,
    });

    this.showWindow("Info");
  }

  public initGame(config: IGameConfig) {
    this.gameConfig = config;

    const scenes = this.createGameScenes();

    for (const key in scenes) {
      const _scene = scenes[key];
      _scene.MODULE_ID = key;
      this.scenes.add(_scene);
    }

    const windows = this.createWindows();

    for (const key in windows) {
      const _window = windows[key];
      _window.MODULE_ID = key;
      this.windows.add(_window);
    }

    // todo check if engine should do that
    this.setScene("Menu", true);
  }

  public initWrapper(config: IGamesConfig) {
    const scenes = this.createWrapperScenes();

    for (const key in scenes) {
      const _scene = scenes[key];
      _scene.MODULE_ID = key;
      this.scenes.add(_scene);
    }

    const windows = this.createWindows();

    for (const key in windows) {
      const _window = windows[key];
      _window.MODULE_ID = key;
      this.windows.add(_window);
    }

    // todo check if engine should do that
    this.showWrapper(config);
  }

  protected showWrapper(config: IGamesConfig) {
    const intro = this.getScene<IntroScene>("Intro");

    intro.addGames(config);

    this.setScene("Intro", true);
  }

  // Override this method to override scenes
  protected createGameScenes(): UITypes.GameScenes {
    return {
      Game: GameScene,
      Load: LoadScene,
      Menu: MenuScene,
      Result: ResultScene,
    };
  }

  // Override this method to override scenes
  protected createWrapperScenes(): UITypes.WrapperScenes {
    return {
      Intro: IntroScene,
    };
  }

  // Override this method to override scenes
  protected createWindows(): UITypes.UIWindows {
    return {
      Info: InfoWindow,
      Pause: PauseWindow,
    };
  }

  public setScene(
    scene: UITypes.BaseGameScenes | UITypes.BaseWrapperScenes,
    force?: boolean,
  ): Promise<AppScreen>;
  // Yeap, you need to do a bunch of shenanigans to make things work in typescript
  public setScene(scene: string, force?: boolean): Promise<AppScreen>;
  public setScene(scene: string, force?: boolean): Promise<AppScreen> {
    this.hideWindow(true);

    return this.scenes.show(scene, force);
  }

  public showWindow(
    window: UITypes.BaseWindows,
    force?: boolean,
  ): Promise<AppScreen>;
  public showWindow(window: string, force?: boolean): Promise<AppScreen>;
  public showWindow(window: string, force?: boolean): Promise<AppScreen> {
    this.scenes.onWindowShow();

    return this.windows.show(window, force);
  }

  public hideWindow(force?: boolean): Promise<void> {
    const result = this.windows.hide(force);

    if (!result) return;

    const { promise, last } = result;

    this.scenes.onWindowHide(last);

    return promise;
  }

  public getScene<T extends AppScreen = AppScreen>(
    scene: UITypes.BaseGameScenes | UITypes.BaseWrapperScenes,
  ): T;
  public getScene<T extends AppScreen = AppScreen>(scene: string): T;
  public getScene<T extends AppScreen = AppScreen>(scene: string): T {
    return this.scenes.get(scene);
  }

  public getWindow<T extends AppScreen = AppScreen>(
    window: UITypes.BaseWindows,
  ): T;
  public getWindow<T extends AppScreen = AppScreen>(window: string): T;
  public getWindow<T extends AppScreen = AppScreen>(window: string): T {
    return this.windows.get(window);
  }

  public onResize(width: number, height: number) {
    this.view.layout = { width, height };
  }
}
