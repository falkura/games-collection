import { AppScreen } from "./AppScreen";
import { LayoutContainer } from "../layout/LayoutContainer";

export class GameScene extends AppScreen {
  gameContainer: LayoutContainer;

  public override onInit(): void {
    this.gameContainer = this.ui.view;

    this.addChild(this.gameContainer);
  }
}
