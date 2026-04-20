import { System } from "@falkura-pet/game-base";
import { Graphics, HTMLText, Rectangle } from "pixi.js";
import { OrbitDrift } from "../OrbitDrift";

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

  private built = false;
  private text!: HTMLText;

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

  private build() {
    this.view.eventMode = "static";
    this.view.cursor = "pointer";
    this.view.on("pointertap", this.onPlay);

    this.view.layout = {
      width: "sw",
      height: "sh",
      onResize: ({ vars: { sw, sh } }) => {
        this.view.hitArea = new Rectangle(0, 0, sw, sh);
      },
    };

    this.view.addChildWithLayout(
      new Graphics().rect(0, 0, 1, 1).fill({
        color: INTRO.tint,
        alpha: 0.86,
      }),
      {
        width: "sw",
        height: "sh",
      },
    );

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
      anchor: 0.5,
    });

    this.view.addChildWithLayout(this.text, {
      x: "sw / 2",
      y: "sh / 2",
      zIndex: 2,
      onResize: ({ manager, view, vars }) => {
        view.style.fontSize = manager.isMobile ? 46 : 32;
        view.style.wordWrapWidth = Math.min(
          vars.sw - 120,
          manager.isMobile ? 900 : 880,
        );
        view.style.tagStyles = {
          t1: {
            fill: INTRO.title,
            fontWeight: "bold",
            fontSize: manager.isMobile ? 100 : 74,
          },
          t2: {
            fontSize: manager.isMobile ? 46 : 32,
            fill: INTRO.accent,
            fontWeight: "bold",
          },
          orb: {
            fill: INTRO.orb,
            fontWeight: "bold",
          },
        };
      },
    });

    this.view.addChildWithLayout(new Graphics(), {
      zIndex: 1,
      onResize: ({ vars, view }) => {
        const padding = 100;
        view
          .clear()
          .roundRect(
            vars.sw / 2 - this.text.width / 2 - padding / 2,
            vars.sh / 2 - this.text.height / 2 - padding / 2,
            this.text.width + padding,
            this.text.height + padding,
            40,
          )
          .fill({ color: INTRO.panel, alpha: 0.96 })
          .stroke({ color: INTRO.panelStroke, width: 4, alpha: 0.85 });
      },
    });

    this.view.on("visibleChanged", (v) => {
      if (v) this.text.updateCacheTexture();
    });
  }

  private onPlay = () => {
    this.game.play();
  };
}
