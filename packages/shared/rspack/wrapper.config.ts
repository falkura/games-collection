import { defineConfig } from "@rspack/cli";
import { rspack, RspackOptions } from "@rspack/core";
import { generateGamesMeta } from "../scripts/gamesMeta";
import { copyGameIcons } from "../scripts/copyGameIcons";
import path from "path";
import PATHS from "../paths";
import { rm } from "fs/promises";
import fs from "fs";

const gamesMetaFile = path.resolve(PATHS.buildPath, "meta.json");

const isProd = process.env.NODE_ENV === "production";

export default defineConfig(async ({ RSPACK_SERVE }) => {
  // No need to clear for dev server
  if (RSPACK_SERVE) {
    await rm(PATHS.buildPath, { recursive: true, force: true });
  }
  const metaData = await generateGamesMeta(PATHS.gamesPath, gamesMetaFile);
  await copyGameIcons(metaData);

  const gamesMeta = (await import(gamesMetaFile)).default as IGamesConfig;
  const copyPatterns = Object.entries(gamesMeta)
    .map(([gamePath, config]) => {
      const gameDist = path.join(PATHS.gamesPath, gamePath, "dist");
      if (!fs.existsSync(gameDist)) {
        console.error(gameDist, " folder not exists!");
        return undefined;
      }

      return {
        from: gameDist,
        to: config.route || gamePath,
      };
    })
    .filter((item) => item != undefined);

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
      filename: isProd ? "[name].[contenthash].js" : "[name].js",
      chunkFilename: isProd ? "[name].[contenthash].js" : "[name].js",
    },
    devServer: {
      port: 3001,
      static: [
        {
          directory: PATHS.buildPath,
          publicPath: "/",
          watch: true,
        },
        {
          directory: "public",
          publicPath: "/",
        },
      ],
    },
    plugins: [
      new rspack.DefinePlugin({
        __DEV__: !isProd,
      }),
      new rspack.HtmlRspackPlugin({
        template: "public/index.html",
      }),
      new rspack.CopyRspackPlugin({
        patterns: [
          ...copyPatterns,
          {
            from: "public",
            to: ".",
            globOptions: {
              ignore: ["**/index.html"],
            },
          },
        ],
      }),
    ],
  } satisfies RspackOptions;
});
