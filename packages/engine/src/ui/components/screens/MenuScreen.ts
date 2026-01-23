import { LayoutContainerOptions, LayoutText } from "@pixi/layout/components";
import AppScreen from "../basic/AppScreen";
import UI from "../../UI";
import TextButton from "../TextButton";

declare global {
  interface ScreensMap {
    menu: MenuScreen;
  }
}

// - Play button
// - Level select button + level indicator on it
// - Difficulty button + difficulty indicator on it
// - Settings button

export class MenuScreen extends AppScreen {
  gameName: LayoutText;

  playButton: TextButton;
  levelButton: TextButton;
  difficultyButton: TextButton;
  settingsButton: TextButton;

  constructor(options?: LayoutContainerOptions) {
    super({
      ...options,
    });

    this.layout = {
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
      backgroundColor: "#7666daff",
      gap: 15,
    };

    this.gameName = new LayoutText({
      style: {
        fontSize: "100%",
        fontWeight: "bold",
        fill: "#ffffffff",
        align: "center",
      },
      layout: {
        position: "absolute",
        top: 0,
        width: "90%",
        height: 50,
        margin: 15,
      },
      text: UI.data.gameName,
    });

    this.addChild(this.gameName);

    const animations = {
      hover: {
        props: {
          scale: 1.05,
        },
        duration: 0.1,
      },
      pressed: {
        props: {
          scale: 0.95,
        },
        duration: 0.1,
      },
    };

    this.playButton = new TextButton({ text: "Play", animations });
    this.levelButton = new TextButton({ text: "Levels", animations });
    this.difficultyButton = new TextButton({ text: "Difficulty", animations });
    this.settingsButton = new TextButton({ text: "Settings", animations });

    this.addChild(
      this.playButton.view,
      this.levelButton.view,
      this.difficultyButton.view,
      this.settingsButton.view,
    );
  }
}
