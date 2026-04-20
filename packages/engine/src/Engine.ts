import {
  Application,
  Assets,
  ProgressCallback,
  Ticker,
  Size,
  EventEmitter,
} from "pixi.js";
import * as PIXI from "pixi.js";
import gsap from "gsap";
import PixiPlugin from "gsap/PixiPlugin.js";
import "./types/globals";

import { EngineEvents, UISettings } from "./types/EngineEvents";
import { GameConstructor, GameInstance } from "./types/Game";
import { LayoutManager } from "./layout/LayoutManager";
import { LayoutContainer } from "./layout/LayoutContainer";
import { LoadScene } from "./scenes/LoadScene";

export enum GAME_STATE {
  Init = "Init",
  Started = "Started",
  Finished = "Finished",
}

const GRAPHICS_PRESETS: Record<
  UISettings["graphics"],
  { resolutionScale: number; maxFPS: number }
> = {
  High: { resolutionScale: 1, maxFPS: 120 },
  Medium: { resolutionScale: 0.85, maxFPS: 60 },
  Low: { resolutionScale: 0.5, maxFPS: 30 },
};

class EngineClass {
  game: GameInstance;
  app: Application;
  events: EventEmitter<EngineEvents>;
  layout: LayoutManager;
  loadScene: LoadScene;
  view: LayoutContainer;
  wrapperConfig: IGamesConfig;
  gameConfig: IGameConfig;
  state: GAME_STATE;
  graphics: UISettings["graphics"];

  private _manifestName: string;

  constructor() {
    this.state = GAME_STATE.Init;
    this.graphics = "High";

    if (__DEV__) {
      globalThis.engine = this;
      globalThis.PIXI = PIXI;
    }
  }

  // #region lifecycle

  public startGame() {
    if (this.state === GAME_STATE.Init) {
      this.events.emit("engine:game-started");
      this.game.start();
      this.state = GAME_STATE.Started;
    }
  }

  public restartGame() {
    this.resetGame();
    this.startGame();
  }

  public finishGame(data?: any) {
    if (this.state !== GAME_STATE.Finished) {
      this.state = GAME_STATE.Finished;
      this.game.finish(data);
      this.events.emit("engine:game-finished", data);
    }
  }

  private resetGame() {
    this.game.reset();
    this.state = GAME_STATE.Init;
    this.events.emit("engine:game-reseted");
  }

  // #endregion lifecycle

  // #region initialization

  public initEvents() {
    this.events = new EventEmitter<EngineEvents>();
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

  public async initApplication(sizeLandscape?: Size, sizePortrait?: Size) {
    this.app = new Application();

    await this.app.init({
      backgroundColor: "#1e1e1e",
      preference: "webgpu",
      resolution: this.targetResolution(),
      antialias: true,
      resizeTo: window,
      canvas: canvas,
    });

    this.applyGraphics();

    root.appendChild(this.app.canvas);

    const landscape = sizeLandscape || { width: 1920, height: 1080 };
    const portrait = {
      width: sizePortrait?.width || (sizeLandscape || landscape).height,
      height: sizePortrait?.height || (sizeLandscape || landscape).width,
    };

    this.layout = new LayoutManager(this.app.stage, {
      width: landscape.width,
      height: landscape.height,
      portrait: { width: portrait.width, height: portrait.height },
    });

    this.app.renderer.on("resize", this.onResize, this);
    this.app.renderer.resize(
      window.innerWidth,
      window.innerHeight,
      this.app.renderer.resolution,
    );

    this.view = new LayoutContainer({ width: "sw", height: "sh" });
    this.view.sortableChildren = true;
    this.view.visible = false;

    this.loadScene = new LoadScene();

    this.app.stage.addChild(this.view, this.loadScene);
    this.app.ticker.add(this.loadScene.tick, this.loadScene);

    // this.setupMobileAutoFullscreen();

    if (__DEV__) {
      globalThis.app = globalThis.__PIXI_APP__ = this.app;
      globalThis.layout = this.layout;
    }
  }

  public initGame(Ctor: GameConstructor, config: IGameConfig) {
    this.gameConfig = config;

    if (!this.app) {
      throw new Error("You must call initApplication before initGame!");
    }

    this.game = new Ctor(config);

    this.loadScene.visible = false;
    this.view.visible = true;
    this.app.ticker.remove(this.loadScene.tick, this.loadScene);
    this.app.stage.removeChild(this.loadScene);

    this.applyGraphics();
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

    Assets.addBundle(bundleName, manifest.bundles[0].assets);
    await Assets.loadBundle(bundleName, options.onProgress);
  }

  // #endregion loading

  public chooseGame(gameKey: string) {
    console.log("Open game:", gameKey);

    this.events.emit("engine:game-chosen", gameKey);

    window.location.href = gameKey;
  }

  public changeSettings(opts: Partial<UISettings>) {
    if (typeof opts.graphics === "string") {
      this.graphics = opts.graphics;
      this.applyGraphics();
    }

    this.events.emit("engine:settings-updated", opts);
  }

  private targetResolution(): number {
    const dpr = window.devicePixelRatio || 1;
    return dpr * GRAPHICS_PRESETS[this.graphics].resolutionScale;
  }

  public get textResolution() {
    return Math.min(this.app.renderer.resolution, 1.5)
  }

  private applyGraphics() {
    const { maxFPS } = GRAPHICS_PRESETS[this.graphics];
    const resolution = this.targetResolution();

    Ticker.shared.maxFPS = maxFPS;

    if (this.app) {
      this.app.ticker.maxFPS = maxFPS;
      if (this.app.renderer.resolution !== resolution) {
        this.app.renderer.resize(
          window.innerWidth,
          window.innerHeight,
          resolution,
        );
      }
    }

    if (this.game) {
      this.game.ticker.maxFPS = maxFPS;
    }
  }

  private onResize(width: number, height: number, resolution: number) {
    if (this.layout) this.layout.resize(width, height, resolution);
    if (this.game) this.game.resize();
  }

  private requestFullscreen(target: any) {
    if (document.fullscreenElement !== null) return;

    target.webkitRequestFullScreen
      ? target.webkitRequestFullScreen()
      : target.mozRequestFullScreen
        ? target.mozRequestFullScreen()
        : target.requestFullScreen && target.requestFullScreen();
  }

  private setupMobileAutoFullscreen() {
    if (!this.layout?.isMobile) return;

    for (const eventName of ["pointerdown", "touchstart"]) {
      document.addEventListener(
        eventName,
        () => this.requestFullscreen(document.body),
        { passive: true },
      );
    }
  }
}

export const Engine = new EngineClass();
