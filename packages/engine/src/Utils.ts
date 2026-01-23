import { Assets, Texture } from "pixi.js";

export function AssetOrTexture(texture: Texture | string) {
  return typeof texture === "string" ? Assets.get(texture) : texture;
}
