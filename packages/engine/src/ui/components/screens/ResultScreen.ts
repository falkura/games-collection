import AppScreen from "../basic/AppScreen";
import TextButton from "../TextButton";
import { Text } from "pixi.js";

export class ResultScreen extends AppScreen {
  resultLabel: Text;
  scoreLabel: Text;

  nextButton: TextButton;
  restartButton: TextButton;
  menuButton: TextButton;
  settingsButton: TextButton;

  constructor(...args: ConstructorParameters<typeof AppScreen>) {
    super(...args);

    this.layout = {
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
      backgroundColor: "#66daa8ff",
      gap: 10,
    };

    this.resultLabel = new Text({
      style: {
        fontSize: 24,
        fill: "#ffffffff",
      },
      layout: {},
      text: "Win / Lose",
    });

    this.scoreLabel = new Text({
      style: {
        fontSize: 24,
        fill: "#ffffffff",
      },
      layout: {},
      text: "Score: 54600",
    });

    this.nextButton = new TextButton({ text: "Next" });
    this.restartButton = new TextButton({ text: "Restart" });
    this.menuButton = new TextButton({ text: "Menu" });
    this.settingsButton = new TextButton({ text: "Settings" });

    this.addChild(
      this.resultLabel,
      this.scoreLabel,
      this.nextButton.view,
      this.restartButton.view,
      this.menuButton.view,
      this.settingsButton.view,
    );
  }
}
