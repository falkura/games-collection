import { LayoutContainer } from "src/layout/LayoutContainer";
import { Assets, Graphics, Sprite, Text, Texture } from "pixi.js";

export class GameCard extends LayoutContainer {
  constructor(
    public config: IGameConfig,
    size = 250,
  ) {
    super({
      width: size,
      height: size,
    });

    const background = new LayoutContainer({
      width: "pw",
      height: "ph",
      view: Assets.get(config.icon)
        ? new Sprite(Texture.from(config.icon))
        : new Graphics().rect(0, 0, 1, 1).fill("#414141"),
    });

    this.addChild(background);

    const title = new LayoutContainer({
      x: "pw * 0.5",
      y: "ph * 0.2",
      view: new Text({
        text: config.title,
        style: {
          fontSize: size / 8,
          fill: "#ffffff",
          wordWrap: true,
          wordWrapWidth: size,
          align: "center",
        },
        anchor: 0.5,
      }),
    });

    const play = new LayoutContainer({
      view: new Graphics().rect(0, 0, 1, 1).fill("#cccccc"),
      x: "pw * 0.05",
      y: "ph * 0.40",
      width: "pw * 0.9",
      height: "ph * 0.25",
    });
    play.eventMode = "static";
    play.cursor = "pointer";

    play.on("pointertap", () => {
      window.location.href = config.route;
    });

    const playText = new LayoutContainer({
      view: new Text({
        text: "Play",
        style: {
          fill: "#323232",
          fontSize: size / 8,
          fontWeight: "600",
        },
        anchor: 0.5,
      }),
      x: "pw/2",
      y: "ph/2",
    });

    play.addChild(playText);

    const about = new LayoutContainer({
      view: new Graphics().rect(0, 0, 1, 1).fill("#cccccc"),
      x: "pw * 0.05",
      y: "ph * 0.70",
      width: "pw * 0.9",
      height: "ph * 0.25",
    });
    about.eventMode = "static";
    about.cursor = "pointer";

    about.on("pointertap", () => {
      console.log(config);
    });

    const aboutText = new LayoutContainer({
      view: new Text({
        text: "About",
        style: {
          fill: "#323232",
          fontSize: size / 8,
          fontWeight: "600",
        },
        anchor: 0.5,
      }),
      x: "pw/2",
      y: "ph/2",
    });

    about.addChild(aboutText);
    background.addChild(title, play, about);

    // const version = new LayoutContainer({
    //   x: "pw * 0.5",
    //   y: "ph - 20",
    //   view: new Text({
    //     text: config.version,
    //     style: {
    //       fontSize: 16,
    //       fill: "#ffffff",
    //     },
    //     anchor: 0.5,
    //   }),
    // });
    // this.eventMode = "static";
    // this.cursor = "pointer";

    // this.on("pointerover", () => {
    //   gsap.to(this.scale, { x: 1.05, y: 1.05, duration: 0.1 });

    //   this.overlay.view.visible = true;
    //   gsap.to(this.overlay.view, {
    //     alpha: 0.7,
    //     duration: 0.2,
    //   });
    // });

    // this.on("pointerout", () => {
    //   gsap.to(this.scale, { x: 1, y: 1, duration: 0.1 });

    //   gsap.to(this.overlay.view, {
    //     alpha: 0,
    //     duration: 0.2,
    //     onComplete: () => (this.overlay.view.visible = false),
    //   });
    // });

    // // 🧱 hierarchy
    // this.overlay.addChild(this.title, this.play, this.about, this.version);

    // this.addChild(background, this.overlay);
  }
}
