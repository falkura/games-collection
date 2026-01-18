import { pixiManifest } from "@assetpack/core/manifest";
import {
  texturePacker,
  texturePackerCacheBuster,
  texturePackerCompress,
} from "@assetpack/core/texture-packer";
import { compress, mipmap } from "@assetpack/core/image";
import { json } from "@assetpack/core/json";
import { cacheBuster } from "@assetpack/core/cache-buster";
import path from "path";
import projectConfig from "../../../config.json";

export const create = (dirname) => {
  const resolutions = { default: 1 };
  const doCacheBust = false;
  const compression = {
    png: true,
    jpg: true,
    webp: true,
  };
  const manifestOptions = {
    createShortcuts: true,
    trimExtensions: true,
    output: "manifest.json",
  };

  const output = path.resolve(
    dirname,
    "../../dist",
    projectConfig.games.path,
    path.basename(dirname),
    "assets",
  );

  return {
    entry: "assets",
    output: output,
    cache: doCacheBust,

    logLevel: "verbose",

    pipes: [
      texturePacker({
        texturePacker: {
          removeFileExtension: true,
          nameStyle: "short",
        },
        resolutionOptions: {
          resolutions,
        },
      }),

      mipmap({ resolutions }),

      compress({ ...compression }),
      texturePackerCompress({ ...compression }),

      json(),

      doCacheBust && cacheBuster(),
      doCacheBust && texturePackerCacheBuster(),

      pixiManifest({ ...manifestOptions }),
    ],
  };
};
