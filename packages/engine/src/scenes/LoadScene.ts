import { Graphics, Text, Ticker } from "pixi.js";
import { LayoutContainer } from "../layout/LayoutContainer";

export class LoadScene extends LayoutContainer {
  private background: LayoutContainer<Graphics>;
  private spinner: LayoutContainer<Graphics>;
  private loadingLabel: LayoutContainer<Text>;

  constructor() {
    super({ width: "sw", height: "sh" });

    this.background = new LayoutContainer({
      width: "sw",
      height: "sh",
      view: new Graphics().rect(0, 0, 1, 1).fill("#252525"),
    });

    this.spinner = new LayoutContainer({
      x: "sw/2",
      y: "sh/2-100",
      view: new Graphics()
        .arc(0, 0, 100, 2 * Math.PI, (3 * Math.PI) / 2)
        .stroke({ width: 20, color: "#ffffff" }),
    });

    this.loadingLabel = new LayoutContainer({
      x: "sw/2",
      y: "sh/2 + 150",
      view: new Text({
        style: {
          fontSize: 86,
          fontWeight: "600",
          fill: "#ffffff",
        },
        anchor: 0.5,
        text: "Loading",
      }),
    });

    this.addChild(this.background, this.spinner, this.loadingLabel);
  }

  public tick(ticker: Ticker) {
    this.spinner.rotation += 0.15 * ticker.deltaTime;
  }
}
