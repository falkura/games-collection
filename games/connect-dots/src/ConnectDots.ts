import { GameBase } from "@falkura-pet/game-base";
import { IntroSystem } from "./core/IntroSystem";
import { MainSystem } from "./core/MainSystem";

export class ConnectDots extends GameBase {
  protected override init(): void {
    this.systems.add(IntroSystem);
    this.systems.add(MainSystem);
    this.disableGameplaySystems();
  }

  override reset(): void {
    super.reset();
    this.disableGameplaySystems();
    this.systems.enable(IntroSystem);
  }

  play(): void {
    this.systems.disable(IntroSystem);
    this.enableGameplaySystems();

    for (const moduleId of this.systems.getEnabled()) {
      const system = this.systems.get(moduleId);
      system.start();
      system.resize();
    }
  }

  private disableGameplaySystems(): void {
    for (const moduleId of this.systems.getEnabled()) {
      if (moduleId === IntroSystem.MODULE_ID) continue;
      this.systems.disable(moduleId);
    }
  }

  private enableGameplaySystems(): void {
    for (const moduleId of this.systems.getDisabled()) {
      if (moduleId === IntroSystem.MODULE_ID) continue;
      this.systems.enable(moduleId);
    }
  }
}
