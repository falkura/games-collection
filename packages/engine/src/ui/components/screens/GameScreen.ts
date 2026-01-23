import {
  LayoutContainer,
  LayoutContainerOptions,
} from "@pixi/layout/components";
import AppScreen from "../basic/AppScreen";
import UI from "../../UI";
import SVGButton from "../SVGButton";
import { Text } from "pixi.js";

import pause from "@material-design-icons/svg/outlined/pause.svg";
import lightbulb from "@material-design-icons/svg/outlined/lightbulb.svg";
import info from "@material-design-icons/svg/outlined/info.svg";

declare global {
  interface ScreensMap {
    game: GameScreen;
  }
}

export class GameScreen extends AppScreen {
  pauseButton: SVGButton;
  hintButton: SVGButton;
  infoButton: SVGButton;
  topBar: LayoutContainer;
  time: Text;
  gameName: Text;
  level: Text;
  difficulty: Text;

  gameView: LayoutContainer;

  constructor(options?: LayoutContainerOptions) {
    super({
      ...options,
    });

    this.layout = {
      justifyContent: "flex-start",
      alignItems: "center",
      flexDirection: "column",
      backgroundColor: "#7666daff",
    };

    this.topBar = new LayoutContainer({
      layout: {
        width: "100%",
        height: 30,
        backgroundColor: "#00000088",
      },
    });

    this.gameView = new LayoutContainer({
      layout: {
        width: "100%",
        height: "100%",
      },
    });

    this.addChild(this.topBar, this.gameView);

    this.gameName = new Text({
      style: {
        fontSize: 20,
        fill: "#ffffffff",
      },
      layout: {
        position: "absolute",
        top: 3,
        left: 5,
      },
      text: UI.data.gameName,
    });

    this.time = new Text({
      style: {
        fontSize: 20,
        fill: "#ffffffff",
      },
      layout: {
        position: "absolute",
        top: 3,
        right: 5,
      },
      text: "09:16",
    });

    this.addChild(this.gameName, this.time);

    const buttonsContainer = new LayoutContainer({
      layout: {
        position: "absolute",
        flexDirection: "column",
        right: 0,
        gap: 10,
        margin: 10,
      },
    });

    this.pauseButton = new SVGButton({
      svg: pause,
      color: "#353535ff",
      layout: {
        width: 60,
        height: 60,
        paddingInline: 15,
        paddingBlock: 14,
      },
    });

    this.hintButton = new SVGButton({
      svg: lightbulb,
      color: "#353535ff",
      layout: {
        width: 60,
        height: 60,
        paddingInline: 15,
        paddingBlock: 10,
      },
    });

    this.infoButton = new SVGButton({
      svg: info,
      color: "#353535ff",
      layout: {
        width: 60,
        height: 60,
        paddingInline: 12,
        paddingBlock: 12,
      },
    });

    buttonsContainer.addChild(
      this.pauseButton.view,
      this.hintButton.view,
      this.infoButton.view,
    );

    this.gameView.addChild(buttonsContainer);

    const levelInfo = new LayoutContainer({
      layout: {
        position: "absolute",
        flexDirection: "column",
        gap: 5,
        marginTop: 5,
        marginLeft: 7,
      },
    });

    this.level = new Text({
      style: {
        fontSize: 20,
        fill: "#ffffffff",
      },
      layout: true,
      text: "Level: 13",
    });

    this.difficulty = new Text({
      style: {
        fontSize: 20,
        fill: "#ffffffff",
      },
      layout: true,
      text: "Difficulty: Medium",
    });

    levelInfo.addChild(this.level, this.difficulty);

    this.gameView.addChild(levelInfo);
  }
}
