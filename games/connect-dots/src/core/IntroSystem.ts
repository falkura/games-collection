import { System } from "@falkura-pet/game-base";
import { Graphics, HTMLText, Rectangle } from "pixi.js";
import { ConnectDots } from "../ConnectDots";
import { Engine } from "@falkura-pet/engine";

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
  private text: HTMLText;

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

    this.view.addChildWithLayout(
      new Graphics().rect(0, 0, 1, 1).fill({
        color: INTRO.tint,
        alpha: 0.82,
      }),
      {
        width: "sw",
        height: "sh",
      },
    );

    this.view.addChildWithLayout(this.text, {
      x: "sw / 2",
      y: "sh / 2",
      zIndex: 2,
      onResize({ manager, view }) {
        view.style.fontSize = manager.isMobile ? 60 : 44;
        view.style.tagStyles = {
          t1: {
            fill: INTRO.title,
            fontWeight: "bold",
            fontSize: manager.isMobile ? 112 : 80,
          },
          t2: {
            fontSize: manager.isMobile ? 56 : 40,
            fill: INTRO.accent,
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
  }

  private onPlay = () => {
    this.game.play();
  };
}
