import AppScreen from "../basic/AppScreen";
import { Graphics, Text, Ticker } from "pixi.js";

export class LoadScreen extends AppScreen {
  spinner: Graphics;
  loadingLabel: Text;

  constructor(...args: ConstructorParameters<typeof AppScreen>) {
    super(...args);

    this.layout = {
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
      backgroundColor: "#66c1daff",
    };

    this.spinner = new Graphics({
      layout: {
        width: 100,
        height: 100,
      },
    })
      .arc(0, 0, 50, 2 * Math.PI, (3 * Math.PI) / 2)
      .stroke({ width: 15, color: "#ffffff" });

    this.loadingLabel = new Text({
      style: {
        fontSize: 26,
        fill: "#ffffffff",
      },
      layout: {
        margin: 15,
      },
      text: "Loading",
    });

    this.addChild(this.spinner, this.loadingLabel);
  }

  public override onTick(ticker: Ticker) {
    if (!this.spinner) return;

    this.spinner.rotation += 0.15 * ticker.deltaTime;
  }
}
