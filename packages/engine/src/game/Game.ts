import { Container, EventEmitter, Ticker } from "pixi.js";
import gsap from "gsap";
import { SystemController } from "./system/SystemController";
import { IGame } from "./IGame";
import { IGameEvents } from "../events/IGameEvents";

export default class Game implements IGame {
  public readonly ticker: Ticker;
  public readonly systems: SystemController;
  public readonly timeline: GSAPTimeline;
  public readonly view: Container;

  constructor(
    public events: EventEmitter<IGameEvents>,
    public config: IGameConfig,
  ) {
    this.view = new Container({
      layout: {
        width: "100%",
        height: "100%",
      },
      sortableChildren: true,
    });

    this.systems = new SystemController(this);
    this.ticker = new Ticker();
    this.timeline = gsap.timeline({ paused: true });

    this.ticker.add((ticker) => this.systems.tick(ticker));

    this.init();
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
