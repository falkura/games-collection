import {
  Application,
  Assets,
  Ticker,
  Size,
  EventEmitter,
  Container,
} from "pixi.js";
import * as PIXI from "pixi.js";
import gsap from "gsap";
import PixiPlugin from "gsap/PixiPlugin.js";

import { LoadScene } from "./LoadScene";
import { Layout } from "./Layout";
import { GameController } from "./game/GameController";
import { ControlPanel } from "./game/ControlPanel";

enum GAME_STATE {
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

interface EngineEvents {
  "engine:game-started": () => void;
  "engine:game-finished": (data?: any) => void;
  "engine:game-reseted": () => void;
  "engine:settings-updated": (settings: Partial<UISettings>) => void;
}

interface UISettings {
  graphics: "Low" | "Medium" | "High";
}

/** Options passed to {@link Engine.init}. */
export interface EngineInitOptions {
  /** Game class to instantiate (must extend {@link GameController}). */
  gameCtor: new (config: IGameConfig, view: Container) => GameController;
  /** Contents of `game.json`, passed directly to the game constructor. */
  gameConfig: IGameConfig;
  /** Virtual canvas size in landscape orientation. Default: `1920×1080`. */
  sizeLandscape?: Size;
  /** Virtual canvas size in portrait orientation. Default: swapped landscape dims. */
  sizePortrait?: Size;
  /** Bundle name to load from the manifest. Default: `"default"`. */
  defaultBundle?: string;
  /** Initial graphics quality preset. Default: `"High"`. */
  graphics?: UISettings["graphics"];
  /** Whether the Tweakpane panel opens folded. Default: `true`. */
  controlPanelStartFolded?: boolean;
  /** Hide Tweakpane panel. Default: `false`. */
  hideDebugPane?: boolean;
}

class EngineClass {
  /** PixiJS application. */
  public app: Application;

  /** Typed event bus. Emits lifecycle events (`engine:game-started`, `engine:game-finished`, `engine:game-reseted`, `engine:settings-updated`). */
  public events: EventEmitter<EngineEvents>;

  /** Current graphics quality preset. Change via debug panel. */
  public graphics: UISettings["graphics"];

  private game: GameController;
  private gameConfig: IGameConfig;
  private view: Container;
  private state: GAME_STATE;
  private loadScene: LoadScene;

  constructor() {
    if (__DEV__) {
      globalThis.engine = this;
      globalThis.PIXI = PIXI;
    }
  }

  // #region lifecycle

  /** Transition from `Init` to `Started`. Cascades `start` through all systems and emits `engine:game-started`. No-op if already started. */
  public startGame() {
    if (this.state === GAME_STATE.Init) {
      this.events.emit("engine:game-started");
      this.game.ticker.start();
      this.game.timeline.play();
      this.game.start();
      this.state = GAME_STATE.Started;
    }
  }

  /** Cascade `finish(data)` through all systems and emit `engine:game-finished`. No-op if already finished. */
  public finishGame(data?: any) {
    if (this.state !== GAME_STATE.Finished) {
      this.state = GAME_STATE.Finished;
      this.game.ticker.stop();
      this.resetTimelines();
      this.game.finish(data);
      this.events.emit("engine:game-finished", data);

      this.resize();
    }
  }

  /** Reset to `Init` state, cascade `reset` through all systems, and emit `engine:game-reseted`. */
  public resetGame() {
    this.game.ticker.stop();
    this.game.ticker.speed = 1;
    ControlPanel.reset();
    this.resetTimelines();
    this.game.reset();
    this.state = GAME_STATE.Init;
    this.events.emit("engine:game-reseted");
  }

  private resetTimelines() {
    this.game.timeline
      .getChildren(false)
      .forEach(
        (tl: GSAPTween | GSAPTimeline) =>
          tl instanceof gsap.core.Timeline && tl.clear(),
      );
  }

  private resize(
    width: number = window.innerWidth,
    height: number = window.innerHeight,
    resolution: number = this.app.renderer.resolution,
  ) {
    Layout.resize(width, height, resolution);
    this.app.stage.scale.set(Layout.scale);

    if (this.loadScene) this.loadScene.resize();
    if (this.game) this.game.resize();
  }

  // #endregion lifecycle

  // #region initialization

  /**
   * Bootstrap the engine and the game. Call once from the game entry file.
   *
   * Sequence: creates the PixiJS app, initializes GSAP, shows the load scene,
   * loads the asset bundle, instantiates the game, then triggers the first resize.
   * After this resolves, call {@link startGame}.
   */
  public async init(options: EngineInitOptions) {
    this.state = GAME_STATE.Init;
    this.graphics = options.graphics || "High";

    this.events = new EventEmitter<EngineEvents>();

    ControlPanel.options.startFolded = options.controlPanelStartFolded ?? true;

    await this.initApplication(options.sizeLandscape, options.sizePortrait);
    // this.setupMobileAutoFullscreen();
    this.initGSAP();

    this.showLoad();
    this.resize();
    await this.loadAssets(options);
    this.hideLoad();

    this.gameConfig = options.gameConfig;
    this.game = new options.gameCtor(options.gameConfig, this.view);

    if (options.hideDebugPane) {
      this.game.pane.hidden = true;

      document.documentElement.style.setProperty("--tweakpane-reserved", "0px");
    }

    this.view.visible = true;
    this.applyGraphics();

    this.resize();
  }

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

  private async initApplication(sizeLandscape?: Size, sizePortrait?: Size) {
    this.app = new Application();

    await this.app.init({
      backgroundColor: "#1e1e1e",
      preference: "webgpu",
      resolution: this.targetResolution(),
      antialias: true,
      autoDensity: true,
      resizeTo: window,
      canvas: canvas,
    });

    root.appendChild(this.app.canvas);

    const landscape = sizeLandscape || { width: 1920, height: 1080 };
    const portrait = {
      width: sizePortrait?.width || (sizeLandscape || landscape).height,
      height: sizePortrait?.height || (sizeLandscape || landscape).width,
    };

    Layout.updateTargetDimensions(landscape, portrait);

    this.app.renderer.on("resize", this.resize, this);

    this.view = new Container();
    this.view.sortableChildren = true;
    this.view.visible = false;
    this.app.stage.addChild(this.view);

    if (__DEV__) {
      globalThis.app = globalThis.__PIXI_APP__ = this.app;
      globalThis.layout = Layout;
    }
  }

  // #endregion initialization

  // #region loading

  private showLoad() {
    this.loadScene = new LoadScene();
    this.app.stage.addChild(this.loadScene);
    this.app.ticker.add(this.loadScene.tick, this.loadScene);
  }

  private hideLoad() {
    if (!this.loadScene) return;

    this.app.ticker.remove(this.loadScene.tick, this.loadScene);
    this.app.stage.removeChild(this.loadScene);
    this.loadScene.destroy();
    this.loadScene = undefined;
  }

  private async loadAssets(
    options: Partial<{
      defaultBundle: string;
    }>,
  ) {
    await Assets.init({ basePath: "./assets/" });

    const manifestName = "manifest.json";
    Assets.add({ src: manifestName });

    const manifest = await Assets.load(manifestName);
    const bundleName = options.defaultBundle || "default";

    Assets.addBundle(bundleName, manifest.bundles[0].assets);
    await Assets.loadBundle(bundleName);
  }

  // #endregion loading

  // #region graphics settings

  /** Apply new settings at runtime. Adjusts renderer resolution and max FPS, then emits `engine:settings-updated`. */
  public changeSettings(opts: Partial<UISettings>) {
    if (opts.graphics) {
      this.graphics = opts.graphics;
      this.applyGraphics();
    }

    this.events.emit("engine:settings-updated", opts);
  }

  private targetResolution(): number {
    const dpr = window.devicePixelRatio || 1;
    return dpr * GRAPHICS_PRESETS[this.graphics].resolutionScale;
  }

  /** Renderer resolution capped at 1. Pass as `resolution` to `HTMLText` / `BitmapText` for correct sharpness. */
  public get textResolution() {
    return Math.min(this.app.renderer.resolution, 1);
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

  // #endregion graphics settings

  // #region fullscreen

  private requestFullscreen(target: any) {
    if (document.fullscreenElement !== null) return;

    target.webkitRequestFullScreen
      ? target.webkitRequestFullScreen()
      : target.mozRequestFullScreen
        ? target.mozRequestFullScreen()
        : target.requestFullScreen && target.requestFullScreen();
  }

  private setupMobileAutoFullscreen() {
    if (!Layout?.isMobile) return;

    for (const eventName of ["pointerdown", "touchstart"]) {
      document.addEventListener(
        eventName,
        () => this.requestFullscreen(document.body),
        { passive: true },
      );
    }
  }

  // #endregion fullscreen
}

export const Engine = new EngineClass();
