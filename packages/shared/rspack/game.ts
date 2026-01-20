import { rspack } from "@rspack/core";
import { defineConfig } from "@rspack/cli";
import path from "path";
import { IGameConfig } from "../../../scripts/utils/games";

const outDist = path.resolve("dist");

const build = (config: IGameConfig) => {
  return defineConfig({
    extends: path.join(__dirname, "/base.ts"),
    entry: {
      index: {
        import: "./src/index.ts",
        filename: "index.js",
      },
    },
    output: {
      path: outDist,
      filename: "index.js",
      clean: false,
    },
    externals: {
      "@falkura-pet/engine": "__ENGINE__",
    },
    externalsType: "window",
    plugins: [
      new rspack.DefinePlugin({
        __DEV__: false,
      }),
      new rspack.HtmlRspackPlugin({
        template: path.join(__dirname, "../html/game.html"),
        filename: "index.html",
        chunks: ["index"],
        inject: "body",
        base: `${config.route}/`,
        title: config.title,
        templateParameters: {
          engine: `<script src="/engine/index.js"></script>`,
        },
      }),
    ],
  });
};

const dev = defineConfig({
  extends: path.join(__dirname, "/base.ts"),
  entry: "./src/index.ts",
  output: {
    path: outDist,
    filename: "index.js",
    clean: false,
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
    new rspack.HtmlRspackPlugin({
      template: path.join(__dirname, "../html/game.html"),
      filename: "index.html",
      inject: "body",
      templateParameters: {
        engine: ``,
      },
    }),
    new rspack.DefinePlugin({
      __DEV__: true,
    }),
  ],
});

export const create = (dirname: string) => {
  return async (env) => {
    // TODO use something more consistent
    const isDev = env.RSPACK_SERVE === true;
    let config;

    if (!isDev) {
      config = await import(path.resolve(dirname, "game.json"));
    }

    return isDev ? dev : build(config);
  };
};
