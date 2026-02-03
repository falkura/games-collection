import {
  LayoutContainer,
  LayoutContainerOptions,
} from "@pixi/layout/components";
import UI from "../../UI";
import { Ticker } from "pixi.js";
import { LayoutOptions } from "@pixi/layout";

export default class AppScreen<UIType extends UI = UI> extends LayoutContainer {
  public ui: UIType;
  static MODULE_ID: string;

  constructor(options: LayoutContainerOptions = {} as any) {
    super({
      interactive: false,
      ...options,
      layout: {
        width: "100%",
        height: "100%",
        ...(options.layout as LayoutOptions),
      },
    });
  }

  public init(ui: UIType) {
    this.ui = ui;

    this.onInit();
  }

  public onInit() {
    // override me
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

  public onWindowShow() {
    // override me
  }

  public onWindowHide() {
    // override me
  }
}
