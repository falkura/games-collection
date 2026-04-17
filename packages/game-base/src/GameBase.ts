import "pixi.js/math-extras";
import { Container, EventEmitter, Ticker } from "pixi.js";
import gsap from "gsap";
import { SystemController } from "./system/SystemController";
import { GameInstance } from "@falkura-pet/engine/types/Game";
import { Engine } from "@falkura-pet/engine";
import { Pane } from "tweakpane";
import { ControlPanel } from "./ControlPanel";

export abstract class GameBase implements GameInstance {
  public readonly ticker: Ticker;
  public readonly systems: SystemController;
  public readonly timeline: GSAPTimeline;
  public readonly view: Container;
  public readonly pane: Pane;

  constructor(public readonly config: IGameConfig) {
    this.view = Engine.view;
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

  public onSystemAdded(system: string) {
    if (!ControlPanel.initialized) return;

    ControlPanel.onSystemAdded(system, this);
  }

  // Register systems here
  protected init() {
    // override me
  }

  public start() {
    this.systems.start();
    this.ticker.start();
    this.timeline.play();
  }

  public finish() {
    this.ticker.stop();
    this._resetTimelines();
    this.systems.finish();
  }

  public reset() {
    this.ticker.stop();
    this.ticker.speed = 1;
    ControlPanel.reset();

    this._resetTimelines();
    this.systems.reset();
  }

  public pause() {
    this.ticker.stop();
    this.timeline.pause();
    this.systems.pause();
  }

  public resume() {
    this.ticker.start();
    this.timeline.resume();
    this.systems.resume();
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
