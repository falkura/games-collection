import { Application, Assets, ProgressCallback, Ticker, Size } from "pixi.js";
import * as PIXI from "pixi.js";
import gsap from "gsap";
import PixiPlugin from "gsap/PixiPlugin.js";
import "./types/globals";

import { EventSystem } from "./EventSystem";
import { UIConstructor, UIInstance, UISettings } from "./types/UI";
import { GameConstructor, GameInstance } from "./types/Game";

export enum GAME_STATE {
  Init = "Init",
  Started = "Started",
  Paused = "Paused",
  Finished = "Finished",
}

class EngineClass {
  ui: UIInstance;
  game: GameInstance;
  app: Application;
  events: EventSystem;
  wrapperConfig: IGamesConfig;
  gameConfig: IGameConfig;
  state: GAME_STATE;
  graphics: UISettings["graphics"];

  private _manifestName: string;

  constructor() {
    console.log("Engine created");

    this.state = GAME_STATE.Init;
    this.graphics = "High";

    if (__DEV__) {
      globalThis.engine = this;
      globalThis.PIXI = PIXI;
    }
  }

  // #region lifecycle

  public start() {
    if (this.state === GAME_STATE.Init) {
      this.events.internal.emit("engine:game-started");
      this.game.start();
      this.state = GAME_STATE.Started;
    }
  }

  private restartGame() {
    this.resetGame();
    this.start();
  }

  private resetGame() {
    this.game.reset();
    this.state = GAME_STATE.Init;
    this.events.internal.emit("engine:game-reseted");
  }

  private changeGamePause() {
    if (this.state === GAME_STATE.Started) {
      this.pauseGame();
    } else if (this.state === GAME_STATE.Paused) {
      this.resumeGame();
    }
  }

  private pauseGame() {
    this.state = GAME_STATE.Paused;
    this.game.pause();
    this.events.internal.emit("engine:game-paused");
  }

  private resumeGame() {
    this.state = GAME_STATE.Started;
    this.game.resume();
    this.events.internal.emit("engine:game-resumed");
  }

  private onGameFinished(data: any) {
    if (this.state !== GAME_STATE.Finished) {
      this.state = GAME_STATE.Finished;
      this.game.finish();
      this.events.internal.emit("engine:game-finished", data);
    }
  }

  // #endregion lifecycle

  // #region initialization

  public initEvents() {
    this.events = new EventSystem();

    this.events.ui.on("ui:restart-game", this.restartGame, this);
    this.events.ui.on("ui:change-game-paused", this.changeGamePause, this);
    this.events.ui.on("ui:update-settings", this.changeSettings, this);
    this.events.ui.on("wrapper:chose-game", this.onGameChosen, this);

    this.events.game.on("game:finished", this.onGameFinished, this);
  }

  public initGSAP() {
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

  public async initApplication() {
    this.app = new Application();

    await this.app.init({
      backgroundColor: "#1e1e1e",
      preference: "webgpu",
      resolution: window.devicePixelRatio,
      resizeTo: window,
      canvas: canvas,
    });

    root.appendChild(this.app.canvas);

    if (__DEV__) {
      globalThis.app = globalThis.__PIXI_APP__ = this.app;
    }
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

    this.app.renderer.resize(
      window.innerWidth,
      window.innerHeight,
      this.app.renderer.resolution,
    );
  }

  public initGame(Ctor: GameConstructor, config: IGameConfig) {
    this.gameConfig = config;

    if (!this.ui) {
      throw new Error("You must init ui before Game!");
    }
    this.game = new Ctor(this.events.game, config, this.ui);
    this.ui.initGame(config);
  }

  public initWrapper(config: IGamesConfig) {
    this.wrapperConfig = config;
  }

  // #endregion initialization

  // #region loading

  public async loadManifest(
    options?: Partial<{
      basePath: string;
      manifest: string;
    }>,
  ) {
    options ??= {};

    this._manifestName = options.manifest || "manifest.json";
    const basePath = options.basePath || "./assets/";

    await Assets.init({ basePath });

    Assets.add({ src: this._manifestName });
    await Assets.load(this._manifestName);
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

    if (!this._manifestName) {
      await this.loadManifest(options);
    }

    const bundleName = options.defaultBundle || "default";
    const manifest = await Assets.load(this._manifestName);

    // Add and load main bundle
    Assets.addBundle(bundleName, manifest.bundles[0].assets);
    await Assets.loadBundle(bundleName, options.onProgress);
  }

  // #endregion loading

  private onGameChosen(gameKey: string) {
    console.log("Open game:", gameKey);

    this.events.internal.emit("engine:game-chosen", gameKey);
  }

  private changeSettings(opts: Partial<UISettings>) {
    if (typeof opts.graphics === "string") {
      this.graphics = opts.graphics;
    }

    this.events.internal.emit("engine:settings-updated", opts);
  }

  private onResize(width: number, height: number, resolution: number) {
    this.game && this.game.resize();
    this.ui.onResize(width, height, resolution);
  }
}

export const Engine = new EngineClass();
