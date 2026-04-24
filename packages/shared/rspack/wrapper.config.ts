import { defineConfig } from "@rspack/cli";
import { rspack, RspackOptions } from "@rspack/core";
import { generateGamesMeta } from "../scripts/gamesMeta";
import { copyGameIcons } from "../scripts/copyGameIcons";
import path from "path";
import config from "../config";
import { rm } from "fs/promises";
import fs from "fs";

const gamesMetaFile = path.resolve(config.buildPath, "meta.json");
const isProd = process.env.NODE_ENV === "production";

const wrapperConfig: IWrapperConfig = JSON.parse(
  fs.readFileSync(path.resolve("assets/wrapper.json"), "utf-8"),
);

const baseUrl = config.url.replace(/\/$/, "");
const templateHtml = fs
  .readFileSync("public/index.html", "utf-8")
  .replace(/%TITLE%/g, wrapperConfig.title)
  .replace(/%DESCRIPTION%/g, wrapperConfig.subtitle)
  .replace(/%OG_URL%/g, `${baseUrl}/`);

export default defineConfig(async ({ RSPACK_SERVE }) => {
  if (RSPACK_SERVE) {
    await rm(config.buildPath, { recursive: true, force: true });
  }

  const metaData = await generateGamesMeta(config.gamesPath, gamesMetaFile);
  await copyGameIcons(metaData);

  const gamesMeta = (await import(gamesMetaFile)).default as IGamesConfig;
  const copyPatterns = Object.entries(gamesMeta)
    .map(([gamePath, gameConfig]) => {
      const gameDist = path.join(config.gamesPath, gamePath, "dist");
      if (!fs.existsSync(gameDist)) {
        console.error(gameDist, " folder not exists!");
        return undefined;
      }
      return { from: gameDist, to: gameConfig.route || gamePath };
    })
    .filter((item) => item != undefined);

  return {
    extends: path.join(__dirname, "/base.config.ts"),
    entry: "./src/index.ts",
    resolve: {
      alias: { "@gamesMeta": gamesMetaFile },
    },
    output: {
      path: config.buildPath,
      filename: isProd ? "[name].[contenthash].js" : "[name].js",
      chunkFilename: isProd ? "[name].[contenthash].js" : "[name].js",
    },
    devServer: {
      port: 3001,
      static: [
        { directory: config.buildPath, publicPath: "/", watch: true },
        { directory: "public", publicPath: "/" },
      ],
    },
    plugins: [
      new rspack.DefinePlugin({ __DEV__: !isProd }),
      new rspack.HtmlRspackPlugin({ templateContent: templateHtml }),
      new rspack.CopyRspackPlugin({
        patterns: [
          ...copyPatterns,
          {
            from: "public",
            to: ".",
            globOptions: { ignore: ["**/index.html"] },
          },
        ],
      }),
    ],
  } satisfies RspackOptions;
});
