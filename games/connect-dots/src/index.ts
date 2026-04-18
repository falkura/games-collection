import "@falkura-pet/shared/normalize/normalize.css";
import { Engine } from "@falkura-pet/engine";
import config from "../assets/game.json";
import { ConnectDots } from "./ConnectDots";

Engine.initEvents();
Engine.initGSAP();

await Engine.initApplication();
await Engine.loadAssets();

Engine.initGame(ConnectDots, config);
Engine.startGame();
