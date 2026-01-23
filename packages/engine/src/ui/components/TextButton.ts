import { LayoutStyles } from "@pixi/layout";
import { LayoutText } from "@pixi/layout/components";
import { TextStyleOptions } from "pixi.js";
import Button, { StateAnimations } from "./basic/Button";

export default class TextButton extends Button {
  constructor(options: {
    text: string;
    style?: TextStyleOptions;
    layout?: LayoutStyles;
    animations?: StateAnimations;
  }) {
    const view = new LayoutText({
      style: {
        fontSize: 24,
        fill: "#353535ff",
        align: "center",
        ...options.style,
      },
      layout: {
        backgroundColor: "#ffffff81",
        borderRadius: 8,
        width: 250,
        height: 50,
        ...options.layout,
      },
      text: options.text,
    });

    super(view, options.animations);
  }
}
