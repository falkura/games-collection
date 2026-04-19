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

  private buttonWidth = 240;
  private buttonHeight = 72;

  override start(): void {
    if (!this.built) {
      this.build();
      this.built = true;
    }
    this.hide();
  }

  override reset(): void {
    if (!this.built) return;
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
    this.hide();

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
        const s = mobile ? 1.3 : 1;
        this.buttonWidth = mobile ? 280 : 240;
        this.buttonHeight = mobile ? 88 : 72;

        for (const btn of this.buttonRow.children) {
          const btnBg = btn.children[0] as Graphics | undefined;
          const btnText = btn.children.find((c) => c instanceof Text) as
            | Text
            | undefined;
          if (btnText) {
            btnText.style.fontSize = (mobile ? 30 : 26) * s;
            btnText.x = this.buttonWidth / 2;
            btnText.y = this.buttonHeight / 2;
          }
          if (btnBg) {
            btnBg
              .clear()
              .roundRect(0, 0, this.buttonWidth, this.buttonHeight, 18)
              .fill({ color: OVERLAY.panel, alpha: 0.95 })
              .stroke({ color: OVERLAY.panelStroke, width: 2 });
          }
        }

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
    });
    text.anchor.set(0.5);

    const redraw = (hovered: boolean) => {
      bg.clear()
        .roundRect(0, 0, this.buttonWidth, this.buttonHeight, 18)
        .fill({ color: hovered ? OVERLAY.hover : OVERLAY.panel, alpha: 0.95 })
        .stroke({ color: OVERLAY.panelStroke, width: 2 });
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

  private layoutButtons(isPortrait: boolean) {
    const gap = isPortrait ? 20 : 24;
    const visibleChildren = this.buttonRow.children.filter((c) => c.visible);

    if (isPortrait) {
      const totalHeight =
        visibleChildren.length * this.buttonHeight +
        Math.max(0, visibleChildren.length - 1) * gap;
      let y = -totalHeight / 2;
      for (const c of visibleChildren) {
        c.x = -this.buttonWidth / 2;
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
  }
}
