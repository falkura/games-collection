import { Application, Assets, ProgressCallback, Ticker, Size } from "pixi.js";
import * as PIXI from "pixi.js";
import gsap from "gsap";
import PixiPlugin from "gsap/PixiPlugin.js";
import "./types/globals";

import { EventSystem } from "./EventSystem";
import { UIConstructor, UIInstance, UISettings } from "./types/UI";
import { GameConstructor, GameInstance } from "./types/Game";

class EngineClass {
  ui: UIInstance;
  game: GameInstance;
  app: Application;
  events: EventSystem;

  constructor() {
    console.log("Engine created");

    this.initGSAP();
    this.initEvents();

    if (__DEV__) {
      globalThis.engine = this;
    }
  }

  private initEvents() {
    this.events = new EventSystem();

    this.events.ui.on("ui:start-game", this.startGame, this);
    this.events.ui.on("ui:restart-game", this.restartGame, this);
    this.events.ui.on("ui:pause-game", this.pauseGame, this);
    this.events.ui.on("ui:resume-game", this.resumeGame, this);
    this.events.ui.on("ui:close-game", this.closeGame, this);
    this.events.ui.on("ui:update-settings", this.changeSettings, this);

    this.events.game.on("game:finished", this.onGameFinished, this);
  }

  private closeGame() {}
  private startGame() {}
  private restartGame() {}
  private pauseGame() {}
  private resumeGame() {}
  private changeSettings(settings: Partial<UISettings>) {}
  private onGameFinished(data: any) {}

  private initGSAP() {
    gsap.registerPlugin(PixiPlugin);
    PixiPlugin.registerPIXI(PIXI);

    gsap.ticker.remove(gsap.updateRoot);

    Ticker.shared.add(({ lastTime }) => {
      gsap.updateRoot(lastTime / 1000);
    });

    if (__DEV__) {
      globalThis.gsap = gsap;
    }
  }

  public async init() {
    this.app = new Application();

    await this.app.init({
      backgroundColor: "#272727",
      preference: "webgpu",
      resolution: window.devicePixelRatio,
      resizeTo: window,
      canvas: canvas,
    });

    root.appendChild(this.app.canvas);

    if (__DEV__) {
      globalThis.app = globalThis.__PIXI_APP__ = this.app;
      globalThis.PIXI = PIXI;
    }
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

  public initUI(
    Ctor: UIConstructor,
    sizeLandscape?: Size,
    sizePortrait?: Size,
  ) {
    this.ui = new Ctor(
      this.events.ui,
      this.app.stage,
      sizeLandscape,
      sizePortrait,
    );

    this.app.renderer.on("resize", this.onResize, this);

    this.app.renderer.emit(
      "resize",
      window.innerWidth,
      window.innerHeight,
      this.app.renderer.resolution,
    );
  }

  private onResize(width: number, height: number, resolution: number) {
    this.ui.onResize(width, height, resolution);
  }

  public initGame(Ctor: GameConstructor, config: IGameConfig) {
    if (!this.ui) {
      throw new Error("You must init ui before Game!");
    }
    this.game = new Ctor(this.events.game, config, this.ui);
    this.ui.initGame(config);
  }

  public initWrapper(config: IGamesConfig) {
    this.ui.initWrapper(config);
  }
}

export const Engine = new EngineClass();
