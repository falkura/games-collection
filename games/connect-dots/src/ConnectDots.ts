import { GameBase } from "@falkura-pet/game-base";
import { IntroSystem } from "./core/IntroSystem";
import { MainSystem } from "./core/MainSystem";

export class ConnectDots extends GameBase {
  protected override init(): void {
    this.systems.add(IntroSystem);
    this.systems.add(MainSystem);
    this.systems.disable(MainSystem);
  }

  override reset(): void {
    super.reset();
    this.systems.disable(MainSystem);
    this.systems.enable(IntroSystem);
  }

  showBoard(): void {
    this.systems.disable(IntroSystem);
    this.systems.enable(MainSystem);

    const main = this.systems.get(MainSystem);
    main.start();
    main.resize();
  }
}
