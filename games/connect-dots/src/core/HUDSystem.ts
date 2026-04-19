import { System } from "@falkura-pet/game-base";
import { HTMLText } from "pixi.js";
import { ConnectDots } from "../ConnectDots";
import { MainSystem } from "./MainSystem";

const HUD = {
  text: "#f8fafc",
  accent: "#7dd3fc",
  accentWarm: "#ffd43b",
};

export class HUDSystem extends System<ConnectDots> {
  static MODULE_ID = "hud";

  private built = false;
  private infoText: HTMLText;

  override start(): void {
    if (!this.built) {
      this.build();
      this.built = true;
    }

    this.onLevelStart();
  }

  onLevelStart() {
    this.syncTexts();
  }

  private get main() {
    return this.game.systems.get(MainSystem);
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
            fontSize: manager.isMobile ? 44 : 24,
          },
          t2: {
            fill: HUD.text,
            fontWeight: "bold",
            fontSize: manager.isMobile ? 56 : 28,
          },
          t3: { fill: HUD.accent, fontSize: manager.isMobile ? 24 : 18 },
        };
      },
    });
  }

  private syncTexts() {
    const main = this.main;

    this.infoText.text =
      `<t1>LEVEL ${main.levelNumber} / ${main.levelCount}</t1><br>` +
      `<t2>${main.levelTitle.toUpperCase()}</t2><br>` +
      `<t3>${main.levelSource}</t3>`;
  }
}
