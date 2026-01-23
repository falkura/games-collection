import {
  LayoutContainer,
  LayoutContainerOptions,
} from "@pixi/layout/components";
import gsap from "gsap";
import UI from "../../UI";
import { DestroyOptions, Ticker } from "pixi.js";

export default class AppScreen extends LayoutContainer {
  constructor(options?: LayoutContainerOptions) {
    super({
      ...options,
    });

    this.layout = {
      width: "100%",
      height: "100%",
    };

    this.interactive = false;

    this.on("added", this._mount.bind(this));
    this.on("removed", this._unmount.bind(this));

    this.onCreate();
  }

  private _mount() {
    this.onMount();
    UI.ticker.add(this._tick, this);
  }

  private _unmount() {
    UI.ticker.remove(this._tick, this);
    this.onUnmount();
  }

  private _tick(ticker: Ticker) {
    this.onTick(ticker);
  }

  override destroy(options?: DestroyOptions): void {
    this.onDestroy();
    super.destroy(options);
  }

  protected onDestroy() {}
  protected onMount() {}
  protected onUnmount() {}
  protected onCreate() {}
  protected onTick(ticker: Ticker) {}

  public show() {
    gsap.killTweensOf(this);

    return gsap.fromTo(
      this,
      { alpha: 0 },
      {
        alpha: 1,
        duration: 0.2,
        ease: "linear",
        onStart: () => {
          this.visible = true;
        },
      },
    );
  }

  public hide() {
    gsap.killTweensOf(this);

    return gsap.to(this, {
      alpha: 0,
      duration: 0.2,
      ease: "linear",
      onComplete: () => {
        this.visible = false;
      },
    });
  }
}
