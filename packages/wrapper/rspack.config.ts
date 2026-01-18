import { defineConfig } from "@rspack/cli";

import path from "path";
import config from "../../config.json";
import { rspack } from "@rslib/core";

// Target browsers, see: https://github.com/browserslist/browserslist
const targets = ["chrome >= 87", "edge >= 88", "firefox >= 78", "safari >= 14"];

const root = path.resolve(__dirname, "../../");
const distPath = path.resolve(root, "dist");

// Games data
const games = Object.values(config.games.gamesList)
  .filter(({ enabled }) => enabled !== false)
  .map((game) => {
    const route = game.route || game.path;

    return {
      route,
      import: path.join(root, "games", game.path, "dist"),
      filename: path.join(route, "index.js"),
    };
  });

// Entry scripts for each game
const entries = Object.fromEntries(
  games.map((data) => [
    data.route,
    { import: data.import, filename: data.filename },
  ]),
);

// Entry pages for each game
const htmlPlugins = games.map(
  ({ route }) =>
    new rspack.HtmlRspackPlugin({
      template: "./public/index.html",
      filename: path.join(route, "index.html"),
      chunks: [route], // Include only game script
      inject: "body",
    }),
);

// Copy game assets
const copyPatterns = games.map((data) => {
  return {
    from: path.join(data.import, "assets"),
    to: path.join(data.route, "assets"),
  };
});

// Local server routes from localhost:3000/game.html to localhost:3000/game
const gameRewrites = games.map(({ route }) => {
  return { from: new RegExp(`^/${route}$`), to: `/${route}.html` };
});

export default defineConfig({
  entry: {
    // Project entry script
    index: {
      import: "./src/index.ts",
      filename: "index.js",
    },

    ...entries,
  },
  output: {
    path: distPath,
    clean: false,
  },
  plugins: [
    // Project entry page
    new rspack.HtmlRspackPlugin({
      template: "./public/index.html",
      filename: "index.html",
      chunks: ["index"], // Include only wrapper script
      inject: "body",
    }),

    // Engine that will be used in project and games
    new rspack.CopyRspackPlugin({
      patterns: [
        { from: path.join(root, "packages/engine/dist"), to: "engine" },
        ...copyPatterns,
      ],
    }),

    ...htmlPlugins,
  ],
  /**
   * Transforms 'import Engine from "@falkura-pet/engine"' into
   * const Engine = window.__ENGINE__
   */
  externals: {
    "@falkura-pet/engine": "__ENGINE__",
  },
  externalsType: "window",

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
