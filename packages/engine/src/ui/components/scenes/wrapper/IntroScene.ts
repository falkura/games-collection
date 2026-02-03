import { LayoutContainer } from "@pixi/layout/components";
import AppScreen from "../../basic/AppScreen";
import { Text } from "pixi.js";
import GameCard from "../../GameCard";

export default class IntroScene extends AppScreen {
  titleText: Text;
  gamesContainer: LayoutContainer;
  cards: GameCard[] = [];

  constructor(...args: ConstructorParameters<typeof AppScreen>) {
    super(...args);

    this.layout = {
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
      backgroundColor: "#da66a8ff",
    };

    this.titleText = new Text({
      style: {
        fontSize: 26,
        fill: "#ffffffff",
      },
      layout: {
        margin: 15,
        position: "absolute",
        top: 0,
      },
      text: "Games Wrapper",
    });

    this.gamesContainer = new LayoutContainer({
      layout: {
        width: "80%",
        height: "80%",
        overflow: "scroll",
        backgroundColor: "#202020",
        justifyContent: "center",
        alignContent: "flex-start",
        gap: 15,
        padding: 15,
        flexWrap: "wrap",
        borderRadius: 12,
      },
    });

    this.addChild(this.titleText, this.gamesContainer);
  }

  addGames(config: IGamesConfig) {
    Object.values(config).forEach((gameConfig) => {
      this.addGame(gameConfig);
    });
  }

  addGame(gameConfig: IGameConfig) {
    const card = new GameCard({
      config: gameConfig,
      onAboutPress: this.onCardAboutPress.bind(this),
    });

    this.gamesContainer.addChild(card);

    this.cards.push(card);
  }

  onCardAboutPress(gameConfig: IGameConfig) {
    this.ui.showGameInfo(gameConfig);
  }

  public override onWindowShow(): void {
    this.cards.forEach((card) => card.emit("pointerout", undefined));
  }
}
