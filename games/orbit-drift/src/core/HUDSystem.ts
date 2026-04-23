import { HTMLText } from "pixi.js";
import { OrbitDrift } from "../OrbitDrift";
import { SpaceSystem, TOTAL_LEVELS } from "./SpaceSystem";
import { Engine, Layout, System } from "@falkura-pet/engine";

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

  private text: HTMLText;
  private active: boolean;
  private space: SpaceSystem;

  override start(): void {
    this.active = true;
  }

  override reset(): void {
    this.active = false;
    this.text.text = "";
  }

  override finish(data?: any): void {
    this.active = false;
  }

  public update(): void {
    if (!this.space) return;
    const total = this.space.orbs.length;

    this.text.text =
      `<t1>LEVEL ${this.space.currentLevel} / ${TOTAL_LEVELS}</t1><br>` +
      `<t2>${this.space.levelName.toUpperCase()}</t2><br>` +
      `<t3>ORBS ${this.space.collected}/${total}   TIME ${formatTime(this.space.elapsedMs)}   SHOTS ${this.space.shots}</t3>`;
  }

  override tick() {
    this.active && this.update();
  }

  override build() {
    this.space = this.game.systems.get(SpaceSystem);

    this.text = new HTMLText({
      style: {
        fill: HUD.text,
        fontFamily: "monospace",
        fontSize: 20,
        wordWrap: true,
        breakWords: true,
      },
      resolution: Engine.textResolution,
    });

    this.text.x = 30;
    this.text.y = 20;

    this.view.addChild(this.text);
  }

  override resize(): void {
    this.text.style.wordWrapWidth = Layout.screen.width - 80;
    this.text.style.tagStyles = {
      t1: {
        fill: HUD.accentWarm,
        fontWeight: "bold",
        fontSize: Layout.isMobile ? 40 : 22,
      },
      t2: {
        fill: HUD.text,
        fontWeight: "bold",
        fontSize: Layout.isMobile ? 52 : 28,
      },
      t3: { fill: HUD.accent, fontSize: Layout.isMobile ? 26 : 18 },
    };
  }
}
