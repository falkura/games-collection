import { System } from "@falkura-pet/game-base";
import { Engine } from "@falkura-pet/engine";
import { Container, Graphics, Text } from "pixi.js";
import { ConnectDots } from "../ConnectDots";
import { MainSystem } from "./MainSystem";

const HUD = {
  text: "#f8fafc",
  muted: "#9fb3c8",
  accent: "#7dd3fc",
  accentWarm: "#ffd43b",
  panel: "#0f1b2f",
  panelStroke: "#2a3e62",
  success: "#34d399",
  hover: "#1d3557",
  overlayTint: "#000000",
};

export class HUDSystem extends System<ConnectDots> {
  static MODULE_ID = "hud";

  private built = false;
  private levelText!: Text;
  private detailText!: Text;
  private sourceText!: Text;

  private overlay!: Container;
  private overlayBg!: Graphics;
  private overlayTitle!: Text;
  private overlaySub!: Text;
  private buttonRow!: Container;
  private prevButton!: Container;
  private restartButton!: Container;
  private nextButton!: Container;

  private shownLevel = -1;
  private overlayShownForLevel = -1;
  private buttonWidth = 240;
  private buttonHeight = 72;

  override start(): void {
    if (!this.built) {
      this.build();
      this.built = true;
    }
    this.syncTexts();
    this.overlay.visible = false;
  }

  override reset(): void {
    if (!this.built) return;
    this.overlay.visible = false;
    this.overlayShownForLevel = -1;
  }

  override resize(): void {
    if (!this.built) return;
    this.layoutAll();
  }

  override tick(): void {
    if (!this.built) return;
    const main = this.main;
    if (!main) return;

    if (main.levelNumber !== this.shownLevel) {
      this.syncTexts();
      this.overlay.visible = false;
    }

    if (main.completed && this.overlayShownForLevel !== main.levelNumber) {
      this.overlay.visible = true;
      this.overlayShownForLevel = main.levelNumber;
      this.overlayTitle.text = "LEVEL COMPLETE";
      this.overlaySub.text = `${main.levelTitle} cleared.`;
      this.layoutAll();
    }
  }

  private get main() {
    return this.game.systems.get(MainSystem);
  }

  private get textScale() {
    return Engine.layout.isMobile ? 1.3 : 1;
  }

  private build() {
    this.levelText = new Text({
      text: "",
      style: {
        fill: HUD.accentWarm,
        fontFamily: "monospace",
        fontWeight: "bold",
      },
    });
    this.levelText.x = 30;
    this.levelText.y = 20;
    this.view.addChild(this.levelText);

    this.detailText = new Text({
      text: "",
      style: {
        fill: HUD.text,
        fontFamily: "monospace",
        fontWeight: "bold",
      },
    });
    this.detailText.x = 30;
    this.view.addChild(this.detailText);

    this.sourceText = new Text({
      text: "",
      style: {
        fill: HUD.accent,
        fontFamily: "monospace",
      },
    });
    this.sourceText.x = 30;
    this.view.addChild(this.sourceText);

    this.overlay = new Container();
    this.overlay.visible = false;

    this.overlayBg = new Graphics();
    this.overlayBg.eventMode = "static";
    this.overlay.addChild(this.overlayBg);

    this.overlayTitle = new Text({
      text: "",
      style: {
        fill: HUD.text,
        fontFamily: "monospace",
        fontWeight: "bold",
        align: "center",
        wordWrap: true,
      },
    });
    this.overlayTitle.anchor.set(0.5);
    this.overlay.addChild(this.overlayTitle);

    this.overlaySub = new Text({
      text: "",
      style: {
        fill: HUD.muted,
        fontFamily: "monospace",
        align: "center",
        wordWrap: true,
      },
    });
    this.overlaySub.anchor.set(0.5);
    this.overlay.addChild(this.overlaySub);

    this.buttonRow = new Container();
    this.prevButton = this.makeButton("PREV", () => this.main.prevLevel());
    this.restartButton = this.makeButton("RESTART", () => this.main.resetLevel());
    this.nextButton = this.makeButton("NEXT", () => this.main.nextLevel());
    this.buttonRow.addChild(this.prevButton, this.restartButton, this.nextButton);
    this.overlay.addChild(this.buttonRow);

    this.view.addChild(this.overlay);
    this.layoutAll();
  }

  private makeButton(label: string, onTap: () => void): Container {
    const button = new Container();
    button.eventMode = "static";
    button.cursor = "pointer";

    const bg = new Graphics();
    const text = new Text({
      text: label,
      style: {
        fill: HUD.text,
        fontFamily: "monospace",
        fontWeight: "bold",
        fontSize: 26,
      },
    });
    text.anchor.set(0.5);

    const redraw = (hovered: boolean) => {
      bg.clear()
        .roundRect(0, 0, this.buttonWidth, this.buttonHeight, 18)
        .fill({ color: hovered ? HUD.hover : HUD.panel, alpha: 0.95 })
        .stroke({ color: HUD.panelStroke, width: 2 });
      text.x = this.buttonWidth / 2;
      text.y = this.buttonHeight / 2;
    };

    redraw(false);
    button.on("pointerover", () => redraw(true));
    button.on("pointerout", () => redraw(false));
    button.on("pointertap", onTap);
    button.addChild(bg, text);
    return button;
  }

  private syncTexts() {
    const main = this.main;
    this.levelText.text = `LEVEL ${main.levelNumber} / ${main.levelCount}`;
    this.detailText.text = `${main.levelTitle.toUpperCase()}    ${main.levelMeta}`;
    this.sourceText.text = main.levelSource;
    this.shownLevel = main.levelNumber;
    this.layoutAll();
  }

  private layoutAll() {
    const { width, height } = Engine.layout.screen;
    const isPortrait = Engine.layout.isPortrait;
    const mobile = Engine.layout.isMobile;
    const s = this.textScale;

    this.levelText.style.fontSize = 20 * s;
    this.detailText.style.fontSize = 28 * s;
    this.sourceText.style.fontSize = 18 * s;
    this.detailText.y = this.levelText.y + 28 * s;
    this.sourceText.y = this.detailText.y + 40 * s;
    this.sourceText.style.wordWrap = true;
    this.sourceText.style.wordWrapWidth = Math.max(320, width - 60);

    this.overlayBg
      .clear()
      .rect(0, 0, width, height)
      .fill({ color: HUD.overlayTint, alpha: 0.78 });

    this.overlayTitle.style.fontSize = (mobile ? 58 : 72) * s;
    this.overlayTitle.style.wordWrapWidth = Math.max(240, width - 80);
    this.overlayTitle.x = width / 2;
    this.overlayTitle.y = height / 2 - 150;

    this.overlaySub.style.fontSize = (mobile ? 28 : 34) * s;
    this.overlaySub.style.wordWrapWidth = Math.max(240, width - 100);
    this.overlaySub.x = width / 2;
    this.overlaySub.y = height / 2 - 64;

    this.buttonWidth = mobile ? 280 : 240;
    this.buttonHeight = mobile ? 88 : 72;

    for (const btn of this.buttonRow.children) {
      const bg = btn.children[0] as Graphics | undefined;
      const text = btn.children.find((child) => child instanceof Text) as Text | undefined;
      if (text) {
        text.style.fontSize = (mobile ? 30 : 26) * s;
        text.x = this.buttonWidth / 2;
        text.y = this.buttonHeight / 2;
      }
      if (bg) {
        bg.clear()
          .roundRect(0, 0, this.buttonWidth, this.buttonHeight, 18)
          .fill({ color: HUD.panel, alpha: 0.95 })
          .stroke({ color: HUD.panelStroke, width: 2 });
      }
    }

    this.layoutButtons(width, height, isPortrait);
  }

  private layoutButtons(width: number, height: number, isPortrait: boolean) {
    const gap = isPortrait ? 20 : 24;
    const visibleChildren = this.buttonRow.children.filter((c) => c.visible);

    if (isPortrait) {
      let y = 0;
      for (const c of visibleChildren) {
        c.x = 0;
        c.y = y;
        y += this.buttonHeight + gap;
      }
    } else {
      const totalWidth =
        visibleChildren.length * this.buttonWidth +
        (visibleChildren.length - 1) * gap;
      let x = -totalWidth / 2;
      for (const c of visibleChildren) {
        c.x = x;
        c.y = 0;
        x += this.buttonWidth + gap;
      }
    }

    this.buttonRow.x = width / 2;
    this.buttonRow.y = height / 2 + (isPortrait ? 150 : 170);
  }
}
