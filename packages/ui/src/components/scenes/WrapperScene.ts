import { AppScreen } from "../AppScreen";
import { Graphics, Text } from "pixi.js";
import { GameCard } from "../GameCard";
import { LayoutContainer } from "src/layout/LayoutContainer";

export class WrapperScene extends AppScreen {
  gamesContainer: LayoutContainer;

  public override onInit() {
    const background = new LayoutContainer({
      width: "sw",
      height: "sh",
      view: new Graphics().rect(0, 0, 1, 1).fill("#da66a8"),
    });

    const title = new LayoutContainer({
      view: new Text({
        text: "Games Wrapper",
        style: {
          fontSize: 55,
          fill: "#ffffff",
          align: "center",
        },
      }),
      x: "sw/2",
      y: "sh*0.05",
      anchor: 0.5,
    });

    this.gamesContainer = new LayoutContainer({
      width: "sw*0.8",
      height: "sh*0.8",
      x: "sw*0.1",
      y: "sh*0.1",
    });

    const gamesContainerBg = new LayoutContainer({
      width: "pw",
      height: "ph",
      view: new Graphics().rect(0, 0, 1, 1).fill("#252525"),
    });

    this.gamesContainer.addChild(gamesContainerBg);

    this.addChild(background, this.gamesContainer, title);

    Object.values(this.ui.wrapperConfig).forEach((gameConfig) => {
      const card = new GameCard(gameConfig);
      this.gamesContainer.addChild(card);
    });
  }
}
