import { defineConfig } from "@rspack/cli";
import { rspack, RspackOptions } from "@rspack/core";
import { generateGamesMeta } from "../scripts/gamesMeta";
import { copyGameIcons } from "../scripts/copyGameIcons";
import path from "path";
import PATHS from "../paths";
import { rm } from "fs/promises";
import fs from "fs";

const gamesMetaFile = path.resolve(PATHS.buildPath, "meta.json");

// TODO simple serve
export default defineConfig(async ({ RSPACK_SERVE }) => {
  // TODO partial clear
  await rm(PATHS.buildPath, { recursive: true, force: true });
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
        __DEV__: true,
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
