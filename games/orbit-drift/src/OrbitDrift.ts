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

    this.disableGameplaySystems();

    this.addGameControls();
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
