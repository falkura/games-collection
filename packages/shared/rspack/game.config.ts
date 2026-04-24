import { defineConfig } from "@rspack/cli";
import path from "path";
import fs from "fs";
import { rspack, RspackOptions } from "@rspack/core";
import CONFIG from "../config";

const gameConfig: IGameConfig = await import(
  path.resolve("assets", "game.json")
);
const outDist = path.resolve("dist");
const isProd = process.env.NODE_ENV === "production";

const baseUrl = CONFIG.url.replace(/\/$/, "");
const ogUrl = `${baseUrl}/${gameConfig.route}/`;
let iconAsset = "icon.png";

if (fs.existsSync(path.resolve("dist/assets/manifest.json"))) {
  // Resolve the hashed icon filename from the assetpack manifest
  const manifest = JSON.parse(
    fs.readFileSync(path.resolve("dist/assets/manifest.json"), "utf-8"),
  );
  iconAsset = manifest.bundles[0].assets.find((a: any) =>
    (a.alias as string[]).includes("icon.png"),
  )?.src[0];
}

const ogImage = `${baseUrl}/${gameConfig.route}/${iconAsset}`;

const templatePath = path.join(__dirname, "../html/game.index.html");
const templateHtml = fs.readFileSync(templatePath, "utf-8");

export default defineConfig(() => {
  return {
    extends: path.join(__dirname, "/base.config.ts"),
    entry: "./src/index.ts",
    output: {
      path: outDist,
      filename: isProd ? "[name].[contenthash].js" : "[name].js",
      chunkFilename: isProd ? "[name].[contenthash].js" : "[name].js",
      clean: { keep: "assets" },
    },
    devServer: {
      port: 3000,
      static: [{ directory: outDist, publicPath: "/", watch: true }],
    },
    plugins: [
      new rspack.DefinePlugin({ __DEV__: !isProd }),
      new rspack.HtmlRspackPlugin({
        templateContent: templateHtml
          .replace(/%TITLE%/g, gameConfig.title)
          .replace(/%DESCRIPTION%/g, gameConfig.description)
          .replace(/%OG_IMAGE%/g, ogImage)
          .replace(/%OG_URL%/g, ogUrl),
      }),
    ],
  } satisfies RspackOptions;
});
