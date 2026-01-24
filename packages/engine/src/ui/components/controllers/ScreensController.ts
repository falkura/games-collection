import { Application } from "pixi.js";
import AppScreen from "../basic/AppScreen";
import { LoadScreen } from "../screens/LoadScreen";
import { MenuScreen } from "../screens/MenuScreen";
import { GameScreen } from "../screens/GameScreen";
import { ResultScreen } from "../screens/ResultScreen";

declare global {
  interface ScreensMap {}
}

export default class ScreensController {
  private list: ScreensMap = {} as ScreensMap;
  private current: AppScreen;

  constructor(
    private app: Application,
    autoInit: boolean = true,
  ) {
    if (!autoInit) return;

    this.add("load", LoadScreen);
    this.add("menu", MenuScreen);
    this.add("game", GameScreen);
    this.add("result", ResultScreen);
  }

  public add<
    T extends keyof ScreensMap,
    Ctor extends new (...args: any[]) => ScreensMap[T],
  >(key: T, ScreenCtor: Ctor, ...args: ConstructorParameters<Ctor>) {
    this.list[key] = new ScreenCtor(...args);
  }

  public async show(key: keyof ScreensMap) {
    if (this.current) {
      await this.unmount(this.current);
    }

    this.current = this.getByKey(key);

    await this.mount(this.current);
  }

  private async mount(screen: AppScreen) {
    this.app.stage.addChild(screen);

    await screen.show();
  }

  private async unmount(screen: AppScreen) {
    await screen.hide();

    if (screen.parent) {
      screen.parent.removeChild(screen);
    }
  }

  public getByKey<T extends keyof ScreensMap>(key: T): ScreensMap[T] {
    if (!this.list[key]) {
      throw new Error(
        "Screen with key [" +
          key +
          "] does not exist or not added via UI.screens.add",
      );
    }

    return this.list[key];
  }
}
