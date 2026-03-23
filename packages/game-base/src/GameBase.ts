import { Container, EventEmitter, Ticker } from "pixi.js";
import gsap from "gsap";
import { SystemController } from "./system/SystemController";
import { GameEvents, GameInstance } from "@falkura-pet/engine/types/Game";
import { UIInstance } from "@falkura-pet/engine/types/UI";

export abstract class GameBase implements GameInstance {
  public readonly ticker: Ticker;
  public readonly systems: SystemController;
  public readonly timeline: GSAPTimeline;
  public readonly view: Container;

  constructor(
    public readonly events: EventEmitter<GameEvents>,
    public readonly config: IGameConfig,
    public readonly ui: UIInstance,
  ) {
    this.view = ui.view;

    this.view.sortableChildren = true;
    this.systems = new SystemController(this);
    this.ticker = new Ticker();
    this.timeline = gsap.timeline({ paused: true });

    this.ticker.add((ticker) => this.systems.tick(ticker));

    this.init();

    if (__DEV__) {
      globalThis.game = this;
    }
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

  // TODO
  // public save() {}
  // public load() {}
  // public changeDifficulty;
  // public changeLevel;
  // ?
  // private volume;
  // private music;
  // private graphic;

  private _resetTimelines() {
    this.timeline.getChildren(false).forEach((tl: GSAPTimeline) => tl.clear());
  }
}
