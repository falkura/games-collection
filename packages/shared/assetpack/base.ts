import { pixiManifest, PixiManifestOptions } from "@assetpack/core/manifest";
import {
  texturePacker,
  texturePackerCacheBuster,
  texturePackerCompress,
} from "@assetpack/core/texture-packer";
import { compress, CompressOptions, mipmap } from "@assetpack/core/image";
import { json } from "@assetpack/core/json";
import { cacheBuster } from "@assetpack/core/cache-buster";
import { AssetPackConfig, AssetPipe } from "@assetpack/core";

export const create = ({
  output,
  entry,
  manifestOutput,
  overrides,
}: {
  output: string;
  entry: string;
  manifestOutput: string;
  overrides?: Partial<AssetPackConfig>;
}) => {
  overrides ??= {};

  const resolutions: Record<string, number> = { default: 1 };
  const doCacheBust: boolean = true;
  const compression: CompressOptions = {
    png: true,
    jpg: true,
    webp: true,
  };

  const manifestOptions: PixiManifestOptions = {
    createShortcuts: true,
    trimExtensions: true,
    output: manifestOutput,
  };

  return {
    entry: entry,
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

      compress(compression),
      texturePackerCompress(compression),

      json(),

      doCacheBust && cacheBuster(),
      doCacheBust && texturePackerCacheBuster(),

      pixiManifest(manifestOptions),
    ] as AssetPipe[],

    ...overrides,
  } satisfies AssetPackConfig;
};
