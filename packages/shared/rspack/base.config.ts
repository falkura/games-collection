import { defineConfig } from "@rspack/cli";
import { rspack, SwcLoaderOptions } from "@rspack/core";

// Target browsers, see: https://github.com/browserslist/browserslist
const targets = ["chrome >= 87", "edge >= 88", "firefox >= 78", "safari >= 14"];

const isProd = process.env.NODE_ENV === "production";

export default defineConfig({
  mode: isProd ? "production" : "development",
  devtool: isProd ? "source-map" : "eval-source-map",
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: "builtin:lightningcss-loader",
            options: {
              targets,
            },
          },
        ],
      },
      {
        test: /\.svg$/,
        type: "asset/source",
      },
      // TODO setup swc
      {
        test: /\.ts$/,
        use: [
          {
            loader: "builtin:swc-loader",
            options: {
              jsc: {
                parser: {
                  syntax: "typescript",
                },
              },
              env: { targets },
            } satisfies SwcLoaderOptions,
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js", ".mjs", ".json"],
  },
  optimization: {
    minimize: isProd,
    minimizer: [
      new rspack.SwcJsMinimizerRspackPlugin(),
      new rspack.LightningCssMinimizerRspackPlugin({
        minimizerOptions: { targets },
      }),
    ],
  },
  performance: {
    hints: isProd ? "warning" : false,
  },
  experiments: {
    css: true,
  },
});
