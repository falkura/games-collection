import AppScreen from "../basic/AppScreen";
import { Tail } from "../../../Utils";
import { UIType } from "../../UI";
import { LayoutContainer } from "@pixi/layout/components";

export default class ScreensController extends LayoutContainer {
  private list: ScreensMap = {} as ScreensMap;
  private listRaw: any = {};
  private _current: AppScreen;

  constructor(private ui: UIType) {
    super({
      layout: {
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        position: "absolute",
      },
    });
  }

  public get current() {
    return this._current;
  }

  private set current(v: AppScreen) {
    this._current = v;
  }

  public register<
    T extends keyof ScreensMap,
    Ctor extends new (...args: any[]) => ScreensMap[T],
  >(key: T, ScreenCtor: Ctor, ...args: Tail<ConstructorParameters<Ctor>>) {
    this.listRaw[key] = arguments;
  }

  public build() {
    Object.values(this.listRaw).forEach((RawData: IArguments) => {
      this.list[RawData[0]] = new RawData[1](
        { ui: this.ui, id: RawData[0] },
        ...Array.from(RawData).slice(2),
      );
    });
  }

  public async setScreen(key: keyof ScreensMap, force = false) {
    if (this.current) {
      await this.unmount(this.current, force);
    }

    this.current = this.getByKey(key);

    await this.mount(this.current, force);
  }

  private async mount(screen: AppScreen, force: boolean) {
    this.addChild(screen);

    await screen.show(force);
  }

  private async unmount(screen: AppScreen, force: boolean) {
    await screen.hide(force);

    if (screen.parent) {
      screen.parent.removeChild(screen);
    }
  }

  private getByKey<T extends keyof ScreensMap>(key: T): ScreensMap[T] {
    if (!this.list[key]) {
      throw new Error(
        "Screen with key [" +
          key +
          "] does not exist or not added via UI.screens.register",
      );
    }

    return this.list[key];
  }
}
