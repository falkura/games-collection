import { LayoutContainer } from "../layout/LayoutContainer";
import { AppScreen } from "./AppScreen";
import { Graphics, Text, Ticker } from "pixi.js";

export class LoadScene extends AppScreen {
  background: LayoutContainer<Graphics>;
  spinner: LayoutContainer<Graphics>;
  loadingLabel: LayoutContainer<Text>;

  public override onInit(): void {
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

  public override onTick(ticker: Ticker) {
    if (!this.spinner) return;

    this.spinner.rotation += 0.15 * ticker.deltaTime;
  }
}
