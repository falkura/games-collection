import "@falkura-pet/shared/normalize/normalize.css";
import { Engine } from "@falkura-pet/engine";
import config from "../assets/game.json";
import { BoidsSimulation } from "./BoidsSimulation";
import { ControlPanel } from "@falkura-pet/game-base";

Engine.initEvents();
Engine.initGSAP();

await Engine.initApplication();
await Engine.loadAssets();

ControlPanel.options.startFolded = false;

Engine.initGame(BoidsSimulation, config);
Engine.startGame();
