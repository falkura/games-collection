import { Engine, Layout, System } from "@falkura-pet/engine";
import { Container, Graphics, HTMLText, Text } from "pixi.js";
import { OrbitDrift } from "../OrbitDrift";
import { TOTAL_LEVELS } from "./SpaceSystem";
import type { FinishData, FinishReason } from "../types";

const OVERLAY = {
  text: "#f8fbff",
  muted: "#cccccc",
  panel: "#0f182a",
  panelStroke: "#2a3e62",
  hover: "#1d3557",
  tint: "#000000",
  accent: "#ffd43b",
  win: "#55efc4",
  lose: "#ff6b6b",
};

const REASON_LABEL: Record<NonNullable<FinishReason>, string> = {
  collision: "PLANET IMPACT",
  "out-of-bounds": "LOST IN SPACE",
  chaser: "HUNTED DOWN",
  projectile: "SHOT DOWN",
  wall: "WALL IMPACT",
  win: "MISSION COMPLETE",
};

function formatTime(ms: number) {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export class OverlaySystem extends System<OrbitDrift> {
  static MODULE_ID = "overlay";

  private titleText: HTMLText;
  private statsText: HTMLText;
  private background: Graphics;
  private buttonRow: Container;
  private retryButton: Container;
  private nextButton: Container;
  private buttonResizers: Array<(resize?: boolean) => void> = [];

  private buttonWidth = 240;
  private buttonHeight = 72;
  private buttonFontSize = 26;

  override build() {
    this.background = new Graphics().rect(0, 0, 1, 1).fill({
      color: OVERLAY.tint,
      alpha: 0.78,
    });
    this.background.eventMode = "static";

    this.titleText = new HTMLText({
      style: {
        fill: OVERLAY.muted,
        fontFamily: "monospace",
        align: "center",
        wordWrap: true,
      },
      resolution: Engine.textResolution,
      anchor: 0.5,
    });

    this.statsText = new HTMLText({
      style: {
        fill: OVERLAY.accent,
        fontFamily: "monospace",
        fontWeight: "bold",
        align: "center",
      },
      resolution: Engine.textResolution,
      anchor: 0.5,
    });

    this.buttonRow = new Container();

    this.retryButton = this.makeButton("RETRY", () => this.game.retry());
    this.nextButton = this.makeButton("NEXT LEVEL", () =>
      this.game.nextLevel(),
    );

    this.buttonRow.addChild(this.retryButton, this.nextButton);

    this.view.addChild(
      this.background,
      this.titleText,
      this.statsText,
      this.buttonRow,
    );
  }

  override resize(): void {
    this.background.width = Layout.screen.width;
    this.background.height = Layout.screen.height;

    this.titleText.x = Layout.screen.center.x;
    this.titleText.y = Layout.screen.center.y - 120;

    this.titleText.style.fontSize = Layout.isMobile ? 34 : 42;
    this.titleText.style.wordWrapWidth = 880;
    this.titleText.style.tagStyles = {
      win: {
        fill: OVERLAY.win,
        fontWeight: "bold",
        fontSize: Layout.isMobile ? 76 : 94,
      },
      lose: {
        fill: OVERLAY.lose,
        fontWeight: "bold",
        fontSize: Layout.isMobile ? 76 : 94,
      },
    };

    this.statsText.x = Layout.screen.center.x;
    this.statsText.y = Layout.screen.center.y + 40;
    this.statsText.style.fontSize = Layout.isMobile ? 28 : 22;

    this.buttonRow.x = Layout.screen.center.x;
    this.buttonRow.y = Layout.screen.center.y + (Layout.isMobile ? 200 : 180);

    this.buttonWidth = Layout.isMobile ? 280 : 240;
    this.buttonHeight = Layout.isMobile ? 88 : 72;
    this.buttonFontSize = Layout.isMobile ? 36 : 26;

    for (const redraw of this.buttonResizers) redraw(true);
    this.layoutButtons();
  }

  private makeButton(label: string, onTap: () => void): Container {
    const button = new Container();
    button.eventMode = "static";
    button.cursor = "pointer";

    const bg = new Graphics();
    const text = new Text({
      text: label,
      style: {
        fill: OVERLAY.text,
        fontFamily: "monospace",
        fontWeight: "bold",
        fontSize: 26,
      },
      anchor: 0.5,
    });
    button.addChild(bg, text);

    let hovered = false;
    const redraw = (resize = false) => {
      if (resize) hovered = false;

      text.style.fontSize = this.buttonFontSize;
      text.x = this.buttonWidth / 2;
      text.y = this.buttonHeight / 2;
      bg.clear()
        .roundRect(0, 0, this.buttonWidth, this.buttonHeight, 18)
        .fill({ color: hovered ? OVERLAY.hover : OVERLAY.panel, alpha: 0.95 })
        .stroke({ color: OVERLAY.panelStroke, width: 2 });
    };

    redraw();
    this.buttonResizers.push(redraw);

    button.on("pointerover", () => {
      hovered = true;
      redraw();
    });
    button.on("pointerout", () => {
      hovered = false;
      redraw();
    });
    button.on("pointertap", onTap);

    return button;
  }

  private layoutButtons() {
    const visible = this.buttonRow.children.filter((c) => c.visible);
    const n = visible.length;
    if (n === 0) return;

    const gap = Layout.isPortrait ? 20 : 24;

    if (Layout.isPortrait) {
      let y = -(n * this.buttonHeight + (n - 1) * gap) / 2;
      for (const c of visible) {
        c.x = -this.buttonWidth / 2;
        c.y = y;
        y += this.buttonHeight + gap;
      }
    } else {
      let x = -(n * this.buttonWidth + (n - 1) * gap) / 2;
      for (const c of visible) {
        c.x = x;
        c.y = 0;
        x += this.buttonWidth + gap;
      }
    }
  }

  override mount(): void {
    this.titleText.text = "";
    this.statsText.text = "";
  }

  showResult(data?: FinishData) {
    if (!data) {
      throw new Error("No win data to finish");
    }

    const tag = data.won ? "win" : "lose";
    const label = REASON_LABEL[data.reason ?? "out-of-bounds"];
    const sub = data.won
      ? data.level >= TOTAL_LEVELS
        ? `You cleared all ${TOTAL_LEVELS} levels.`
        : `Level ${data.level} cleared.`
      : `Level ${data.level} failed.`;

    this.titleText.text = `<${tag}>${label}</${tag}><br><br>${sub}`;
    this.statsText.text = `TIME ${formatTime(data.time)}    SHOTS ${data.shots}    ORBS ${data.collected} / ${data.total}`;

    const nextLabel =
      data.won && data.level >= TOTAL_LEVELS ? "PLAY AGAIN" : "NEXT LEVEL";
    const nextText = this.nextButton.children.find((c) => c instanceof Text) as
      | Text
      | undefined;
    if (nextText) nextText.text = nextLabel;

    this.nextButton.visible = data.won;
    this.retryButton.visible = true;

    this.view.visible = true;
    this.layoutButtons();
  }
}
