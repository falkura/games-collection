import AppScreen from "../../basic/AppScreen";
import { Graphics, Text, Ticker } from "pixi.js";

export class IntroScreen extends AppScreen {
  customText: Text;

  constructor(...args: ConstructorParameters<typeof AppScreen>) {
    super(...args);

    this.layout = {
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
      backgroundColor: "#da66a8ff",
    };

    this.customText = new Text({
      style: {
        fontSize: 26,
        fill: "#ffffffff",
      },
      layout: {
        margin: 15,
      },
      text: "Wrapper",
    });

    this.addChild(this.customText);
  }
}
