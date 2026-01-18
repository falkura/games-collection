import * as PIXI from "pixi.js";
import { Assets } from "pixi.js";

export class EngineClass {
  async initEngine() {
    const app = new PIXI.Application();

    await app.init({
      backgroundColor: 0x191bff,
      backgroundAlpha: 0.5,
      preference: "webgl", // or 'webgpu'
      resizeTo: window,
    });

    root.appendChild(app.canvas);

    globalThis.app = app;
  }

  async initGame(config) {
    console.log("Initializing Game", config);

    await Assets.init({ basePath: "./assets/" });

    Assets.add({ src: "manifest.json" });

    const manifest = await Assets.load("manifest.json");

    Assets.addBundle("default", manifest.bundles[0].assets);

    const assets = await Assets.loadBundle("default");

    console.log("Game assets loaded successfully", assets);
  }

  startGame() {}
}

const Engine = new EngineClass();

// @ts-ignore
globalThis.PIXI = PIXI;

console.log("Engine Loaded Successfully");

export default Engine;
