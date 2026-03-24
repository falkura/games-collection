import { defineConfig } from "@rspack/cli";
import { rspack, RspackOptions } from "@rspack/core";
import { generateGamesMeta } from "../scripts/gamesMeta";
import path from "path";
import PATHS from "../paths";
import { rm } from "fs/promises";

const gamesMetaFile = path.resolve(PATHS.buildPath, "meta.json");

// TODO simple serve
export default defineConfig(async ({ RSPACK_SERVE }) => {
  // TODO partial clear
  await rm(PATHS.buildPath, { recursive: true, force: true });
  await generateGamesMeta(PATHS.gamesPath, gamesMetaFile);

  const gamesMeta = (await import(gamesMetaFile)).default as IGamesConfig;
  const copyPatterns = Object.entries(gamesMeta).map(([gamePath, config]) => ({
    from: path.join(PATHS.gamesPath, gamePath, "dist"),
    to: config.route || gamePath,
  }));

  return {
    extends: path.join(__dirname, "/base.config.ts"),
    entry: "./src/index.ts",
    resolve: {
      alias: {
        "@gamesMeta": gamesMetaFile,
      },
    },
    output: {
      path: PATHS.buildPath,
    },
    devServer: {
      port: 3001,
      static: [
        {
          directory: PATHS.buildPath,
          publicPath: "/",
          watch: true,
        },
      ],
    },
    plugins: [
      new rspack.DefinePlugin({
        __DEV__: true,
      }),
      new rspack.HtmlRspackPlugin({
        template: path.join(__dirname, "../html/wrapper.index.html"),
      }),
      new rspack.CopyRspackPlugin({
        patterns: copyPatterns,
      }),
    ],
  } satisfies RspackOptions;
});
