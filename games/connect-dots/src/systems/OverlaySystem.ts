import { Container, Graphics, HTMLText, Text } from "pixi.js";
import { ConnectDots } from "../ConnectDots";
import { Engine, Layout, System } from "@falkura-pet/engine";

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

  private text: HTMLText;
  private background: Graphics;
  private buttonRow: Container;
  private buttonResizers: Array<(resize?: boolean) => void> = [];

  private buttonWidth = 240;
  private buttonHeight = 72;
  private buttonFontSize = 26;

  show(title: string, sub: string) {
    this.text.text = `<t1>${title}</t1><br><br>${sub}`;
  }

  override build() {
    this.background = new Graphics().rect(0, 0, 1, 1).fill({
      color: OVERLAY.tint,
      alpha: 0.78,
    });

    this.background.eventMode = "static";

    this.text = new HTMLText({
      style: {
        fill: OVERLAY.muted,
        fontFamily: "monospace",
        align: "center",
        wordWrap: true,
      },
      resolution: Engine.textResolution,
      anchor: 0.5,
    });

    this.buttonRow = new Container();
    this.buttonRow.addChild(
      this.makeButton("RESTART", () => this.game.resetLevel()),
      this.makeButton("NEXT", () => this.game.nextLevel()),
    );

    this.view.addChild(this.background, this.text, this.buttonRow);
  }

  override mount(): void {}

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
      resolution: Engine.textResolution,
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

  override resize(): void {
    this.background.width = Layout.screen.width;
    this.background.height = Layout.screen.height;

    this.text.x = Layout.screen.center.x;
    this.text.y = Layout.screen.center.y - 100;

    this.text.style.fontSize = Layout.isMobile ? 36 : 44;
    this.text.style.wordWrapWidth = Layout.screen.width - 80;
    this.text.style.tagStyles = {
      t1: {
        fill: OVERLAY.text,
        fontWeight: "bold",
        fontSize: Layout.isMobile ? 75 : 94,
      },
    };

    this.buttonRow.x = Layout.screen.center.x;
    this.buttonRow.y = Layout.screen.center.y + (Layout.isMobile ? 150 : 170);

    this.buttonWidth = Layout.isMobile ? 280 : 240;
    this.buttonHeight = Layout.isMobile ? 88 : 72;
    this.buttonFontSize = Layout.isMobile ? 39 : 26;

    for (const redraw of this.buttonResizers) redraw(true);
    this.layoutButtons(Layout.isPortrait);
  }
}
