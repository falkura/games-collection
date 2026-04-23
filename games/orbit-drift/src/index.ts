import "@falkura-pet/shared/normalize/normalize.css";
import { Engine } from "@falkura-pet/engine";
import config from "../assets/game.json";
import { OrbitDrift } from "./OrbitDrift";

Engine.init({
  gameConfig: config,
  gameCtor: OrbitDrift,
});
