import "@falkura-pet/shared/normalize/normalize.css";
import config from "../assets/game.json";
import { Engine } from "@falkura-pet/engine";
import { GameBase, System } from "@falkura-pet/game-base";
import { UI } from "@falkura-pet/ui/UI";

class MainSystem extends System<GameTemplate> {
  static MODULE_ID = "main_system";
}

class GameTemplate extends GameBase {
  protected override init(): void {
    this.systems.add(MainSystem);
  }
}

await Engine.init();
await Engine.loadAssets();

Engine.initUI(UI);
Engine.initGame(GameTemplate, config);
