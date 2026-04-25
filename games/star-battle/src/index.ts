import "@falkura-pet/shared/normalize/normalize.css";
import { Engine } from "@falkura-pet/engine";
import config from "../assets/game.json";
import { StarBattle } from "./StarBattle";
import { mountUI } from "./ui";

await Engine.init({
  gameConfig: config,
  gameCtor: StarBattle,
  hideDebugPane: true,
});

mountUI();
