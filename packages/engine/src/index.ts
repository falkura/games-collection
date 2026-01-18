import * as PIXI from "pixi.js";

export class EngineClass {
  async initEngine(config) {
    console.log("Initializing Engine", config);

    const app = new PIXI.Application();

    await app.init({
      backgroundColor: 0x191bff,
      preference: "webgl", // or 'webgpu'
      resizeTo: window,
    });

    document.getElementById("root")!.appendChild(app.canvas);

    globalThis.app = app;
  }

  // TODO check for duplication or loading process
  async initGame(config, importUrl: string) {
    console.log("Initializing Game", config, importUrl);

    const manifestName = config.gameCode + "-manifest";

    const basePath = new URL("./assets/", importUrl).href;

    await PIXI.Assets.init({ basePath });

    PIXI.Assets.add({
      alias: manifestName,
      src: "manifest.json",
    });

    const manifest = await PIXI.Assets.load(manifestName);

    PIXI.Assets.addBundle(config.gameCode, manifest.bundles[0].assets);

    const assets = await PIXI.Assets.loadBundle(config.gameCode);

    console.log("Game assets loaded successfully", assets);
  }

  startGame() {}
}

const Engine = new EngineClass();

// @ts-ignore
globalThis.PIXI = PIXI;

console.log("Engine Loaded Successfully");

export default Engine;
