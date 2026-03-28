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
      view: new Graphics().rect(0, 0, 1, 1).fill("#1e1e1e"),
    });

    this.gameContainer = this.ui.view;

    this.gameLabel = new LayoutContainer({
      x: 10,
      y: 10,
      view: new Text({
        style: {
          fill: "#6f6f6f",
        },
        zIndex: 1,
        text: this.ui.gameConfig.title,
      }),
      onResize(this: LayoutContainer<Text>) {
        this.view.style.fontSize = 24;
      },
      portrait: {
        onResize(this: LayoutContainer<Text>) {
          this.view.style.fontSize = 34;
        },
      },
    });

    this.addChild(this.background, this.gameContainer, this.gameLabel);
  }
}
