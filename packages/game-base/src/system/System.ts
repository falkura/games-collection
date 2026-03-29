import { Container, Ticker } from "pixi.js";
import { GameBase } from "../GameBase";

export abstract class System<T extends GameBase = GameBase> {
  public timeline: GSAPTimeline;
  public game: T;
  public view: Container;
  public enabled: boolean;

  public start() {}
  public finish(isWin?: boolean) {}
  public reset() {}
  public pause() {}
  public resume() {}
  public resize() {}
  public tick(ticker: Ticker) {}
}
