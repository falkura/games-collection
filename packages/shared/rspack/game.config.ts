import { defineConfig } from "@rspack/cli";
import path from "path";
import { rspack, RspackOptions } from "@rspack/core";

const config: IGameConfig = await import(path.resolve("game.json"));
const outDist = path.resolve("dist");

export default defineConfig(({ RSPACK_SERVE }) => {
  return {
    extends: path.join(__dirname, "/base.config.ts"),
    entry: "./src/index.ts",
    output: {
      path: outDist,
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
        __DEV__: true,
      }),
      new rspack.HtmlRspackPlugin({
        template: path.join(__dirname, "../html/game.index.html"),
        base: RSPACK_SERVE ? undefined : `${config.route}/`,
        title: config.title,
      }),
    ],
  } satisfies RspackOptions;
});
