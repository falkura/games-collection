import "@falkura-pet/shared/normalize/normalize.css";
import { Engine } from "@falkura-pet/engine";
import { UI } from "@falkura-pet/ui/UI";
import config from "../assets/game.json";
import { BoidsSimulation } from "./BoidsSimulation";

Engine.initEvents();
Engine.initGSAP();

await Engine.initApplication();
await Engine.loadAssets();

Engine.initUI(UI);
Engine.initGame(BoidsSimulation, config);

Engine.ui.setScene("Game");
Engine.start();
