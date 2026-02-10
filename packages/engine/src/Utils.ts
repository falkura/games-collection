import { Assets, Texture } from "pixi.js";

export function AssetOrTexture(texture: Texture | string) {
  return typeof texture === "string" ? Assets.get(texture) : texture;
}

export function Base64ToSvg(dataString: string) {
  let result: string;

  switch (dataString[0]) {
    case "d":
      const base64 = dataString.split(",")[1];
      result = atob(base64);
      break;
    case "<":
      // Ok
      result = dataString;
      break;

    default:
      console.error("Unknown svg data.", dataString);
      break;
  }

  return result;
}
