import "@falkura-pet/shared/normalize/normalize.css";
import config from "../game.json";
import Engine from "@falkura-pet/engine/Engine";
import Game from "@falkura-pet/engine/game/Game";
import { System } from "@falkura-pet/engine/game/system/System";
import UI from "@falkura-pet/engine/ui/UI";

class MainSystem extends System<GameTemplate> {
  static MODULE_ID = "main_system";
}

class GameTemplate extends Game {
  protected override init(): void {
    this.systems.add(MainSystem);
  }
}

await Engine.init();
await Engine.loadAssets();

Engine.initUI(UI);
Engine.initGame(GameTemplate, config);

