import { Container, Graphics, Text, Ticker } from "pixi.js";
import { Layout } from "./Layout";

export class LoadScene extends Container {
  private background: Graphics;
  private spinner: Graphics;
  private loadingLabel: Text;

  constructor() {
    super();

    this.background = new Graphics().rect(0, 0, 1, 1).fill("#252525");

    this.spinner = new Graphics()
      .arc(0, 0, 100, 2 * Math.PI, (3 * Math.PI) / 2)
      .stroke({ width: 20, color: "#ffffff" });

    this.loadingLabel = new Text({
      style: {
        fontSize: 86,
        fontWeight: "600",
        fill: "#ffffff",
      },
      anchor: 0.5,
      text: "Loading",
    });

    this.addChild(this.background, this.spinner, this.loadingLabel);
  }

  public tick(ticker: Ticker) {
    this.spinner.rotation += 0.15 * ticker.deltaTime;
  }

  public resize() {
    this.background.width = Layout.screenWidth;
    this.background.height = Layout.screenHeight;

    this.spinner.x = Layout.screen.center.x;
    this.spinner.y = Layout.screen.center.y - 100;

    this.loadingLabel.x = Layout.screen.center.x;
    this.loadingLabel.y = Layout.screen.center.y + 150;
  }
}
