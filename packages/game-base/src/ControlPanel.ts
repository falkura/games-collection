import { Engine, GAME_STATE } from "@falkura-pet/engine";
import { Assets } from "pixi.js";
import { FolderApi } from "tweakpane";
import { GameBase } from "./GameBase";

export class ControlPanel {
  static engineFolder: FolderApi;
  static gameSystemsFolder: FolderApi;
  static initialized = false;

  public static init(game: GameBase) {
    if (ControlPanel.initialized) return;
    ControlPanel.initialized = true;

    game.pane.title = Assets.get("game.json").title;
    ControlPanel.engineFolder = game.pane.addFolder({
      title: "Engine",
      expanded: false,
    });

    ControlPanel.addGameControls(ControlPanel.engineFolder);
    ControlPanel.addMusicButton(ControlPanel.engineFolder);
    ControlPanel.addGraphicsButton(ControlPanel.engineFolder);

    ControlPanel.gameSystemsFolder = ControlPanel.engineFolder.addFolder({
      title: "Systems",
    });
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

  public static addMusicButton(parent: FolderApi) {
    const getMusicTitle = () => {
      return Engine.muted ? "Music OFF" : "Music ON";
    };

    const musicBtn = parent.addButton({
      title: getMusicTitle(),
    });

    musicBtn.on("click", () => {
      Engine.events.ui.emit("ui:update-settings", {
        mute: !Engine.muted,
      });
    });

    Engine.events.internal.on("engine:settings-updated", () => {
      musicBtn.title = getMusicTitle();
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
