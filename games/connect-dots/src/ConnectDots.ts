import { GameBase } from "@falkura-pet/game-base";
import { IntroSystem } from "./core/IntroSystem";
import { MainSystem } from "./core/MainSystem";
import { HUDSystem } from "./core/HUDSystem";
import { getLevels } from "./levels";
import { saveLevelIndex } from "./progress";

export class ConnectDots extends GameBase {
  protected override init(): void {
    this.systems.add(IntroSystem);
    this.systems.add(MainSystem);
    this.systems.add(HUDSystem);
    this.disableGameplaySystems();

    this.addGameControls();
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

  private addGameControls(): void {
    const folder = this.pane.addFolder({ title: "Levels", expanded: false });

    folder.addButton({ title: "Reset Current Level" }).on("click", () => {
      this.systems.get(MainSystem).resetLevel();
    });

    folder.addButton({ title: "Reset Progress" }).on("click", () => {
      saveLevelIndex(0);
      this.systems.get(MainSystem).goToLevel(1);
    });

    const state = { level: 1 };
    const options = Object.fromEntries(
      getLevels().map((level, index) => [
        `${index + 1}. ${level.title} (${level.width}x${level.height})`,
        index + 1,
      ]),
    );

    folder
      .addBinding(state, "level", { label: "Pick Level", options })
      .on("change", ({ value }) => {
        this.systems.get(MainSystem).goToLevel(value);
      });
  }
}
