import "@falkura-pet/shared/normalize/normalize.css";
import { Engine } from "@falkura-pet/engine";
import config from "../assets/game.json";
import { OrbitDrift } from "./OrbitDrift";

Engine.initEvents();
Engine.initGSAP();

await Engine.initApplication();
await Engine.loadAssets();

Engine.initGame(OrbitDrift, config);
Engine.startGame();
