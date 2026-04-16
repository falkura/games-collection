import { UI } from "../UI";
import { type ModuleConstructor, ModuleManager } from "@falkura-pet/engine";
import { LayoutContainer } from "../layout/LayoutContainer";
import { AppScreen } from "./AppScreen";

export class ScenesController<UIType extends UI = UI> extends ModuleManager<
  AppScreen<UIType>
> {
  public view: LayoutContainer;
  protected current: AppScreen<UIType>;

  constructor(protected ui: UIType) {
    super();
    this.view = this.ui.createGameView();
  }

  protected override onInit<T extends AppScreen<UIType>>(instance: T): T {
    instance.init(this.ui);
    return instance;
  }

  public set(moduleId: string);
  public set<T extends ModuleConstructor<AppScreen<UIType>>>(Ctor: T);
  public set<T extends ModuleConstructor<AppScreen<UIType>>>(
    value: string | T,
  ) {
    // Following line wont show any errors with call like this:
    // const target = typeof value === "string" ? this.get(value) : this.get(value);
    // @ts-expect-error WEIRDO
    const target = this.get(value);

    if (!target) {
      console.error("Scene not found", value);
    }

    if (this.current === target) {
      console.warn("Scene already setted", value);
      return;
    }

    if (this.current) {
      this.removeScreen(this.current);
    }

    this.current = target;
    this.addScreen(this.current);
  }

  protected addScreen(screen: AppScreen<UIType>) {
    this.view.addChild(screen);
    this.ui.ticker.add(screen.onTick, screen);
    screen.onMount();
  }

  protected removeScreen(screen: AppScreen<UIType>) {
    this.view.removeChild(screen);
    this.ui.ticker.remove(screen.onTick, screen);
    screen.onUnmount();
  }
}
