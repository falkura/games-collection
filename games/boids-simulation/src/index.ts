import "@falkura-pet/shared/normalize/normalize.css";
import { Engine } from "@falkura-pet/engine";
import config from "../assets/game.json";
import { BoidsSimulation } from "./BoidsSimulation";

Engine.init({
  gameConfig: config,
  gameCtor: BoidsSimulation,
  controlPanelStartFolded: false,
});
