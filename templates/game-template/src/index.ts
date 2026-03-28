import "@falkura-pet/shared/normalize/normalize.css";
import config from "../assets/game.json";
import { Engine } from "@falkura-pet/engine";
import { GameBase, System } from "@falkura-pet/game-base";
import { UI } from "@falkura-pet/ui/UI";

class MainSystem extends System<{{ name | pascal_case }}> {
  static MODULE_ID = "main_system";
}

class {{ name | pascal_case }} extends GameBase {
  protected override init(): void {
    this.systems.add(MainSystem);
  }
}

Engine.initEvents();
Engine.initGSAP();

await Engine.initApplication();
await Engine.loadAssets();

Engine.initUI(UI);
Engine.initGame({{ name | pascal_case }}, config);

Engine.ui.setScene("Game");
