import { HTMLText } from "pixi.js";
import { ConnectDots } from "../ConnectDots";
import { MainSystem } from "./MainSystem";
import { Engine, Layout } from "@falkura-pet/engine";
import { System } from "./System";

const HUD = {
  text: "#f8fafc",
  accent: "#7dd3fc",
  accentWarm: "#ffd43b",
};

export class HUDSystem extends System<ConnectDots> {
  static MODULE_ID = "hud";

  private infoText: HTMLText;

  override start(): void {
    this.onLevelStart();
  }

  onLevelStart() {
    this.syncTexts();
  }

  override build() {
    this.infoText = new HTMLText({
      style: {
        fill: HUD.text,
        fontFamily: "monospace",
        fontSize: 20,
        wordWrap: true,
        breakWords: true,
      },
      resolution: Engine.textResolution,
    });

    this.view.addChild(this.infoText);
  }

  override resize(): void {
    this.infoText.x = Layout.screen.fromLeft(30);
    this.infoText.y = Layout.screen.fromTop(20);

    this.infoText.style.wordWrapWidth = Layout.screen.width - 80;
    this.infoText.style.tagStyles = {
      t1: {
        fill: HUD.accentWarm,
        fontWeight: "bold",
        fontSize: Layout.isMobile ? 44 : 24,
      },
      t2: {
        fill: HUD.text,
        fontWeight: "bold",
        fontSize: Layout.isMobile ? 56 : 28,
      },
      t3: { fill: HUD.accent, fontSize: Layout.isMobile ? 24 : 18 },
    };
  }

  private syncTexts() {
    const main = this.game.systems.get(MainSystem);

    this.infoText.text =
      `<t1>LEVEL ${main.levelNumber} / ${main.levelCount}</t1><br>` +
      `<t2>${main.levelTitle.toUpperCase()}</t2><br>` +
      `<t3>${main.levelSource}</t3>`;
  }
}
