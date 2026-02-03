import { LayoutContainer } from "@pixi/layout/components";
import gsap from "gsap";

export default class Tint extends LayoutContainer {
  private showHideDuration = 0.2;

  constructor() {
    super({
      layout: {
        width: "100%",
        height: "100%",
        position: "absolute",
        backgroundColor: "#000000d5",
      },
    });

    this.interactive = false;

    this.hide(true);
  }

  show(force = false) {
    gsap.killTweensOf(this);
    gsap.to(this, {
      duration: force ? 0 : this.showHideDuration,
      pixi: {
        alpha: 1,
      },
    });
  }

  hide(force = false) {
    gsap.killTweensOf(this);
    gsap.to(this, {
      duration: force ? 0 : this.showHideDuration,
      pixi: {
        alpha: 0,
      },
    });
  }
}
