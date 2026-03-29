import { AppScreen } from "./AppScreen";
import { Graphics, Text } from "pixi.js";
import { LayoutContainer } from "../layout/LayoutContainer";

export class GameScene extends AppScreen {
  background: LayoutContainer<Graphics>;
  gameContainer: LayoutContainer;

  public override onInit(): void {
    this.background = new LayoutContainer({
      width: "sw",
      height: "sh",
      view: new Graphics().rect(0, 0, 1, 1).fill("#1e1e1e"),
    });

    this.gameContainer = this.ui.view;

    this.addChild(this.background, this.gameContainer);
  }
}
