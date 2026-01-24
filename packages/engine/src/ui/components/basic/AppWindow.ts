import AppScreen from "./AppScreen";
import { Text } from "pixi.js";
import gsap, { Back } from "gsap";

export default class AppWindow extends AppScreen {
  title: Text;

  constructor(...args: ConstructorParameters<typeof AppScreen>) {
    super(...args);

    this.layout = {
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
      gap: 10,
    };

    this.title = new Text({
      style: {
        fontSize: 35,
        fill: "#ffffffff",
      },
      layout: {
        position: "absolute",
        top: 0,
        margin: 15,
      },
    });

    this.addChild(this.title);
  }

  public set titleText(v: string) {
    this.title.text = v;
  }

  public override show(force = false) {
    if (this.active) return;

    gsap.killTweensOf(this);

    this._active = true;
    this.visible = true;

    if (force) {
      this.alpha = 1;

      return;
    }

    return gsap.fromTo(
      this,
      {
        alpha: 0,
        pixi: {
          y: "+=100",
        },
      },
      {
        alpha: 1,
        pixi: {
          y: "-=100",
        },
        duration: 0.2,
        ease: Back.easeOut.config(1.7),
      },
    );
  }

  public override hide(force = false) {
    if (!this.active) return;

    gsap.killTweensOf(this);

    const onComplete = () => {
      this._active = false;
      this.visible = false;
      this.position.y = 0;
    };

    if (force) {
      onComplete();
      return;
    }

    return gsap.fromTo(
      this,
      { alpha: 1 },
      {
        alpha: 0,
        pixi: {
          y: "+=100",
        },
        duration: 0.2,
        ease: Back.easeIn.config(1.7),
        onComplete,
      },
    );
  }
}
