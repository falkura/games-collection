import "@falkura-pet/shared/normalize/normalize.css";
import { Engine } from "@falkura-pet/engine";
import config from "../assets/game.json";
import { Plinko } from "./Plinko";
import { mountUI } from "./ui";

await Engine.init({
  gameConfig: config,
  gameCtor: Plinko,
  hideDebugPane: true,
  sizeLandscape: {
    width: 1080,
    height: 1920,
  },
  sizePortrait: {
    width: 1080,
    height: 1920,
  },
});

Engine.startGame();
mountUI();
