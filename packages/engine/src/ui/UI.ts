import { Application, Ticker } from "pixi.js";
import ScreensController from "./components/controllers/ScreensController";
import WindowsController from "./components/controllers/WindowsController";
import { Background } from "./components/basic/Background";

class UIClass {
  app: Application;
  screens: ScreensController;
  windows: WindowsController;
  background: Background;

  ticker: Ticker;
  data: {
    gameName: string;
    bg?: string;
  };

  initialized = false;

  init(app: Application) {
    if (this.initialized) {
      console.error("UI is already initialized.");
      return;
    }

    this.initialized = true;

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

    this.background = new Background({
      texture: this.data.bg,
    });

    this.screens = new ScreensController(this);
    this.screens.setScreen("game");

    this.windows = new WindowsController(this);
    this.windows.showWindow("info");

    this.app.stage.addChild(this.background, this.screens, this.windows);
  }
}

/**
 * Singleton
 */
const UI = new UIClass();
export type UIType = UIClass;

export default UI;
