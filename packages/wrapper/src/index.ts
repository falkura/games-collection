import "@falkura-pet/shared/normalize/normalize.css";
import gamesMeta from "@gamesMeta";
import Engine from "@falkura-pet/engine/Engine";
import { UI } from "@falkura-pet/ui";

await Engine.init();
await Engine.loadAssets();

Engine.initUI(UI);
Engine.initWrapper(gamesMeta);
