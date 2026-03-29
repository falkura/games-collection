import { Engine, GAME_STATE } from "@falkura-pet/engine";
import { Assets } from "pixi.js";
import { FolderApi, Pane } from "tweakpane";
import { GameBase } from "./GameBase";

export class ControlPanel {
  static engineFolder: FolderApi;
  static gameSystemsFolder: FolderApi;
  static initialized = false;
  static gameSpeedControl: ReturnType<Pane["addBinding"]>;
  static stats = {
    fps: 0,
    gameSpeed: 1,
  };

  public static init(game: GameBase) {
    if (ControlPanel.initialized) return;
    ControlPanel.initialized = true;

    game.pane.title = Assets.get("game.json").title;

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

    ControlPanel.gameSystemsFolder = ControlPanel.engineFolder.addFolder({
      title: "Systems",
    });
  }

  public static reset() {
    ControlPanel.stats.gameSpeed = 1;
    ControlPanel.gameSpeedControl.refresh();
  }

  public static onSystemAdded(system: string, game: GameBase) {
    const getTitle = () => {
      let title = game.systems.get(system) ? "🟢" : "⚫";
      return title + " " + system;
    };

    const button = ControlPanel.gameSystemsFolder.addButton({
      title: getTitle(),
    });

    Engine.events.internal.on("engine:game-reseted", () => {
      button.title = getTitle();
    });

    button.on("click", () => {
      if (game.systems.get(system)) {
        game.systems.disable(system);
      } else {
        game.systems.enable(system);
      }

      button.title = getTitle();
    });
  }

  public static addGameControls(parent: FolderApi) {
    const getPauseTitle = () => {
      return Engine.state === GAME_STATE.Paused ? "▶ Resume" : "⏸ Pause";
    };

    const pauseBtn = parent.addButton({
      title: getPauseTitle(),
      disabled: true,
    });

    pauseBtn.on("click", () => {
      Engine.events.ui.emit("ui:change-game-paused");
    });

    Engine.events.internal.on("engine:game-paused", () => {
      pauseBtn.title = getPauseTitle();
    });

    Engine.events.internal.on("engine:game-resumed", () => {
      pauseBtn.title = getPauseTitle();
    });

    Engine.events.internal.on("engine:game-started", () => {
      pauseBtn.disabled = false;
    });

    parent.addButton({ title: "Restart" }).on("click", () => {
      Engine.events.ui.emit("ui:restart-game");
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
      Engine.events.ui.emit("ui:update-settings", { graphics: nextGraphics() });
    });

    Engine.events.internal.on("engine:settings-updated", () => {
      graphicsBtn.title = getGraphicsTitle();
    });
  }
}
