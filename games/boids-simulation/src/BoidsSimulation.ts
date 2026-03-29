import { GameBase } from "@falkura-pet/game-base";
import { MainSystem } from "./core/MainSystem"

export class BoidsSimulation extends GameBase {
  protected override init(): void {
    this.systems.add(MainSystem);
  }
}
