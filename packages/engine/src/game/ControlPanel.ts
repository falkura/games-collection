import { Assets } from "pixi.js";
import { FolderApi, Pane } from "tweakpane";
import { GameController } from "./GameController";
import { Engine } from "../Engine";

export class ControlPanel {
  static engineFolder: FolderApi;
  static initialized = false;
  static gameSpeedControl: ReturnType<Pane["addBinding"]>;
  static stats = {
    fps: 0,
    gameSpeed: 1,
  };

  static options = {
    startFolded: true,
    foldedTitle: "⚙️",
  };

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

    ControlPanel.addGameControls(ControlPanel.engineFolder);
    ControlPanel.addGraphicsButton(ControlPanel.engineFolder);

    if (ControlPanel.options.startFolded) {
      game.pane.expanded = false;
    }

    syncTitle();
  }

  public static reset() {
    ControlPanel.stats.gameSpeed = 1;
    ControlPanel.gameSpeedControl.refresh();
  }

  public static addGameControls(parent: FolderApi) {
    parent.addButton({ title: "Restart" }).on("click", () => {
      Engine.restartGame();
    });
  }

  public static addGraphicsButton(parent: FolderApi) {
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
