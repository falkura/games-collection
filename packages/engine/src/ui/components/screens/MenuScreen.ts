import AppScreen from "../basic/AppScreen";
import TextButton from "../TextButton";
import { Text } from "pixi.js";

// - Level select button + level indicator on it
// - Difficulty button + difficulty indicator on it

export class MenuScreen extends AppScreen {
  gameLabel: Text;

  playButton: TextButton;
  levelButton: TextButton;
  difficultyButton: TextButton;
  settingsButton: TextButton;

  constructor(...args: ConstructorParameters<typeof AppScreen>) {
    super(...args);

    this.layout = {
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
      backgroundColor: "#7666daff",
      gap: 10,
    };

    this.gameLabel = new Text({
      style: {
        fontSize: 35,
        fill: "#ffffffff",
      },
      layout: {
        position: "absolute",
        top: 0,
        margin: 15,
      },
      text: this.ui.data.gameName,
    });

    this.playButton = new TextButton({ text: "Play" });
    this.levelButton = new TextButton({ text: "Levels" });
    this.difficultyButton = new TextButton({ text: "Difficulty" });
    this.settingsButton = new TextButton({ text: "Settings" });

    this.addChild(
      this.gameLabel,
      this.playButton.view,
      this.levelButton.view,
      this.difficultyButton.view,
      this.settingsButton.view,
    );
  }
}
