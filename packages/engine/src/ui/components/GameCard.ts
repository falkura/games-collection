import { LayoutStyles } from "@pixi/layout";
import { LayoutContainer } from "@pixi/layout/components";
import { Sprite, Text, Texture } from "pixi.js";
import TextButton from "./TextButton";

export default class GameCard extends LayoutContainer {
  sprite: Sprite;
  inner: LayoutContainer;
  play: TextButton;
  about: TextButton;
  title: Text;
  config: IGameConfig;
  version: Text;

  constructor(options: {
    config: IGameConfig;
    onAboutPress: (config: IGameConfig) => void;
    layout?: LayoutStyles;
  }) {
    super({
      layout: {
        height: 250,
        aspectRatio: 1,
        backgroundColor: "#adadadff",
        borderColor: "#7eb9f4ff",
        borderWidth: 3,
        borderRadius: 12,
        ...options.layout,
      },
    });

    this.config = options.config;

    this.sprite = new Sprite({
      layout: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
        objectPosition: "center",
      },
      texture: Texture.from(options.config.icon),
    });

    this.inner = new LayoutContainer({
      layout: {
        width: "100%",
        height: "100%",
        backgroundColor: "#000000ce",
        position: "absolute",
        justifyContent: "flex-start",
        alignItems: "center",
        flexDirection: "column",
        gap: 10,
        padding: 10,
      },
      visible: false,
      alpha: 0,
      interactive: false,
    });

    this.title = new Text({
      style: {
        fontSize: 26,
        fill: "#ffffffff",
        wordWrap: true,
      },
      layout: {
        width: "100%",
        height: 100,
      },
      text: options.config.title,
    });

    this.version = new Text({
      style: {
        fontSize: 26,
        fill: "#ffffffff",
      },
      layout: {
        width: "100%",
        height: 25,
      },
      text: options.config.version,
    });

    this.play = new TextButton({
      text: "Play",
      layout: {
        width: "80%",
        backgroundColor: "#aaffaa",
      },
      style: {
        fill: "#323232ff",
        fontWeight: "600",
      },
    });

    this.play.onPress.connect(() => {
      window.location.href = options.config.route;
    });

    this.about = new TextButton({
      text: "About",
      layout: {
        width: "80%",
        backgroundColor: "#ffffffff",
      },
      style: {
        fill: "#323232ff",
        fontWeight: "600",
      },
    });

    this.about.onPress.connect(() => {
      options.onAboutPress(options.config);
    });

    this.on("pointerover", (event) => {
      gsap.killTweensOf(this);

      gsap.to(this, {
        duration: 0.1,
        pixi: {
          scale: 1.1,
        },
      });

      gsap.killTweensOf(this.inner);
      gsap.to(this.inner, {
        duration: 0.2,
        pixi: {
          alpha: 1,
        },
        onStart: () => (this.inner.visible = true),
      });
    });

    this.on("pointerout", (event) => {
      gsap.killTweensOf(this);
      gsap.to(this, {
        duration: 0.1,
        pixi: {
          scale: 1,
        },
      });

      gsap.killTweensOf(this.inner);
      gsap.to(this.inner, {
        duration: 0.2,
        pixi: {
          alpha: 0,
        },
        onComplete: () => (this.inner.visible = false),
      });
    });

    this.inner.addChild(
      this.title,
      this.play.view,
      this.about.view,
      this.version,
    );

    this.addChild(this.sprite, this.inner);
  }
}
