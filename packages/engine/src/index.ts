import "@pixi/layout"; // required to ensure all systems and mixins are registered
import { Application, Assets } from "pixi.js";
import UI, { UIType } from "./ui/UI";

import * as PIXI from "pixi.js";
import gsap from "gsap";
import PixiPlugin from "gsap/PixiPlugin.js";
import { UIOverrides } from "./ui/components/UIRegister";

/**
 * [Icons](https://marella.github.io/material-design-icons/demo/font/)
 */
class EngineClass {
  ui: UIType;
  app: Application;

  constructor() {
    gsap.registerPlugin(PixiPlugin);
    PixiPlugin.registerPIXI(PIXI);

    gsap.ticker.remove(gsap.updateRoot);

    PIXI.Ticker.shared.add(({ lastTime }) => {
      gsap.updateRoot(lastTime / 1000);
    });

    globalThis.PIXI = PIXI;
    globalThis.gsap = gsap;
  }

  async initEngine() {
    this.app = new Application();

    await this.app.init({
      backgroundAlpha: 0,
      preference: "webgl",
      resizeTo: window,
      antialias: true,
    });

    root.appendChild(this.app.canvas);

    globalThis.app = globalThis.__PIXI_APP__ = this.app;

    await Assets.init({ basePath: "./assets/" });

    Assets.add({ src: "manifest.json" });

    const manifest = await Assets.load("manifest.json");

    Assets.addBundle("default", manifest.bundles[0].assets);

    await Assets.loadBundle("default");
  }

  async initUI(overrides?: UIOverrides) {
    this.ui = UI;
    this.ui.init(this.app, overrides);
  }

  async initGame(config) {
    console.log("Initializing Game", config);
  }

  async initWrapper(config) {
    console.log("Initializing Wrapper", config);
  }
}

const Engine = new EngineClass();

export default Engine;
