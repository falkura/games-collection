import { Application } from "pixi.js";
import config from "./config.json";

// export class Game extends BaseGame {
//   constructor() {
//     super(config, import.meta.url);
//   }
// }
const app = new Application();
console.log("Template Loaded Successfully");

export class Game {
  app = app;
}
