import { Engine, GameController } from "@falkura-pet/engine";
import { IntroSystem } from "./core/IntroSystem";
import { SpaceSystem } from "./core/SpaceSystem";
import { InputSystem } from "./core/InputSystem";
import { HUDSystem } from "./core/HUDSystem";
import { OverlaySystem } from "./core/OverlaySystem";
import { LEVEL } from "./config";
import { saveProgress } from "./progress";

const GAMEPLAY_SYSTEMS = [SpaceSystem, InputSystem, HUDSystem];

export class OrbitDrift extends GameController {
  override init(): void {
    this.systems.add(IntroSystem);
    this.systems.add(SpaceSystem);
    this.systems.add(InputSystem);
    this.systems.add(HUDSystem);
    this.systems.add(OverlaySystem);

    this.systems.disableAll();
    this.systems.enable(IntroSystem);

    this.addGameControls();
  }

  override reset(): void {
    super.reset();
    this.systems.disable(OverlaySystem);
  }

  override finish(data: any): void {
    this.systems.enable(OverlaySystem);
    this.systems.get(OverlaySystem).showResult(data);

    super.finish(data);
  }

  onPlay() {
    this.systems.disable(IntroSystem);
    for (const id of GAMEPLAY_SYSTEMS) this.systems.enable(id);
    Engine.startGame();
  }

  updateHUD() {
    this.systems.get(HUDSystem).update();
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
