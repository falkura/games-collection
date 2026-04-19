import { GameBase } from "@falkura-pet/game-base";
import { IntroSystem } from "./core/IntroSystem";
import { MainSystem } from "./core/MainSystem";

export class BoidsSimulation extends GameBase {
  protected override init(): void {
    this.systems.add(IntroSystem);
    this.systems.add(MainSystem);
    this.systems.disable(MainSystem.MODULE_ID);
  }

  override reset(): void {
    super.reset();
    this.systems.disable(MainSystem.MODULE_ID);
    this.systems.enable(IntroSystem.MODULE_ID);
  }

  play(): void {
    this.systems.disable(IntroSystem.MODULE_ID);
    this.systems.enable(MainSystem.MODULE_ID);
    const main = this.systems.get(MainSystem);
    main.start();
    main.resize();
  }
}
