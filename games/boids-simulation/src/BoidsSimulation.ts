import { Engine, GameController } from "@falkura-pet/engine";
import { MainSystem } from "./systems/MainSystem";
import { IntroSystem } from "./systems/IntroSystem";

const GAMEPLAY_SYSTEMS = [MainSystem];

export class BoidsSimulation extends GameController {
  override init(): void {
    this.systems.add(IntroSystem);
    this.systems.add(MainSystem);

    this.systems.disableAll();
    this.systems.enable(IntroSystem);
  }

  onPlay() {
    this.systems.disable(IntroSystem);
    for (const id of GAMEPLAY_SYSTEMS) this.systems.enable(id);
    Engine.startGame();
  }
}
