import { LayoutStyles } from "@pixi/layout";
import { LayoutSprite } from "@pixi/layout/components";
import { Texture } from "pixi.js";
import { AssetOrTexture } from "../../../Utils";

export class Background extends LayoutSprite {
  constructor(options: { texture: Texture | string; layout?: LayoutStyles }) {
    const texture = AssetOrTexture(options.texture);

    super({
      texture,
      layout: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
        objectPosition: "center center",
        ...options.layout,
      },
    });
  }
}
