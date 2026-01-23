import {
  LayoutContainerOptions,
  LayoutGraphics,
  LayoutText,
} from "@pixi/layout/components";
import AppScreen from "../basic/AppScreen";
import { Ticker } from "pixi.js";

declare global {
  interface ScreensMap {
    load: LoadScreen;
  }
}

export class LoadScreen extends AppScreen {
  spinner: LayoutGraphics;
  loading: LayoutText;

  constructor(options?: LayoutContainerOptions) {
    super({
      ...options,
    });

    this.layout = {
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
      backgroundColor: "#66c1da",
    };

    this.spinner = new LayoutGraphics({
      layout: {
        width: 100,
        height: 100,
      },
    });

    this.spinner.slot
      .arc(0, 0, 50, 2 * Math.PI, (3 * Math.PI) / 2)
      .stroke({ width: 15, color: "#ffffff" });
    this.addChild(this.spinner);

    this.loading = new LayoutText({
      style: {
        fontSize: 24,
        fontWeight: "bold",
        fill: "#ffffffff",
        align: "center",
      },
      layout: {
        width: 100,
        height: 50,
        margin: 15,
      },
      text: "Loading",
    });

    this.addChild(this.loading);
  }

  protected override onTick(ticker: Ticker) {
    if (!this.spinner) return;

    this.spinner.rotation += 0.15 * ticker.deltaTime;
  }
}
