import { Container } from "pixi.js";
import ModuleManager, {
  ModuleConstructor,
} from "../../../modules/ModuleManager";
import AppScreen from "../basic/AppScreen";
import gsap from "gsap";
import UI from "../../UI";

export default class ScenesController<
  UIType extends UI = UI,
> extends ModuleManager<AppScreen<UIType>> {
  public view: Container;

  protected current: AppScreen<UIType>;

  constructor(protected ui: UIType) {
    super();

    this.view = new Container({
      layout: {
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        position: "absolute",
      },
      interactive: false,
      sortableChildren: true,
    });
  }

  protected override onInit<T extends AppScreen<UIType>>(instance: T): T {
    instance.init(this.ui);

    return instance;
  }

  public show(moduleId: string, force?: boolean);
  public show<T extends ModuleConstructor<AppScreen<UIType>>>(
    Ctor: T,
    force?: boolean,
  );
  public show<T extends ModuleConstructor<AppScreen<UIType>>>(
    value: string | T,
    force = false,
  ) {
    // Following line wont show any errors with call like this:
    // const target = typeof value === "string" ? this.get(value) : this.get(value);
    // @ts-expect-error TS is stupid.
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

  public onWindowShow() {
    if (!this.current) return;

    this.current.onWindowShow();

    this.view.eventMode = "none";
  }

  public onWindowHide(last: boolean) {
    if (!this.current) return;
    if (!last) return;

    this.view.eventMode = "passive";

    this.current.onWindowHide();
  }

  protected onScreenAdded(screen: AppScreen<UIType>) {
    this.ui.ticker.add(screen.onTick, screen);

    screen.onMount();
  }

  protected onScreenRemoved(screen: AppScreen<UIType>) {
    this.ui.ticker.remove(screen.onTick, screen);

    screen.onUnmount();
  }

  protected showAnimation(screen: AppScreen<UIType>, force?: boolean) {
    gsap.killTweensOf(screen);

    if (force) {
      screen.visible = true;
      screen.alpha = 1;
      return;
    }

    return gsap.fromTo(
      screen,
      { alpha: 0 },
      {
        alpha: 1,
        duration: 0.2,
        ease: "linear",
      },
    );
  }

  protected hideAnimation(screen: AppScreen<UIType>, force?: boolean) {
    gsap.killTweensOf(screen);

    if (force) {
      screen.visible = false;
      return;
    }

    return gsap.to(screen, {
      alpha: 0,
      duration: 0.2,
      ease: "linear",
    });
  }
}
