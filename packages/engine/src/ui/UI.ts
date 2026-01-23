import { Application, Ticker } from "pixi.js";
import ScreensController from "./components/controllers/ScreensController";

class UIClass {
  app: Application;
  screens: ScreensController;
  ticker: Ticker;
  data: {
    gameName: string;
  };

  init(app: Application) {
    // Should be passed in function parameters
    this.data = {
      gameName: "Game Name",
    };

    globalThis.ui = this;

    this.app = app;

    app.stage.layout = {
      width: app.screen.width,
      height: app.screen.height,
      alignItems: "center",
      justifyContent: "center",
    };

    app.renderer.on("resize", (width: number, height: number) => {
      app.stage.layout = { width, height };
    });

    this.ticker = new Ticker();
    this.ticker.start();

    this.screens = new ScreensController(this.app);
    this.screens.show("game");
  }
}

const UI = new UIClass();

export default UI;
