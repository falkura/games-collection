import { UI } from "../UI";
import { Ticker } from "pixi.js";
import { UIScreen } from "@falkura-pet/engine/types/UI";
import { LayoutContainer } from "../layout/LayoutContainer";

export abstract class AppScreen<UIType extends UI = UI>
  extends LayoutContainer
  implements UIScreen
{
  public ui: UIType;
  static MODULE_ID: string;

  /** @internal */
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
}
