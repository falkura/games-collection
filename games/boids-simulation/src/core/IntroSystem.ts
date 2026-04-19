import { System } from "@falkura-pet/game-base";
import { Graphics, HTMLText, Rectangle } from "pixi.js";
import { BoidsSimulation } from "../BoidsSimulation";

const C = {
  tint: "#030510",
  panel: "#080d20",
  panelStroke: "#7dd3fc",
  title: "#f8fafc",
  body: "#d5e6f7",
  accent: "#7dd3fc",
};

export class IntroSystem extends System<BoidsSimulation> {
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
    this.view.on("pointertap", () => this.game.play());

    this.view.layout = {
      width: "sw",
      height: "sh",
      onResize: ({ vars: { sw, sh } }) => {
        this.view.hitArea = new Rectangle(0, 0, sw, sh);
      },
    };

    this.text = new HTMLText({
      text:
        "<t1>BOIDS SIMULATION</t1><br><br>" +
        "Emergent flocking from three simple rules.<br><br>" +
        "<b>Separation</b> — avoid crowding neighbors.<br>" +
        "<b>Alignment</b> — match the average heading.<br>" +
        "<b>Cohesion</b> — steer toward the average position.<br><br>" +
        "Boids are colored by flight direction — watch flocks emerge as color clusters. " +
        "Move your cursor into the swarm to repel or attract them.<br><br>" +
        "<t2>TAP ANYWHERE TO START</t2>",
      style: {
        fill: C.body,
        fontFamily: "monospace",
        fontSize: 44,
        align: "center",
        wordWrap: true,
        wordWrapWidth: 900,
      },
      anchor: 0.5,
    });

    this.view.addChildWithLayout(
      new Graphics().rect(0, 0, 1, 1).fill({ color: C.tint, alpha: 0.95 }),
      { width: "sw", height: "sh" },
    );

    this.view.addChildWithLayout(this.text, {
      x: "sw / 2",
      y: "sh / 2",
      zIndex: 2,
      onResize({ manager, view }) {
        view.style.fontSize = manager.isMobile ? 46 : 32;
        view.style.tagStyles = {
          t1: {
            fill: C.title,
            fontWeight: "bold",
            fontSize: manager.isMobile ? 100 : 74,
          },
          t2: {
            fontSize: manager.isMobile ? 46 : 32,
            fill: C.accent,
            fontWeight: "bold",
          },
        };
      },
    });

    this.view.addChildWithLayout(new Graphics(), {
      zIndex: 1,
      onResize: ({ vars, view }) => {
        const pad = 100;
        view
          .clear()
          .roundRect(
            vars.sw / 2 - this.text.width / 2 - pad / 2,
            vars.sh / 2 - this.text.height / 2 - pad / 2,
            this.text.width + pad,
            this.text.height + pad,
            40,
          )
          .fill({ color: C.panel, alpha: 0.97 })
          .stroke({ color: C.panelStroke, width: 4, alpha: 0.8 });
      },
    });
  }
}
