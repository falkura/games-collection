import { GameBase } from "@falkura-pet/game-base";
import { SpaceSystem } from "./core/SpaceSystem";
import { InputSystem } from "./core/InputSystem";
import { HUDSystem } from "./core/HUDSystem";

export class OrbitDrift extends GameBase {
  protected override init(): void {
    this.systems.add(SpaceSystem);
    this.systems.add(InputSystem);
    this.systems.add(HUDSystem);
  }
}
