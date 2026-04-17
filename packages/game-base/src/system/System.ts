import { Container, Ticker } from "pixi.js";
import { GameBase } from "../GameBase";
import { LayoutContainer } from "@falkura-pet/engine";

export abstract class System<T extends GameBase = GameBase> {
  public timeline: GSAPTimeline;
  public game: T;
  public view: LayoutContainer;
  public enabled: boolean;

  public start() {}
  public finish(data?: any) {}
  public reset() {}
  public resize() {}
  public tick(ticker: Ticker) {}
}
