import "@pixi/layout"; // required to ensure all systems and mixins are registered
import { Application, Assets, ProgressCallback, Ticker } from "pixi.js";
import * as PIXI from "pixi.js";
import gsap from "gsap";
import PixiPlugin from "gsap/PixiPlugin.js";
import "./types";

import { EventSystem } from "./events/EventSystem";
import { IGameFinishData } from "./events/IGameEvents";
import { ISettings, UIEvent } from "./events/IUIEvents";
import { GameConstructor, IGame } from "./game/IGame";
import { UITypes } from "./ui/UITypes";

/**
 * [Icons](https://marella.github.io/material-design-icons/demo/font/)
 */
class EngineClass {
  ui: UITypes.UIClass;
  game: IGame;
  app: Application;
  events: EventSystem;

  constructor() {
    console.log("Engine created");

    this.initGSAP();
    this.initEvents();

    globalThis.engine = this;
  }

  private initEvents() {
    this.events = new EventSystem();

    this.events.ui.on(UIEvent.StartGame, this.startGame, this);
    this.events.ui.on(UIEvent.RestartGame, this.restartGame, this);
    this.events.ui.on(UIEvent.PauseGame, this.pauseGame, this);
    this.events.ui.on(UIEvent.ResumeGame, this.resumeGame, this);
    this.events.ui.on(UIEvent.UseHint, this.hintGame, this);

    this.events.ui.on(UIEvent.SetLevel, this.changeLevel, this);
    this.events.ui.on(UIEvent.SetDifficulty, this.changeDifficulty, this);
    this.events.ui.on(UIEvent.SetSettings, this.changeSettings, this);

    this.events.ui.on(UIEvent.OpenMenu, this.backToMenu, this);

    // TODO make enums
    this.events.game.on("game:finished", this.onGameFinished, this);
  }

  private startGame() {}
  private restartGame() {}
  private pauseGame() {}
  private resumeGame() {}
  private hintGame() {}

  private changeLevel(level: number) {}
  private changeDifficulty(level: number) {}
  private changeSettings(settings: Partial<ISettings>) {}

  private backToMenu() {}

  private onGameFinished(data: Partial<IGameFinishData>) {}

  private initGSAP() {
    gsap.registerPlugin(PixiPlugin);
    PixiPlugin.registerPIXI(PIXI);

    gsap.ticker.remove(gsap.updateRoot);

    Ticker.shared.add(({ lastTime }) => {
      gsap.updateRoot(lastTime / 1000);
    });

    globalThis.gsap = gsap;
  }

  public async init() {
    this.app = new Application();

    await this.app.init({
      backgroundAlpha: 0,
      preference: "webgpu",
      resizeTo: window,
      antialias: true,
    });

    root.appendChild(this.app.canvas);

    globalThis.app = globalThis.__PIXI_APP__ = this.app;
    globalThis.PIXI = PIXI;
  }

  public async loadAssets(
    options?: Partial<{
      onProgress: ProgressCallback;
      basePath: string;
      manifest: string;
      defaultBundle: string;
    }>,
  ) {
    options ??= {};

    const manifestName = options.manifest || "manifest.json";
    const basePath = options.basePath || "./assets/";
    const bundleName = options.defaultBundle || "default";

    await Assets.init({ basePath });

    // Add and load manifest file first
    Assets.add({ src: manifestName });
    const manifest = await Assets.load(manifestName);

    // Loader assets bundle can be added here

    // Add and load main bundle
    Assets.addBundle(bundleName, manifest.bundles[0].assets);
    await Assets.loadBundle(bundleName, options.onProgress);
  }

  public initUI(Ctor: UITypes.UIConstructor) {
    this.ui = new Ctor(this.events.ui, this.app.stage);

    this.app.renderer.on("resize", (width: number, height: number) => {
      this.ui.onResize(width, height);
    });

    this.ui.onResize(this.app.screen.width, this.app.screen.height);
  }

  public initGame(Ctor: GameConstructor, config: IGameConfig) {
    this.game = new Ctor(this.events.game, config);
    this.ui.initGame(config);
  }

  public initWrapper(config: IGamesConfig) {
    this.ui.initWrapper(config);
  }
}

const Engine = new EngineClass();

export default Engine;
