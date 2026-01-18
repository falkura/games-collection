import { Application } from "pixi.js";
import config from "./config.json";
import Engine from "@falkura-pet/engine";
// export class Game extends BaseGame {
//   constructor() {
//     super(config, import.meta.url);
//   }
// }
const app = new Application();
console.log("Template Loaded Successfully");

console.log(Engine);
export class Game {
  app = app;
}
