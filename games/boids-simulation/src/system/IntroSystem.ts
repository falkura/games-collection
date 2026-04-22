import { Graphics, HTMLText, Rectangle } from "pixi.js";
import { BoidsSimulation } from "../BoidsSimulation";
import { Engine, Layout, System } from "@falkura-pet/engine";

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

  private text: HTMLText;
  private panel: Graphics;
  private background: Graphics;

  override build() {
    this.view.eventMode = "static";
    this.view.cursor = "pointer";
    this.view.on("pointertap", this.onPlay);

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
        wordWrapWidth: 880,
      },
      resolution: Engine.textResolution,
      anchor: 0.5,
    });

    this.background = new Graphics().rect(0, 0, 1, 1).fill({
      color: C.tint,
      alpha: 0.95,
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
        fill: C.title,
        fontWeight: "bold",
        fontSize: Layout.isMobile ? 100 : 74,
      },
      t2: {
        fontSize: Layout.isMobile ? 46 : 32,
        fill: C.accent,
        fontWeight: "bold",
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
      .fill({ color: C.panel, alpha: 0.97 })
      .stroke({ color: C.panelStroke, width: 4, alpha: 0.8 });
  }

  private onPlay = () => {
    this.game.onPlay();
  };
}
