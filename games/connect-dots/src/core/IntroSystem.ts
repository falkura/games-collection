import { System } from "@falkura-pet/game-base";
import { Engine } from "@falkura-pet/engine";
import { Graphics, Rectangle, Text } from "pixi.js";
import { ConnectDots } from "../ConnectDots";

const INTRO = {
  tint: "#08111f",
  panel: "#0f1b2f",
  panelStroke: "#7dd3fc",
  title: "#f8fafc",
  body: "#d5e6f7",
  accent: "#7dd3fc",
};

export class IntroSystem extends System<ConnectDots> {
  static MODULE_ID = "intro";

  private built = false;
  private overlay!: Graphics;
  private panel!: Graphics;
  private title!: Text;
  private body!: Text;
  private hint!: Text;

  override start(): void {
    if (!this.built) {
      this.build();
      this.built = true;
    }

    this.view.visible = true;
    this.resize();
  }

  override reset(): void {
    if (!this.built) return;
    this.view.visible = true;
  }

  override resize(): void {
    if (!this.built) return;

    const { width, height } = Engine.layout.screen;
    const mobile = Engine.layout.isMobile;
    const panelWidth = Math.min(width - 36, mobile ? 1020 : 980);
    const panelHeight = Math.min(height - 48, mobile ? 860 : 720);
    const panelX = (width - panelWidth) / 2;
    const panelY = (height - panelHeight) / 2;

    this.view.hitArea = new Rectangle(0, 0, width, height);

    this.overlay.clear().rect(0, 0, width, height).fill({
      color: INTRO.tint,
      alpha: 0.82,
    });

    this.panel
      .clear()
      .roundRect(panelX, panelY, panelWidth, panelHeight, 40)
      .fill({ color: INTRO.panel, alpha: 0.96 })
      .stroke({ color: INTRO.panelStroke, width: 4, alpha: 0.85 });

    this.title.style.fontSize = mobile ? 112 : 80;
    this.body.style.fontSize = mobile ? 60 : 44;
    this.body.style.wordWrap = true;
    this.body.style.wordWrapWidth = panelWidth - 140;
    this.hint.style.fontSize = mobile ? 56 : 40;

    this.title.x = width / 2;
    this.title.y = panelY + (mobile ? 150 : 124);

    this.body.x = width / 2;
    this.body.y = panelY + panelHeight / 2 + (mobile ? 70 : 52);

    this.hint.x = width / 2;
    this.hint.y = panelY + panelHeight - (mobile ? 86 : 72);
  }

  private build() {
    this.view.eventMode = "static";
    this.view.cursor = "pointer";
    this.view.on("pointertap", this.onDismiss);

    this.overlay = new Graphics();
    this.panel = new Graphics();

    this.title = new Text({
      text: "CONNECT DOTS",
      style: {
        fill: INTRO.title,
        fontFamily: "monospace",
        fontWeight: "bold",
        fontSize: 40,
        align: "center",
      },
    });
    this.title.anchor.set(0.5);

    this.body = new Text({
      text:
        "Connect each matching color pair.\n\nDrag orthogonally from one dot to its partner. Paths cannot cross. Fill every square on the grid to solve the board.",
      style: {
        fill: INTRO.body,
        fontFamily: "monospace",
        fontSize: 22,
        align: "center",
      },
    });
    this.body.anchor.set(0.5);

    this.hint = new Text({
      text: "TAP ANYWHERE TO START",
      style: {
        fill: INTRO.accent,
        fontFamily: "monospace",
        fontWeight: "bold",
        fontSize: 20,
        align: "center",
      },
    });
    this.hint.anchor.set(0.5);

    this.view.addChild(this.overlay, this.panel, this.title, this.body, this.hint);
  }

  private onDismiss = () => {
    this.game.showBoard();
  };
}
