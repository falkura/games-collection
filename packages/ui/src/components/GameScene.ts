import { AppScreen } from "./AppScreen";
import { Graphics, Text } from "pixi.js";
import { LayoutContainer } from "../layout/LayoutContainer";

export class GameScene extends AppScreen {
  background: LayoutContainer<Graphics>;
  gameContainer: LayoutContainer;
  gameLabel: LayoutContainer<Text>;

  public override onInit(): void {
    this.background = new LayoutContainer({
      width: "sw",
      height: "sh",
      view: new Graphics().rect(0, 0, 1, 1).fill("#252525"),
    });

    this.gameContainer = this.ui.view;

    this.gameLabel = new LayoutContainer({
      x: 10,
      y: 10,
      view: new Text({
        style: {
          fontSize: 44,
          fill: "#a9a9a9",
        },
        zIndex: 1000,
        text: this.ui.gameConfig.title,
      }),
    });

    this.addChild(this.background, this.gameContainer, this.gameLabel);
  }
}
