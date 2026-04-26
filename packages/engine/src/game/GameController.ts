import "pixi.js/math-extras";
import { Container, Ticker } from "pixi.js";
import gsap from "gsap";
import { Pane } from "tweakpane";
import { ControlPanel } from "./ControlPanel";

/**
 * Abstract base for every game.
 *
 * Drive lifecycle through {@link Engine} — never call lifecycle methods directly.
 */
export abstract class GameController {
  /** PixiJS ticker. */
  public readonly ticker: Ticker;

  /** Master GSAP timeline. */
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
   * Called by `Engine.startGame`.
   */
  public start() {}

  /**
   * Called by `Engine.finishGame(data)`.
   */
  public finish(data: any) {}

  /**
   * Called by `Engine.resetGame`.
   */
  public reset() {}

  /**
   * Called by the engine on window resize.
   */
  public resize() {}
}
