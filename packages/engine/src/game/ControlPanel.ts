import { Assets } from "pixi.js";
import { FolderApi, Pane } from "tweakpane";
import { GameController } from "./GameController";
import { Engine } from "../Engine";

/**
 * Tweakpane debug panel. Initialized automatically by {@link GameController}.
 *
 * Shows FPS, game-speed slider, restart and graphics-quality buttons.
 * Configure via {@link options} before `Engine.init` is called.
 */
export class ControlPanel {
  static engineFolder: FolderApi;
  static initialized = false;
  static gameSpeedControl: ReturnType<Pane["addBinding"]>;

  /** Live stats object bound to Tweakpane, mutated each tick. */
  static stats = {
    fps: 0,
    gameSpeed: 1,
  };

  /**
   * Configure before `Engine.init`.
   * - `startFolded` — open the pane collapsed (default `true`).
   * - `foldedTitle` — title shown while folded (default `"⚙️"`).
   */
  static options = {
    startFolded: true,
    foldedTitle: "⚙️",
  };

  /** @internal */
  public static init(game: GameController) {
    if (ControlPanel.initialized) return;
    ControlPanel.initialized = true;

    const fullTitle = Assets.get("game.json").title;
    game.pane.title = fullTitle;

    const syncTitle = () => {
      game.pane.title = game.pane.expanded
        ? fullTitle
        : ControlPanel.options.foldedTitle;
    };
    game.pane.on("fold", syncTitle);

    game.pane.addBinding(this.stats, "fps", {
      label: "FPS",
      readonly: true,
    });

    game.ticker.add(() => (this.stats.fps = game.ticker.FPS));

    ControlPanel.addGameControls(game);

    if (ControlPanel.options.startFolded) {
      game.pane.expanded = false;
    }

    syncTitle();
  }

  /** @internal */
  public static reset() {
    ControlPanel.stats.gameSpeed = 1;
    ControlPanel.gameSpeedControl.refresh();
  }

  private static addGameControls(game: GameController) {
    ControlPanel.engineFolder = game.pane.addFolder({
      title: "Engine",
      expanded: false,
    });

    ControlPanel.gameSpeedControl = ControlPanel.engineFolder
      .addBinding(ControlPanel.stats, "gameSpeed", {
        label: "Game speed",
        min: 0,
        max: 10,
      })
      .on("change", ({ value }) => (game.ticker.speed = value));

    ControlPanel.engineFolder
      .addButton({ title: "Restart" })
      .on("click", () => {
        Engine.resetGame();
        Engine.startGame();
      });

    ControlPanel.addGraphicsButton(ControlPanel.engineFolder);
  }

  private static addGraphicsButton(parent: FolderApi) {
    const nextGraphics = () =>
      Engine.graphics === "High"
        ? "Medium"
        : Engine.graphics === "Medium"
          ? "Low"
          : "High";

    const getGraphicsTitle = () => {
      return "Graphics: " + Engine.graphics;
    };

    const graphicsBtn = parent.addButton({
      title: getGraphicsTitle(),
    });

    graphicsBtn.on("click", () => {
      Engine.changeSettings({ graphics: nextGraphics() });
    });

    Engine.events.on("engine:settings-updated", () => {
      graphicsBtn.title = getGraphicsTitle();
    });
  }
}
