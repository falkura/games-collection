import { System } from "@falkura-pet/game-base";
import { HTMLText } from "pixi.js";
import { OrbitDrift } from "../OrbitDrift";
import { SpaceSystem, TOTAL_LEVELS } from "./SpaceSystem";

const HUD = {
  text: "#f8fbff",
  accent: "#7cc7ff",
  accentWarm: "#ffd43b",
};

function formatTime(ms: number) {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export class HUDSystem extends System<OrbitDrift> {
  static MODULE_ID = "hud";

  private built = false;
  private infoText!: HTMLText;

  override start(): void {
    if (!this.built) {
      this.build();
      this.built = true;
    }
    this.sync();
  }

  override reset(): void {
    if (this.built) this.infoText.text = "";
  }

  override tick(): void {
    if (!this.built) return;
    this.sync();
  }

  private build() {
    this.infoText = new HTMLText({
      style: {
        fill: HUD.text,
        fontFamily: "monospace",
        fontSize: 20,
        wordWrap: true,
        breakWords: true,
      },
    });

    this.view.addChildWithLayout(this.infoText, {
      x: 30,
      y: 20,
      onResize: ({ manager, view, vars }) => {
        view.style.wordWrapWidth = vars.sw - 80;
        view.style.tagStyles = {
          t1: {
            fill: HUD.accentWarm,
            fontWeight: "bold",
            fontSize: manager.isMobile ? 40 : 22,
          },
          t2: {
            fill: HUD.text,
            fontWeight: "bold",
            fontSize: manager.isMobile ? 52 : 28,
          },
          t3: { fill: HUD.accent, fontSize: manager.isMobile ? 26 : 18 },
        };
      },
    });

    this.view.on("visibleChanged", (v) => {
      if (v) this.infoText.updateCacheTexture();
    });
  }

  private sync() {
    const space = this.game.systems.get(SpaceSystem);
    if (!space) return;
    const total = space.orbs.length;

    this.infoText.text =
      `<t1>LEVEL ${space.currentLevel} / ${TOTAL_LEVELS}</t1><br>` +
      `<t2>${space.levelName.toUpperCase()}</t2><br>` +
      `<t3>ORBS ${space.collected}/${total}   TIME ${formatTime(space.elapsedMs)}   SHOTS ${space.shots}</t3>`;
  }
}
