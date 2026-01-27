import "@falkura-pet/shared/normalize/normalize.css";
import config from "../game.json";
import Engine from "@falkura-pet/engine";

await Engine.initEngine();
await Engine.initUI();
await Engine.initGame(config);
