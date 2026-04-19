import { defineConfig } from "@rspack/cli";
import path from "path";
import fs from "fs";
import { rspack, RspackOptions } from "@rspack/core";

const config: IGameConfig = await import(path.resolve("assets", "game.json"));
const outDist = path.resolve("dist");

const isProd = process.env.NODE_ENV === "production";

const templatePath = path.join(__dirname, "../html/game.index.html");
const wrapperJsonPath = path.join(
  __dirname,
  "../../wrapper/assets/wrapper.json",
);

const wrapperConfig: IWrapperConfig = fs.existsSync(wrapperJsonPath)
  ? JSON.parse(fs.readFileSync(wrapperJsonPath, "utf-8"))
  : { title: "", subtitle: "" };

const baseUrl = wrapperConfig.url?.replace(/\/$/, "") ?? "";
const iconExt = config.icon ? path.extname(config.icon) : ".png";
const iconFile = `icon${iconExt}`;
const ogImage = baseUrl ? `${baseUrl}/${config.route}/${iconFile}` : iconFile;
const ogUrl = baseUrl ? `${baseUrl}/${config.route}/` : "";

const templateContent = fs
  .readFileSync(templatePath, "utf-8")
  .replace(/%TITLE%/g, config.title)
  .replace(/%DESCRIPTION%/g, config.description)
  .replace(/%OG_IMAGE%/g, ogImage)
  .replace(/%OG_URL%/g, ogUrl);

const iconSourcePath = path.resolve("assets", config.icon || "icon.png");
const copyPatterns = fs.existsSync(iconSourcePath)
  ? [{ from: iconSourcePath, to: iconFile }]
  : [];

export default defineConfig(() => {
  return {
    extends: path.join(__dirname, "/base.config.ts"),
    entry: "./src/index.ts",
    output: {
      path: outDist,
      filename: isProd ? "[name].[contenthash].js" : "[name].js",
      chunkFilename: isProd ? "[name].[contenthash].js" : "[name].js",
      clean: {
        keep: "assets",
      },
    },
    devServer: {
      port: 3000,
      static: [
        {
          directory: outDist,
          publicPath: "/",
          watch: true,
        },
      ],
    },
    plugins: [
      new rspack.DefinePlugin({
        __DEV__: !isProd,
      }),
      new rspack.HtmlRspackPlugin({
        templateContent,
      }),
      ...(copyPatterns.length
        ? [new rspack.CopyRspackPlugin({ patterns: copyPatterns })]
        : []),
    ],
  } satisfies RspackOptions;
});
