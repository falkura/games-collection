import "pixi.js/math-extras";
import { Container, Ticker } from "pixi.js";
import gsap from "gsap";
import { Pane } from "tweakpane";
import { ControlPanel } from "./ControlPanel";

/**
 * Abstract base for every game. Extend and register systems in {@link init}.
 *
 * Drive lifecycle through {@link Engine} — never call lifecycle methods directly.
 */
export abstract class GameController {
  /** PixiJS ticker driving system `tick` hooks and the game-speed slider. */
  public readonly ticker: Ticker;

  /** Master GSAP timeline; each system's timeline is nested here. */
  public readonly timeline: GSAPTimeline;

  /** Tweakpane panel used by {@link ControlPanel}. */
  public readonly pane: Pane;

  /** Game metadata from `game.json`. */
  public readonly config: IGameConfig;

  /** Root display container provided by the engine. */
  public readonly view: Container;

  constructor(config: IGameConfig, view: Container) {
    this.config = config;
    this.view = view;

    this.pane = new Pane();
    this.ticker = new Ticker();
    this.timeline = gsap.timeline({ paused: true });

    ControlPanel.init(this);

    if (__DEV__) {
      globalThis.game = this;
    }
  }

  /**
   * @internal Called by `Engine.startGame`.
   * Override to add custom start logic — call `super.start()`.
   */
  public start() {
    this.ticker.start();
    this.timeline.play();
  }

  /**
   * @internal Called by `Engine.finishGame`.
   * Override to add custom finish logic — call `super.finish(data)`.
   */
  public finish(data: any) {
    this.ticker.stop();
    this.resetTimelines();
  }

  /**
   * @internal Called by `Engine.resetGame`.
   * Override to add custom reset logic — call `super.reset()`.
   */
  public reset() {
    this.ticker.stop();
    this.ticker.speed = 1;
    ControlPanel.reset();
    this.resetTimelines();
  }

  /**
   * @internal Called by the engine on window resize.
   * Override to add custom resize logic — call `super.resize()`.
   */
  public resize() {
    // override me
  }

  protected resetTimelines() {
    this.timeline
      .getChildren(false)
      .forEach(
        (tl: GSAPTween | GSAPTimeline) =>
          tl instanceof gsap.core.Timeline && tl.clear(),
      );
  }
}
