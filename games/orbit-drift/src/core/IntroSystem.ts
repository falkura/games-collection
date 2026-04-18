import { System } from "@falkura-pet/game-base";
import { Engine } from "@falkura-pet/engine";
import { Graphics, Rectangle, Text } from "pixi.js";
import { OrbitDrift } from "../OrbitDrift";

const INTRO = {
  tint: "#050816",
  panel: "#0f182a",
  panelStroke: "#6970ff",
  title: "#f8fbff",
  body: "#dce7f7",
  accent: "#7cc7ff",
};

export class IntroSystem extends System<OrbitDrift> {
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
    const panelWidth = Math.min(width - 40, mobile ? 1020 : 980);
    const panelHeight = Math.min(height - 56, mobile ? 900 : 680);
    const panelX = (width - panelWidth) / 2;
    const panelY = (height - panelHeight) / 2;

    this.view.hitArea = new Rectangle(0, 0, width, height);

    this.overlay.clear().rect(0, 0, width, height).fill({
      color: INTRO.tint,
      alpha: 0.84,
    });

    this.panel
      .clear()
      .roundRect(panelX, panelY, panelWidth, panelHeight, 42)
      .fill({ color: INTRO.panel, alpha: 0.95 })
      .stroke({ color: INTRO.panelStroke, width: 4, alpha: 0.9 });

    this.title.style.fontSize = mobile ? 104 : 74;
    this.body.style.fontSize = mobile ? 46 : 32;
    this.body.style.wordWrap = true;
    this.body.style.wordWrapWidth = panelWidth - 140;
    this.hint.style.fontSize = mobile ? 46 : 30;

    this.title.x = width / 2;
    this.title.y = panelY + (mobile ? 144 : 118);

    this.body.x = width / 2;
    this.body.y = panelY + panelHeight / 2 + (mobile ? 46 : 34);

    this.hint.x = width / 2;
    this.hint.y = panelY + panelHeight - (mobile ? 92 : 72);
  }

  private build() {
    this.view.eventMode = "static";
    this.view.cursor = "pointer";
    this.view.on("pointertap", this.onDismiss);

    this.overlay = new Graphics();
    this.panel = new Graphics();

    this.title = new Text({
      text: "ORBIT DRIFT",
      style: {
        fill: INTRO.title,
        fontFamily: "monospace",
        fontWeight: "bold",
        fontSize: 74,
        align: "center",
      },
    });
    this.title.anchor.set(0.5);

    this.body = new Text({
      text:
        "Drag anywhere to launch your ship.\n\nUse gravity wells to bend into stable orbits.\nCollect every energy orb.\nAvoid planets, walls, hunters, and incoming fire.",
      style: {
        fill: INTRO.body,
        fontFamily: "monospace",
        fontSize: 32,
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
        fontSize: 30,
        align: "center",
      },
    });
    this.hint.anchor.set(0.5);

    this.view.addChild(this.overlay, this.panel, this.title, this.body, this.hint);
  }

  private onDismiss = () => {
    this.game.showGameplay();
  };
}
