import { ModuleConstructor } from "../../../modules/ModuleManager";
import UI from "../../UI";
import gsap, { Back } from "gsap";
import AppScreen from "../basic/AppScreen";
import ScenesController from "./ScenesController";

export default class WindowsController<
  UIType extends UI = UI,
> extends ScenesController<UIType> {
  protected history: AppScreen<UIType>[];

  // todo add tint
  public override show(moduleId: string, force?: boolean);
  public override show<T extends ModuleConstructor<AppScreen<UIType>>>(
    Ctor: T,
    force?: boolean,
  );
  public override show<T extends ModuleConstructor<AppScreen<UIType>>>(
    value: string | T,
    force = false,
  ) {
    // Following line wont show any errors with call like this:
    // const target = typeof value === "string" ? this.get(value) : this.get(value);
    // @ts-expect-error TS is stupid but i like it :).
    const target = this.get(value);

    if (this.current === target) return;

    let promise = Promise.resolve();

    if (this.current) {
      promise = this.hideAnimation(this.current, force).then(() => {
        this.view.removeChild(this.current);
        this.onScreenRemoved(this.current);
      }) as Promise<any>;
    }

    promise.then(() => {
      this.current = target;

      this.view.addChild(this.current);
      this.onScreenAdded(this.current);

      return this.showAnimation(this.current, force);
    });
  }

  // todo
  public goBack() {}

  public hide(force?: boolean): { promise: Promise<void>; last: boolean } {
    if (!this.current) return;

    const screen = this.current;

    delete this.current;

    // For history and goBack
    const last = true;

    // @ts-expect-error guess what
    const promise = this.hideAnimation(screen, force).then(() => {
      this.view.removeChild(screen);
      this.onScreenRemoved(screen);
    }) as Promise<void>;

    return { promise, last };
  }

  public override onWindowShow() {
    return;
  }

  public override onWindowHide(last: boolean) {
    return;
  }

  protected override showAnimation(screen: AppScreen<UIType>, force = false) {
    gsap.killTweensOf(screen);

    screen.visible = true;

    if (force) {
      screen.alpha = 1;

      return;
    }

    return gsap.fromTo(
      screen,
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

  protected override hideAnimation(screen: AppScreen<UIType>, force = false) {
    gsap.killTweensOf(screen);

    const onComplete = () => {
      screen.visible = false;
      screen.position.y = 0;
    };

    if (force) {
      onComplete();
      return;
    }

    return gsap.fromTo(
      screen,
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
