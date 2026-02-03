import AppScreen from "./AppScreen";
import { Text } from "pixi.js";
import UI from "../../UI";

export default class AppWindow<
  UIType extends UI = UI,
> extends AppScreen<UIType> {
  title: Text;

  constructor(...args: ConstructorParameters<typeof AppScreen<UIType>>) {
    super(...args);

    this.layout = {
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
      gap: 10,
    };

    this.title = new Text({
      style: {
        fontSize: 35,
        fill: "#ffffffff",
      },
      layout: {
        position: "absolute",
        top: 0,
        margin: 15,
      },
    });

    this.addChild(this.title);
  }

  public set titleText(v: string) {
    this.title.text = v;
  }
}
