import "pixi.js/math-extras";
import { Container, Ticker } from "pixi.js";
import gsap from "gsap";
import { SystemController } from "./SystemController";
import { Pane } from "tweakpane";
import { ControlPanel } from "./ControlPanel";

export abstract class GameController {
  public readonly ticker: Ticker;
  public readonly systems: SystemController;
  public readonly timeline: GSAPTimeline;
  public readonly pane: Pane;

  constructor(
    public readonly config: IGameConfig,
    public readonly view: Container,
  ) {
    this.pane = new Pane();

    this.systems = new SystemController(this);
    this.ticker = new Ticker();
    this.timeline = gsap.timeline({ paused: true });

    this.ticker.add((ticker) => this.systems.tick(ticker));

    ControlPanel.init(this);
    this.init();

    if (__DEV__) {
      globalThis.game = this;
    }
  }

  public init() {
    // override me
  }

  public start() {
    this.systems.start();
    this.ticker.start();
    this.timeline.play();
  }

  public finish(data: any) {
    this.ticker.stop();
    this._resetTimelines();
    this.systems.finish(data);
  }

  public reset() {
    this.ticker.stop();
    this.ticker.speed = 1;
    ControlPanel.reset();

    this._resetTimelines();
    this.systems.reset();
  }

  public resize() {
    this.systems.resize();
  }

  private _resetTimelines() {
    this.timeline
      .getChildren(false)
      .forEach(
        (tl: GSAPTween | GSAPTimeline) =>
          tl instanceof gsap.core.Timeline && tl.clear(),
      );
  }
}
