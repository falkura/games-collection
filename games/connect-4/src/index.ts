import "@falkura-pet/shared/normalize/normalize.css";
import { Engine } from "@falkura-pet/engine";
import config from "../assets/game.json";
import { Connect4 } from "./Connect4";
import { mountUI } from "./ui";

await Engine.init({
  gameConfig: config,
  gameCtor: Connect4,
});

mountUI();
