import { rspack } from "@rspack/core";
import { defineConfig } from "@rspack/cli";
import path from "path";

const build = defineConfig({
  entry: "./src/index.ts",
  output: {
    path: path.resolve("dist"),
    filename: "index.js",
    clean: false,
  },
  externals: {
    "@falkura-pet/engine": "__ENGINE__",
  },
  externalsType: "window",
});

const dev = defineConfig({
  entry: "./src/index.ts",
  output: {
    path: path.resolve("dist"),
    filename: "index.js",
    clean: false,
  },
  devServer: {
    port: 3001,
    static: [
      {
        directory: path.resolve("dist"),
        publicPath: "/",
        watch: true,
      },
    ],
  },
  plugins: [
    new rspack.HtmlRspackPlugin({
      // TODO is it okay?
      template: "../../packages/wrapper/public/index.html",
      filename: "index.html",
      inject: "body",
      templateParameters: {
        engine: ``,
      },
    }),
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: "builtin:lightningcss-loader",
          },
        ],
      },
    ],
  },
  optimization: {
    minimizer: [
      new rspack.SwcJsMinimizerRspackPlugin(),
      new rspack.LightningCssMinimizerRspackPlugin(),
    ],
  },
  experiments: {
    css: true,
  },
});

export const create = (dirname: string) => {
  return (env) => {
    // TODO use something more consistent
    const isDev = env.RSPACK_SERVE === true;

    return isDev ? dev : build;
  };
};
