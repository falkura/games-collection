import { LayoutStyles } from "@pixi/layout";
import { ColorSource } from "pixi.js";
import Button from "./basic/Button";
import SVGGraphics from "./basic/SVGGraphics";

export default class SVGButton extends Button {
  constructor(options: {
    svg: string;
    color?: ColorSource;
    layout?: LayoutStyles;
  }) {
    const view = new SVGGraphics({
      svg: options.svg,
      color: options.color,
      layout: {
        width: 50,
        height: 50,
        padding: 10,
        backgroundColor: "#ffffff81",
        borderRadius: 8,
        ...options.layout,
      },
    });

    super(view);
  }
}
