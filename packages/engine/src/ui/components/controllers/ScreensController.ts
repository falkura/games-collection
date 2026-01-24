import AppScreen from "../basic/AppScreen";
import { LoadScreen } from "../screens/LoadScreen";
import { MenuScreen } from "../screens/MenuScreen";
import { GameScreen } from "../screens/GameScreen";
import { ResultScreen } from "../screens/ResultScreen";
import { Tail } from "../../../Utils";
import { UIType } from "../../UI";
import { LayoutContainer } from "@pixi/layout/components";

declare global {
  interface ScreensMap {}
}

export default class ScreensController extends LayoutContainer {
  private list: ScreensMap = {} as ScreensMap;
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

    // Create UI config entry to get this data from
    this.register("load", LoadScreen);
    this.register("menu", MenuScreen);
    this.register("game", GameScreen);
    this.register("result", ResultScreen);
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
    if (this.list[key]) {
      console.error(`Screen with key [${key}] already registrered!`);
      return;
    }

    this.list[key] = new ScreenCtor({ ui: this.ui, id: key }, ...args);
  }

  public unregister<T extends keyof ScreensMap>(key: T) {
    if (!this.list[key]) {
      console.error(`Screen with key [${key}] does not registrered!`);
      return;
    }

    this.list[key].destroy();

    delete this.list[key];
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

  public getByKey<T extends keyof ScreensMap>(key: T): ScreensMap[T] {
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
