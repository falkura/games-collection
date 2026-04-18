import { GameBase } from "@falkura-pet/game-base";
import { Engine } from "@falkura-pet/engine";
import { IntroSystem } from "./core/IntroSystem";
import { SpaceSystem } from "./core/SpaceSystem";
import { InputSystem } from "./core/InputSystem";
import { HUDSystem } from "./core/HUDSystem";
import { LEVEL } from "./config";
import { saveProgress } from "./progress";

export class OrbitDrift extends GameBase {
  protected override init(): void {
    this.systems.add(IntroSystem);
    this.systems.add(SpaceSystem);
    this.systems.add(InputSystem);
    this.systems.add(HUDSystem);

    this.systems.disable(SpaceSystem);
    this.systems.disable(InputSystem);
    this.systems.disable(HUDSystem);

    this.addGameControls();
  }


  showGameplay(): void {
    this.systems.disable(IntroSystem);

    this.systems.enable(SpaceSystem);
    this.systems.enable(InputSystem);
    this.systems.enable(HUDSystem);

    const space = this.systems.get(SpaceSystem);
    const input = this.systems.get(InputSystem);
    const hud = this.systems.get(HUDSystem);

    space.start();
    input.start();
    hud.start();

    space.resize();
    input.resize();
    hud.resize();
  }

  private addGameControls(): void {
    const folder = this.pane.addFolder({ title: "Progress", expanded: false });

    folder.addButton({ title: "Reset Progress" }).on("click", () => {
      saveProgress(1);
      Engine.restartGame();
    });

    const state = { level: 1 };
    const options = Object.fromEntries(
      Array.from({ length: LEVEL.TOTAL }, (_, i) => {
        const n = i + 1;
        const name = LEVEL.NAMES[i] ?? `Level ${n}`;
        return [`${n}. ${name}`, n];
      }),
    );
    folder
      .addBinding(state, "level", { label: "Pick Level", options })
      .on("change", ({ value }) => {
        saveProgress(value);
        Engine.restartGame();
      });
  }
}
