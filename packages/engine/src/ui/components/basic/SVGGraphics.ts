import { LayoutStyles } from "@pixi/layout";
import { LayoutGraphics } from "@pixi/layout/components";
import { ColorSource } from "pixi.js";
import { Base64ToSvg } from "../../../Utils";

export default class SVGGraphics extends LayoutGraphics {
  constructor(options: {
    svg: string;
    color?: ColorSource;
    layout?: LayoutStyles;
  }) {
    super({
      layout: options.layout,
    });

    this.slot.svg(Base64ToSvg(options.svg));

    if (options.color) {
      this.slot
        .stroke({
          width: 1,
          alignment: 1,
          color: options.color,
        })
        .fill({
          color: options.color,
        });
    }
  }
}
