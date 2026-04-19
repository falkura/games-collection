import { GameBase } from "@falkura-pet/game-base";
import { Engine } from "@falkura-pet/engine";
import { IntroSystem } from "./core/IntroSystem";
import { SpaceSystem } from "./core/SpaceSystem";
import { InputSystem } from "./core/InputSystem";
import { HUDSystem } from "./core/HUDSystem";
import { OverlaySystem } from "./core/OverlaySystem";
import { LEVEL } from "./config";
import { saveProgress } from "./progress";

const GAMEPLAY_IDS = [
  SpaceSystem.MODULE_ID,
  InputSystem.MODULE_ID,
  HUDSystem.MODULE_ID,
  OverlaySystem.MODULE_ID,
];

export class OrbitDrift extends GameBase {
  private introShown = false;

  protected override init(): void {
    this.systems.add(IntroSystem);
    this.systems.add(SpaceSystem);
    this.systems.add(InputSystem);
    this.systems.add(HUDSystem);
    this.systems.add(OverlaySystem);

    for (const id of GAMEPLAY_IDS) this.systems.disable(id);

    this.addGameControls();
  }

  override reset(): void {
    super.reset();
    if (this.introShown) {
      this.systems.disable(IntroSystem);
    } else {
      for (const id of GAMEPLAY_IDS) this.systems.disable(id);
      this.systems.enable(IntroSystem);
    }
  }

  play(): void {
    this.introShown = true;
    this.systems.disable(IntroSystem);
    for (const id of GAMEPLAY_IDS) {
      this.systems.enable(id);
      const system = this.systems.get(id);
      system.start();
      system.resize();
    }
  }

  retry(): void {
    this.systems.get(SpaceSystem).retry();
  }

  nextLevel(): void {
    this.systems.get(SpaceSystem).nextLevel();
  }

  private addGameControls(): void {
    const folder = this.pane.addFolder({ title: "Progress", expanded: true });

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
