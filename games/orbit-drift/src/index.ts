import "@falkura-pet/shared/normalize/normalize.css";
import { Engine } from "@falkura-pet/engine";
import { ControlPanel } from "@falkura-pet/game-base";
import config from "../assets/game.json";
import { OrbitDrift } from "./OrbitDrift";

Engine.initEvents();
Engine.initGSAP();

await Engine.initApplication();
await Engine.loadAssets();

ControlPanel.options.startFolded = true;

Engine.initGame(OrbitDrift, config);
Engine.startGame();
