import { Container, Ticker } from "pixi.js";
import { GameController } from "./GameController";

export abstract class System<T extends GameController = GameController> {
  public timeline: GSAPTimeline;
  public game: T;
  public view: Container;
  public enabled: boolean;

  public mount() {}
  public unmount() {}
  public build() {}
  public start() {}
  public finish(data?: any) {}
  public reset() {}
  public resize() {}
  public tick(ticker: Ticker) {}
}
