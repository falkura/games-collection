import { GameBase } from "@falkura-pet/game-base";
import { IntroSystem } from "./core/IntroSystem";
import { MainSystem } from "./core/MainSystem";
import { HUDSystem } from "./core/HUDSystem";
import { OverlaySystem } from "./core/OverlaySystem";
import { getLevels } from "./levels";
import { saveLevelIndex } from "./progress";

const GAMEPLAY_IDS = [
  MainSystem.MODULE_ID,
  HUDSystem.MODULE_ID,
  OverlaySystem.MODULE_ID,
];

export class ConnectDots extends GameBase {
  protected override init(): void {
    this.systems.add(IntroSystem);
    this.systems.add(MainSystem);
    this.systems.add(HUDSystem);
    this.systems.add(OverlaySystem);

    for (const id of GAMEPLAY_IDS) this.systems.disable(id);

    this.addGameControls();
  }

  override reset(): void {
    super.reset();
    for (const id of GAMEPLAY_IDS) this.systems.disable(id);
    this.systems.enable(IntroSystem);
  }

  play(): void {
    this.systems.disable(IntroSystem);

    for (const id of GAMEPLAY_IDS) {
      this.systems.enable(id);
      const system = this.systems.get(id);
      system.start();
      system.resize();
    }
  }

  onSolved() {
    const main = this.systems.get(MainSystem);

    this.systems
      .get(OverlaySystem)
      .show("LEVEL COMPLETE", `${main.levelTitle} cleared.`);
  }

  resetLevel(): void {
    this.systems.get(MainSystem).resetLevel();
    this.systems.get(HUDSystem).onLevelStart();
    this.systems.get(OverlaySystem).hide();
  }

  nextLevel(): void {
    this.systems.get(MainSystem).nextLevel();
    this.systems.get(HUDSystem).onLevelStart();
    this.systems.get(OverlaySystem).hide();
  }

  goToLevel(level: number) {
    this.systems.get(MainSystem).goToLevel(level);
    this.resetLevel();
  }

  private addGameControls(): void {
    const folder = this.pane.addFolder({ title: "Levels", expanded: true });

    folder.addButton({ title: "Reset Current Level" }).on("click", () => {
      this.resetLevel();
    });

    folder.addButton({ title: "Reset Progress" }).on("click", () => {
      saveLevelIndex(0);
      this.goToLevel(1);
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
        this.goToLevel(value);
      });
  }
}
