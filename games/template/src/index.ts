import config from "./config.json";
import Engine from "@falkura-pet/engine";

console.log("Template Loaded Successfully");

await Engine.initEngine();
await Engine.initGame(config);
