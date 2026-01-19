import { defineConfig } from "@rspack/cli";
import path from "path";
import config from "../../config.json";
import { rspack } from "@rslib/core";

// Target browsers, see: https://github.com/browserslist/browserslist
const targets = ["chrome >= 87", "edge >= 88", "firefox >= 78", "safari >= 14"];

// Local server routes from localhost:3000/game.html to localhost:3000/game
// TODO game and wrapper development at the same time isnt possible right now
const gameRewrites = Object.values(config.games.gamesList)
  .filter(({ enabled }) => enabled !== false)
  .map((game) => {
    const route = game.route || game.path;

    return { from: new RegExp(`^/${route}$`), to: `/${route}.html` };
  });

export default defineConfig({
  entry: {
    // Project entry script
    index: {
      import: "./src/index.ts",
      filename: "index.js",
    },
  },
  output: {
    path: path.resolve("dist"),
    clean: false,
  },
  plugins: [
    // Project entry page
    new rspack.HtmlRspackPlugin({
      template: "./public/index.html",
      filename: "index.html",
      inject: "body",
      templateParameters: {
        engine: "",
      },
    }),
  ],

  devServer: {
    port: 3000,
    historyApiFallback: {
      rewrites: [...gameRewrites],
    },
  },

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
