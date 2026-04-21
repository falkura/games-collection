import "@falkura-pet/shared/normalize/normalize.css";
import { Engine } from "@falkura-pet/engine";
import config from "../assets/game.json";
import { ConnectDots } from "./ConnectDots";

await Engine.init({
  gameConfig: config,
  gameCtor: ConnectDots,
});
