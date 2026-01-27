import { LayoutContainer } from "@pixi/layout/components";
import AppScreen from "../basic/AppScreen";
import SVGButton from "../SVGButton";
import { Text } from "pixi.js";

import pause from "@material-design-icons/svg/outlined/pause.svg";
import lightbulb from "@material-design-icons/svg/outlined/lightbulb.svg";
import info from "@material-design-icons/svg/outlined/info.svg";

export class GameScreen extends AppScreen {
  pauseButton: SVGButton;
  hintButton: SVGButton;
  infoButton: SVGButton;

  topBar: LayoutContainer;
  gameContainer: LayoutContainer;

  timeLabel: Text;
  gameLabel: Text;
  levelLabel: Text;
  difficultyLabel: Text;

  constructor(...args: ConstructorParameters<typeof AppScreen>) {
    super(...args);

    this.layout = {
      justifyContent: "flex-start",
      alignItems: "center",
      flexDirection: "column",
      backgroundColor: "#dacb66ff",
    };

    this.topBar = new LayoutContainer({
      layout: {
        width: "100%",
        height: 30,
        backgroundColor: "#00000088",
      },
    });

    this.gameContainer = new LayoutContainer({
      layout: {
        width: "100%",
        height: "100%",
      },
    });

    this.gameLabel = new Text({
      style: {
        fontSize: 20,
        fill: "#ffffffff",
      },
      layout: {
        position: "absolute",
        top: 3,
        left: 5,
      },
      text: this.ui.data.gameName,
    });

    this.timeLabel = new Text({
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

    const buttonsContainer = new LayoutContainer({
      layout: {
        position: "absolute",
        flexDirection: "column",
        right: 0,
        gap: 10,
        margin: 10,
      },
    });

    const buttonsConfig = {
      size: {
        width: 60,
        height: 60,
      },
      color: "#353535ff",
    };

    this.pauseButton = new SVGButton({
      svg: pause,
      color: buttonsConfig.color,
      layout: {
        paddingInline: 15,
        paddingBlock: 14,
        ...buttonsConfig.size,
      },
    });

    this.hintButton = new SVGButton({
      svg: lightbulb,
      color: buttonsConfig.color,
      layout: {
        paddingInline: 15,
        paddingBlock: 10,
        ...buttonsConfig.size,
      },
    });

    this.infoButton = new SVGButton({
      svg: info,
      color: buttonsConfig.color,
      layout: {
        paddingInline: 12,
        paddingBlock: 12,
        ...buttonsConfig.size,
      },
    });

    buttonsContainer.addChild(
      this.pauseButton.view,
      this.hintButton.view,
      this.infoButton.view,
    );

    this.gameContainer.addChild(buttonsContainer);

    const levelInfo = new LayoutContainer({
      layout: {
        position: "absolute",
        flexDirection: "column",
        gap: 5,
        marginTop: 5,
        marginLeft: 7,
      },
    });

    this.levelLabel = new Text({
      style: {
        fontSize: 20,
        fill: "#ffffffff",
      },
      layout: true,
      text: "Level: 13",
    });

    this.difficultyLabel = new Text({
      style: {
        fontSize: 20,
        fill: "#ffffffff",
      },
      layout: true,
      text: "Difficulty: Medium",
    });

    levelInfo.addChild(this.levelLabel, this.difficultyLabel);

    this.gameContainer.addChild(levelInfo);

    this.addChild(
      this.topBar,
      this.gameContainer,
      this.gameLabel,
      this.timeLabel,
    );
  }
}
