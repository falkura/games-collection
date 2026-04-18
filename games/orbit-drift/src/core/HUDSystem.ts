import { System } from "@falkura-pet/game-base";
import { Engine } from "@falkura-pet/engine";
import { Container, Graphics, Text } from "pixi.js";
import { OrbitDrift } from "../OrbitDrift";
import { SpaceSystem, TOTAL_LEVELS } from "./SpaceSystem";
import type { FinishData } from "./SpaceSystem";
import { OVERLAY_BUTTON } from "../config";

const REASON_LABEL: Record<NonNullable<FinishData["reason"]>, string> = {
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

export class HUDSystem extends System<OrbitDrift> {
  static MODULE_ID = "hud";

  private built = false;

  private levelText!: Text;
  private scoreText!: Text;
  private statsText!: Text;
  private infoText!: Text;

  private overlay!: Container;
  private overlayBg!: Graphics;
  private overlayTitle!: Text;
  private overlaySub!: Text;
  private overlayStats!: Text;
  private buttonRow!: Container;
  private retryButton!: Container;
  private nextButton!: Container;

  override start(): void {
    if (!this.built) {
      this.build();
      this.built = true;
    }
    this.syncLevelText();
  }

  override reset(): void {
    if (!this.built) return;
    this.overlay.visible = false;
    this.scoreText.text = "";
    this.statsText.text = "";
  }

  override resize(): void {
    if (!this.built) return;
    this.layoutAll();
  }

  override tick(): void {
    if (!this.built) return;
    const space = this.game.systems.get(SpaceSystem);
    if (!space) return;

    const total = space.orbs.length;
    this.scoreText.text = `ORBS ${space.collected} / ${total}`;
    this.statsText.text = `TIME ${formatTime(space.elapsedMs)}    SHOTS ${space.shots}`;

    if (space.currentLevel !== this.shownLevel) this.syncLevelText();
  }

  private shownLevel = -1;

  private syncLevelText() {
    const space = this.game.systems.get(SpaceSystem);
    if (!space || !this.levelText) return;
    this.levelText.text = `LEVEL ${space.currentLevel} / ${TOTAL_LEVELS} — ${space.levelName.toUpperCase()}`;
    this.shownLevel = space.currentLevel;
  }

  private get textScale() {
    return Engine.layout.isMobile ? 1.3 : 1;
  }

  private build() {
    this.levelText = new Text({
      text: "",
      style: {
        fill: 0xffd43b,
        fontSize: 16,
        fontFamily: "monospace",
        fontWeight: "bold",
      },
    });
    this.levelText.x = 30;
    this.levelText.y = 20;
    this.view.addChild(this.levelText);

    this.scoreText = new Text({
      text: "",
      style: {
        fill: 0xffffff,
        fontSize: 28,
        fontFamily: "monospace",
        fontWeight: "bold",
      },
    });
    this.scoreText.x = 30;
    this.view.addChild(this.scoreText);

    this.statsText = new Text({
      text: "",
      style: {
        fill: 0xaaccff,
        fontSize: 16,
        fontFamily: "monospace",
        fontWeight: "bold",
      },
    });
    this.statsText.x = 30;
    this.view.addChild(this.statsText);

    this.infoText = new Text({
      text:
        "Drag anywhere to slingshot. Use gravity to enter orbits and collect every energy orb. Avoid planets, walls, chasers, and incoming fire.",
      style: {
        fill: 0xaaaaaa,
        fontSize: 16,
        fontFamily: "monospace",
        wordWrap: true,
        wordWrapWidth: 800,
        align: "left",
      },
    });
    this.infoText.anchor.set(0, 1);
    this.infoText.x = 30;
    this.view.addChild(this.infoText);

    this.overlay = new Container();
    this.overlay.visible = false;

    this.overlayBg = new Graphics();
    this.overlayBg.eventMode = "static";
    this.overlay.addChild(this.overlayBg);

    this.overlayTitle = new Text({
      text: "",
      style: {
        fill: 0xffffff,
        fontSize: 72,
        fontFamily: "monospace",
        fontWeight: "bold",
        align: "center",
        wordWrap: true,
        wordWrapWidth: 1200,
      },
    });
    this.overlayTitle.anchor.set(0.5, 0.5);
    this.overlay.addChild(this.overlayTitle);

    this.overlaySub = new Text({
      text: "",
      style: {
        fill: 0xcccccc,
        fontSize: 22,
        fontFamily: "monospace",
        align: "center",
        wordWrap: true,
        wordWrapWidth: 900,
      },
    });
    this.overlaySub.anchor.set(0.5, 0.5);
    this.overlay.addChild(this.overlaySub);

    this.overlayStats = new Text({
      text: "",
      style: {
        fill: 0xffd43b,
        fontSize: 26,
        fontFamily: "monospace",
        fontWeight: "bold",
        align: "center",
      },
    });
    this.overlayStats.anchor.set(0.5, 0.5);
    this.overlay.addChild(this.overlayStats);

    this.buttonRow = new Container();
    this.retryButton = this.makeButton("RETRY", 0xff6b6b, () => {
      this.game.systems.get(SpaceSystem).retry();
    });
    this.nextButton = this.makeButton("NEXT LEVEL", 0x55efc4, () => {
      this.game.systems.get(SpaceSystem).nextLevel();
    });
    this.buttonRow.addChild(this.retryButton, this.nextButton);
    this.overlay.addChild(this.buttonRow);

    this.view.addChild(this.overlay);

    Engine.events.on("engine:game-finished", this.onFinished);

    this.layoutAll();
  }

  private makeButton(label: string, color: number, onClick: () => void): Container {
    const c = new Container();
    c.eventMode = "static";
    c.cursor = "pointer";

    const w = OVERLAY_BUTTON.WIDTH;
    const h = OVERLAY_BUTTON.HEIGHT;

    const bg = new Graphics();
    const text = new Text({
      text: label,
      style: {
        fill: 0xffffff,
        fontSize: OVERLAY_BUTTON.FONT_SIZE,
        fontFamily: "monospace",
        fontWeight: "bold",
      },
    });
    text.anchor.set(0.5);

    const redraw = (hover: boolean) => {
      bg.clear()
        .roundRect(-w / 2, -h / 2, w, h, OVERLAY_BUTTON.RADIUS)
        .fill({ color, alpha: hover ? 0.3 : 0.16 })
        .stroke({ color, width: 3 });
    };
    redraw(false);

    c.addChild(bg, text);
    c.on("pointerover", () => redraw(true));
    c.on("pointerout", () => redraw(false));
    c.on("pointertap", onClick);

    return c;
  }

  private layoutAll() {
    const { width, height } = Engine.layout.screen;
    const isPortrait = Engine.layout.isPortrait;
    const s = this.textScale;

    this.levelText.style.fontSize = 16 * s;
    this.scoreText.style.fontSize = 28 * s;
    this.statsText.style.fontSize = 16 * s;
    this.scoreText.y = this.levelText.y + 24 * s;
    this.statsText.y = this.scoreText.y + 40 * s;

    this.infoText.style.fontSize = (isPortrait ? 24 : 16) * s;
    this.infoText.style.wordWrapWidth = Math.max(200, width - 60);
    this.infoText.x = 30;
    this.infoText.y = height - 20;

    this.overlayBg
      .clear()
      .rect(0, 0, width, height)
      .fill({ color: 0x000000, alpha: 0.78 });

    this.overlayTitle.style.fontSize = (isPortrait ? 56 : 72) * s;
    this.overlayTitle.style.wordWrapWidth = Math.max(200, width - 80);
    this.overlayTitle.x = width / 2;
    this.overlayTitle.y = height / 2 - 160;

    this.overlaySub.style.fontSize = 22 * s;
    this.overlaySub.style.wordWrapWidth = Math.max(200, width - 100);
    this.overlaySub.x = width / 2;
    this.overlaySub.y = height / 2 - 60;

    this.overlayStats.style.fontSize = (isPortrait ? 22 : 26) * s;
    this.overlayStats.x = width / 2;
    this.overlayStats.y = height / 2 - 10;

    for (const btn of this.buttonRow.children) {
      const t = btn.children?.find((c) => c instanceof Text) as Text | undefined;
      if (t) t.style.fontSize = OVERLAY_BUTTON.FONT_SIZE * s;
    }

    this.layoutButtons(width, height, isPortrait);
  }

  private layoutButtons(width: number, height: number, isPortrait: boolean) {
    const gap = OVERLAY_BUTTON.GAP;
    const visibleChildren = this.buttonRow.children.filter((c) => c.visible);
    if (isPortrait) {
      const step = OVERLAY_BUTTON.PORTRAIT_STEP;
      let y = 0;
      for (const c of visibleChildren) {
        c.x = 0;
        c.y = y;
        y += step;
      }
    } else {
      const btnWidth = OVERLAY_BUTTON.WIDTH;
      const totalWidth =
        visibleChildren.length * btnWidth + (visibleChildren.length - 1) * gap;
      let x = -totalWidth / 2 + btnWidth / 2;
      for (const c of visibleChildren) {
        c.x = x;
        c.y = 0;
        x += btnWidth + gap;
      }
    }
    this.buttonRow.x = width / 2;
    this.buttonRow.y = height / 2 + (isPortrait ? 160 : 180);
  }

  private onFinished = (data?: FinishData) => {
    if (!this.built || !data) return;

    this.overlay.visible = true;
    this.overlayTitle.text = REASON_LABEL[data.reason ?? "out-of-bounds"];
    this.overlayTitle.style.fill = data.won ? 0x55efc4 : 0xff6b6b;

    this.overlayStats.text = `TIME ${formatTime(data.time)}    SHOTS ${data.shots}    ORBS ${data.collected} / ${data.total}`;

    if (data.won) {
      if (data.level >= TOTAL_LEVELS) {
        this.overlaySub.text = `You cleared all ${TOTAL_LEVELS} levels. Play again to hone the lines.`;
      } else {
        this.overlaySub.text = `Level ${data.level} cleared.`;
      }
      this.nextButton.visible = true;
      const nextLabel =
        data.level >= TOTAL_LEVELS ? "PLAY AGAIN" : "NEXT LEVEL";
      const nextText = this.nextButton.children.find(
        (c) => c instanceof Text,
      ) as Text | undefined;
      if (nextText) nextText.text = nextLabel;
      this.retryButton.visible = true;
    } else {
      this.overlaySub.text = `Level ${data.level} failed.`;
      this.nextButton.visible = false;
      this.retryButton.visible = true;
    }

    this.layoutAll();
  };
}
