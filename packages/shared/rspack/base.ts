import { defineConfig } from "@rspack/cli";
import { rspack } from "@rspack/core";

// Target browsers, see: https://github.com/browserslist/browserslist
const targets = ["chrome >= 87", "edge >= 88", "firefox >= 78", "safari >= 14"];

export default defineConfig({
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
                  // dynamicImport: true,
                  decorators: true,
                },
                // baseUrl: "./",
              },
              // module: {
              //   type: "es6",
              // },
              // minify: false,
              env: { targets },
            },
          },
        ],
      },
    ],
  },
  optimization: {
    minimizer: [
      new rspack.SwcJsMinimizerRspackPlugin(),
      new rspack.LightningCssMinimizerRspackPlugin({
        minimizerOptions: { targets },
      }),
    ],
  },
  experiments: {
    css: true,
  },
});
