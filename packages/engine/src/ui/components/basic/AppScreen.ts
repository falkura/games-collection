import {
  LayoutContainer,
  LayoutContainerOptions,
} from "@pixi/layout/components";
import gsap from "gsap";
import { UIType } from "../../UI";
import { Ticker } from "pixi.js";
import AppWindow from "./AppWindow";

export default class AppScreen extends LayoutContainer {
  protected ui: UIType;
  protected _active: boolean = false;
  public id: string;

  constructor(
    { ui, id }: { ui: UIType; id: string },
    options?: LayoutContainerOptions,
  ) {
    super({ ...options });

    this.id = id;
    this.ui = ui;

    this.layout = {
      width: "100%",
      height: "100%",
    };

    this.interactive = false;

    this.on("added", this._mount.bind(this));
    this.on("removed", this._unmount.bind(this));
  }

  public get active() {
    return this._active;
  }

  public show(force?: boolean) {
    if (this.active) return;

    gsap.killTweensOf(this);

    this._active = true;

    if (force) {
      this.visible = true;
      this.alpha = 1;
      return;
    }

    return gsap.fromTo(
      this,
      { alpha: 0 },
      {
        alpha: 1,
        duration: 0.2,
        ease: "linear",
      },
    );
  }

  public hide(force?: boolean) {
    if (!this.active) return;

    gsap.killTweensOf(this);

    if (force) {
      this._active = false;
      this.visible = false;
      return;
    }

    return gsap.to(this, {
      alpha: 0,
      duration: 0.2,
      ease: "linear",
      onComplete: () => {
        this._active = false;
      },
    });
  }

  private _mount() {
    this.visible = true;
    this.ui.ticker.add(this._tick, this);

    this.onMount();
  }

  private _unmount() {
    this.visible = false;
    this.ui.ticker.remove(this._tick, this);

    this.onUnmount;
  }

  private _tick(ticker: Ticker) {
    this.onTick(ticker);
  }

  public onMount() {
    // override me
  }
  public onUnmount() {
    // override me
  }
  public onTick(ticker: Ticker) {
    // override me
  }
  public onWindowShow(window: AppWindow, force: boolean) {
    // override me
  }
  public onWindowHide(window: AppWindow, force: boolean) {
    // override me
  }
}
