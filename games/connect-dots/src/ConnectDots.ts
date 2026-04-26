import { IntroSystem } from "./systems/IntroSystem";
import { MainSystem } from "./systems/MainSystem";
import { HUDSystem } from "./systems/HUDSystem";
import { OverlaySystem } from "./systems/OverlaySystem";
import { getLevels } from "./levels";
import { saveLevelIndex } from "./progress";
import { Engine, GameController } from "@falkura-pet/engine";
import { SystemController } from "./systems/SystemController";
import { Container } from "pixi.js";

const GAMEPLAY_SYSTEMS = [MainSystem, HUDSystem];

export class ConnectDots extends GameController {
  systems: SystemController;

  constructor(config: IGameConfig, view: Container) {
    super(config, view);
    this.systems = new SystemController(this);

    this.systems.add(IntroSystem);
    this.systems.add(MainSystem);
    this.systems.add(HUDSystem);
    this.systems.add(OverlaySystem);

    this.systems.disableAll();
    this.systems.enable(IntroSystem);

    this.addGameControls();

    this.systems.build();
    this.ticker.add((ticker) => this.systems.tick(ticker));
  }

  public start() {
    super.start();
    this.systems.start();
  }

  public finish(data: any) {
    super.finish(data);
    this.systems.finish(data);
  }

  public reset() {
    super.reset();
    this.systems.reset();
    this.systems.disable(OverlaySystem);
  }

  public resize() {
    super.resize();
    this.systems.resize();
  }

  onPlay() {
    this.systems.disable(IntroSystem);
    for (const id of GAMEPLAY_SYSTEMS) this.systems.enable(id);
    Engine.startGame();
  }

  onSolved() {
    const main = this.systems.get(MainSystem);

    this.systems.enable(OverlaySystem);
    this.systems
      .get(OverlaySystem)
      .show("LEVEL COMPLETE", `${main.levelTitle} cleared.`);
  }

  resetLevel(): void {
    this.systems.get(MainSystem).resetLevel();
    this.systems.get(HUDSystem).onLevelStart();
    this.systems.disable(OverlaySystem);
  }

  nextLevel(): void {
    this.systems.get(MainSystem).nextLevel();
    this.systems.get(HUDSystem).onLevelStart();
    this.systems.disable(OverlaySystem);
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
