import { System } from "@falkura-pet/game-base";
import { Container, Graphics, HTMLText, Text } from "pixi.js";
import { ConnectDots } from "../ConnectDots";

const OVERLAY = {
  text: "#f8fafc",
  muted: "#9fb3c8",
  panel: "#0f1b2f",
  panelStroke: "#2a3e62",
  hover: "#1d3557",
  tint: "#000000",
};

export class OverlaySystem extends System<ConnectDots> {
  static MODULE_ID = "overlay";

  private built = false;
  private text: HTMLText;
  private buttonRow: Container;
  private buttonResizers: Array<() => void> = [];

  private buttonWidth = 240;
  private buttonHeight = 72;
  private buttonFontSize = 26;

  override start(): void {
    if (!this.built) {
      this.build();
      this.built = true;
    }
  }

  override reset(): void {
    this.hide();
  }

  show(title: string, sub: string) {
    this.text.text = `<t1>${title}</t1><br><br>${sub}`;
    this.view.visible = true;
  }

  hide() {
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

    this.text = new HTMLText({
      style: {
        fill: OVERLAY.muted,
        fontFamily: "monospace",
        align: "center",
        wordWrap: true,
      },
      anchor: 0.5,
    });

    this.view.addChildWithLayout(this.text, {
      x: "sw / 2",
      y: "sh / 2 - 100",
      onResize: ({ manager, view, vars }) => {
        const s = manager.isMobile ? 1.3 : 1;
        view.style.fontSize = (manager.isMobile ? 28 : 34) * s;
        view.style.wordWrapWidth = Math.max(240, vars.sw - 80);
        view.style.tagStyles = {
          t1: {
            fill: OVERLAY.text,
            fontWeight: "bold",
            fontSize: (manager.isMobile ? 58 : 72) * s,
          },
        };
      },
    });

    this.buttonRow = new Container();
    this.buttonRow.addChild(
      this.makeButton("RESTART", () => this.game.resetLevel()),
      this.makeButton("NEXT", () => this.game.nextLevel()),
    );

    this.view.addChildWithLayout(this.buttonRow, {
      x: "sw / 2",
      y: "sh / 2 + 170",
      portrait: { y: "sh / 2 + 150" },
      onResize: ({ manager }) => {
        const mobile = manager.isMobile;
        this.buttonWidth = mobile ? 280 : 240;
        this.buttonHeight = mobile ? 88 : 72;
        this.buttonFontSize = mobile ? 39 : 26;
        for (const redraw of this.buttonResizers) redraw();
        this.layoutButtons(manager.isPortrait);
      },
    });
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
    const gap = isPortrait ? 20 : 24;
    const buttons = this.buttonRow.children;
    const n = buttons.length;

    if (isPortrait) {
      let y = -(n * this.buttonHeight + (n - 1) * gap) / 2;

      for (const c of buttons) {
        c.x = -this.buttonWidth / 2;
        c.y = y;
        y += this.buttonHeight + gap;
      }
    } else {
      let x = -(n * this.buttonWidth + (n - 1) * gap) / 2;

      for (const c of buttons) {
        c.x = x;
        c.y = 0;
        x += this.buttonWidth + gap;
      }
    }
  }
}
