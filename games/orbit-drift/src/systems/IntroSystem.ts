import { Graphics, HTMLText, Rectangle } from "pixi.js";
import { OrbitDrift } from "../OrbitDrift";
import { Engine, Layout } from "@falkura-pet/engine";
import { System } from "./System";

const INTRO = {
  tint: "#050816",
  panel: "#0f182a",
  panelStroke: "#6970ff",
  title: "#f8fbff",
  body: "#dce7f7",
  accent: "#7cc7ff",
  orb: "#00ffaa",
};

export class IntroSystem extends System<OrbitDrift> {
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
        "<t1>ORBIT DRIFT</t1><br><br>" +
        "Drag anywhere to launch your ship.<br><br>" +
        "Collect every <orb>GREEN ORB</orb> to clear the level.<br><br>" +
        "Use gravity wells to curve your path. Avoid planets, walls, hunters, and incoming fire.<br><br>" +
        "<t2>TAP ANYWHERE TO START</t2>",
      style: {
        fill: INTRO.body,
        fontFamily: "monospace",
        fontSize: 32,
        align: "center",
        wordWrap: true,
        wordWrapWidth: 880,
      },
      resolution: Engine.textResolution,
      anchor: 0.5,
    });

    this.background = new Graphics().rect(0, 0, 1, 1).fill({
      color: INTRO.tint,
      alpha: 0.86,
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

    this.text.style.fontSize = Layout.isMobile ? 46 : 32;
    this.text.style.tagStyles = {
      t1: {
        fill: INTRO.title,
        fontWeight: "bold",
        fontSize: Layout.isMobile ? 100 : 74,
      },
      t2: {
        fill: INTRO.accent,
        fontWeight: "bold",
        fontSize: Layout.isMobile ? 46 : 32,
      },
      orb: {
        fill: INTRO.orb,
        fontWeight: "bold",
        fontSize: Layout.isMobile ? 46 : 32,
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
