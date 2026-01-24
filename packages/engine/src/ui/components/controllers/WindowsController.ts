import AppWindow from "../basic/AppWindow";
import PauseWindow from "../windows/PauseWindow";
import { Tail } from "../../../Utils";
import { UIType } from "../../UI";
import { LayoutContainer } from "@pixi/layout/components";
import InfoWindow from "../windows/InfoWindow";

declare global {
  interface WindowsMap {}
}

export default class WindowsController extends LayoutContainer {
  private list: WindowsMap = {} as WindowsMap;
  private _current: AppWindow;

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
    this.register("pause", PauseWindow);
    this.register("info", InfoWindow);
  }

  public get current() {
    return this._current;
  }

  private set current(v: AppWindow) {
    this._current = v;
  }

  public register<
    T extends keyof WindowsMap,
    Ctor extends new (...args: any[]) => WindowsMap[T],
  >(key: T, WindowCtor: Ctor, ...args: Tail<ConstructorParameters<Ctor>>) {
    if (this.list[key]) {
      console.error(`Window with key [${key}] already registrered!`);
      return;
    }

    this.list[key] = new WindowCtor({ ui: this.ui, id: key }, ...args);
  }

  public unregister<T extends keyof WindowsMap>(key: T) {
    if (!this.list[key]) {
      console.error(`Window with key [${key}] does not registrered!`);
      return;
    }

    this.list[key].destroy();

    delete this.list[key];
  }

  public async showWindow(windowKey: keyof WindowsMap, force = false) {
    const window = this.getByKey(windowKey);
    const screen = this.ui.screens.current;

    if (this.current === window) return;

    if (this.current) {
      await this.hideWindow(force);
    }

    this.current = window;

    this.addChild(window);

    screen.onWindowShow(window, force);

    return window.show(force);
  }

  public async hideWindow(force = false) {
    const window = this.current;

    this.current = undefined;

    const screen = this.ui.screens.current;

    screen.onWindowHide(window, force);

    await window.hide(force);

    if (window.parent) {
      window.parent.removeChild(window);
    }
  }

  public getByKey<T extends keyof WindowsMap>(key: T): WindowsMap[T] {
    if (!this.list[key]) {
      throw new Error(
        "Window with key [" +
          key +
          "] does not exist or not added via UI.windows.register",
      );
    }

    return this.list[key];
  }
}
