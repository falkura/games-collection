import { System } from "@falkura-pet/game-base";
import { Engine } from "@falkura-pet/engine";
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

  private built = false;
  private titleText!: HTMLText;
  private statsText!: HTMLText;
  private buttonRow!: Container;
  private retryButton!: Container;
  private nextButton!: Container;
  private buttonResizers: Array<() => void> = [];

  private buttonWidth = 240;
  private buttonHeight = 72;
  private buttonFontSize = 26;

  override start(): void {
    if (!this.built) {
      this.build();
      this.built = true;
    }
    this.view.visible = false;
  }

  override reset(): void {
    this.view.visible = false;
  }

  private build() {
    this.view.visible = false;

    const bg = new Graphics().rect(0, 0, 1, 1).fill({
      color: OVERLAY.tint,
      alpha: 0.78,
    });
    bg.eventMode = "static";
    this.view.addChildWithLayout(bg, {
      width: "sw",
      height: "sh",
    });

    this.titleText = new HTMLText({
      style: {
        fill: OVERLAY.muted,
        fontFamily: "monospace",
        align: "center",
        wordWrap: true,
      },
      anchor: 0.5,
    });

    this.view.addChildWithLayout(this.titleText, {
      x: "sw / 2",
      y: "sh / 2 - 120",
      onResize: ({ manager, view, vars }) => {
        const s = manager.isMobile ? 1.3 : 1;
        view.style.fontSize = (manager.isMobile ? 26 : 32) * s;
        view.style.wordWrapWidth = Math.max(240, vars.sw - 80);
        view.style.tagStyles = {
          win: {
            fill: OVERLAY.win,
            fontWeight: "bold",
            fontSize: (manager.isMobile ? 58 : 72) * s,
          },
          lose: {
            fill: OVERLAY.lose,
            fontWeight: "bold",
            fontSize: (manager.isMobile ? 58 : 72) * s,
          },
        };
      },
    });

    this.statsText = new HTMLText({
      style: {
        fill: OVERLAY.accent,
        fontFamily: "monospace",
        fontWeight: "bold",
        align: "center",
      },
      anchor: 0.5,
    });
    this.view.addChildWithLayout(this.statsText, {
      x: "sw / 2",
      y: "sh / 2 + 40",
      onResize: ({ manager, view }) => {
        view.style.fontSize = manager.isMobile ? 28 : 22;
      },
    });

    this.buttonRow = new Container();
    this.retryButton = this.makeButton("RETRY", () => this.game.retry());
    this.nextButton = this.makeButton("NEXT LEVEL", () =>
      this.game.nextLevel(),
    );
    this.buttonRow.addChild(this.retryButton, this.nextButton);

    this.view.addChildWithLayout(this.buttonRow, {
      x: "sw / 2",
      y: "sh / 2 + 180",
      portrait: { y: "sh / 2 + 200" },
      onResize: ({ manager }) => {
        const mobile = manager.isMobile;
        this.buttonWidth = mobile ? 280 : 240;
        this.buttonHeight = mobile ? 88 : 72;
        this.buttonFontSize = mobile ? 36 : 26;
        for (const redraw of this.buttonResizers) redraw();
        this.layoutButtons(manager.isPortrait);
      },
    });

    Engine.events.on("engine:game-finished", this.onFinished);
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
    const redraw = () => {
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

  private layoutButtons(isPortrait: boolean) {
    const visible = this.buttonRow.children.filter((c) => c.visible);
    const n = visible.length;
    if (n === 0) return;
    const gap = isPortrait ? 20 : 24;

    if (isPortrait) {
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

  private onFinished = (data?: FinishData) => {
    if (!this.built || !data) return;

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
    const nextText = this.nextButton.children.find(
      (c) => c instanceof Text,
    ) as Text | undefined;
    if (nextText) nextText.text = nextLabel;

    this.nextButton.visible = data.won;
    this.retryButton.visible = true;

    this.view.visible = true;
    this.layoutButtons(Engine.layout.isPortrait);
  };
}
