import { Container, Ticker } from "pixi.js";
import Game from "../Game";

export abstract class System<T extends Game = Game> {
  public timeline: GSAPTimeline;
  public game: T;
  public view: Container;
  public enabled: boolean;

  public start() {}
  public finish(isWin?: boolean) {}
  public reset() {}
  public pause() {}
  public resume() {}
  public tick(ticker: Ticker) {}
}
