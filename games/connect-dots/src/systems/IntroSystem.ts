import { Graphics, HTMLText, Rectangle } from "pixi.js";
import { ConnectDots } from "../ConnectDots";
import { Engine, Layout, System } from "@falkura-pet/engine";

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

  private text: HTMLText;
  private panel: Graphics;
  private background: Graphics;

  override build() {
    this.view.eventMode = "static";
    this.view.cursor = "pointer";
    this.view.on("pointertap", this.onPlay);

    this.text = new HTMLText({
      text:
        "<t1>CONNECT DOTS</t1><br><br>" +
        "Connect each matching color pair.<br><br>" +
        "Drag orthogonally from one dot to its partner. Paths cannot cross. Fill every square on the grid to solve the board.<br><br>" +
        "<t2>TAP ANYWHERE TO START</t2>",
      style: {
        fill: INTRO.body,
        fontFamily: "monospace",
        fontSize: 44,
        align: "center",
        wordWrap: true,
        wordWrapWidth: 880,
      },
      resolution: Engine.textResolution,
      anchor: 0.5,
    });

    this.background = new Graphics().rect(0, 0, 1, 1).fill({
      color: INTRO.tint,
      alpha: 0.82,
    });

    this.panel = new Graphics();

    this.view.addChild(this.background, this.panel, this.text);
  }

  override resize(): void {
    this.view.hitArea = new Rectangle(
      Layout.screen.x,
      Layout.screen.y,
      Layout.screen.width,
      Layout.screen.height,
    );

    this.background.width = Layout.screen.width;
    this.background.height = Layout.screen.height;

    this.text.x = Layout.screen.center.x;
    this.text.y = Layout.screen.center.y;

    this.text.style.fontSize = Layout.isMobile ? 60 : 44;
    this.text.style.tagStyles = {
      t1: {
        fill: INTRO.title,
        fontWeight: "bold",
        fontSize: Layout.isMobile ? 112 : 80,
      },
      t2: {
        fill: INTRO.accent,
        fontWeight: "bold",
        fontSize: Layout.isMobile ? 56 : 40,
      },
    };

    const padding = 70;

    this.panel
      .clear()
      .roundRect(
        Layout.screen.width / 2 - this.text.width / 2 - padding / 2,
        Layout.screen.height / 2 - this.text.height / 2 - padding / 2,
        this.text.width + padding,
        this.text.height + padding,
        40,
      )
      .fill({ color: INTRO.panel, alpha: 0.96 })
      .stroke({ color: INTRO.panelStroke, width: 4, alpha: 0.85 });
  }

  private onPlay = () => {
    this.game.onPlay();
  };
}
