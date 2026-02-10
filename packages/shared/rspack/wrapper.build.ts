import { defineConfig } from "@rspack/cli";
import path from "path";
import { rspack } from "@rslib/core";

const root = path.resolve(__dirname, "../../../");
const distPath = path.resolve(root, "dist");

const gameMetaPath = path.join(root, "dist", "meta.json");

const gamesMeta = await import(gameMetaPath);
const enginePath = path.join(root, "packages/engine/dist/umd");
const engineExport = "@falkura-pet/engine";
const engineModuleName = "__ENGINE__";

// Games data
const games = Object.entries(gamesMeta.default as [string, any]).map(
  ([gamePath, { route }]) => {
    return {
      route: route || gamePath,
      import: path.join(root, "games", gamePath, "dist"),
    };
  },
);

// Copy game assets
const copyPatterns = games.map((data) => {
  return {
    from: path.join(data.import),
    to: path.join(data.route),
  };
});

export default defineConfig({
  // devtool: false,
  extends: path.join(__dirname, "/wrapper.base.ts"),
  output: {
    path: distPath,
    clean: false,
  },
  plugins: [
    // Project entry page
    new rspack.HtmlRspackPlugin({
      template: path.join(__dirname, "../html/wrapper.html"),
      filename: "index.html",
      chunks: ["index"], // Include only wrapper script
      inject: "body",
      templateParameters: {
        engine: `<script type="module" src="/engine/index.js"></script>`,
      },
    }),

    new rspack.CopyRspackPlugin({
      patterns: [
        // Engine that will be used in wrapper and games
        { from: enginePath, to: "engine" },
        // All builded games
        ...copyPatterns,
      ],
    }),

    new rspack.DefinePlugin({
      __DEV__: false,
    }),
  ],
  /**
   * Transforms 'import UI from "@falkura-pet/engine/ui/UI"' into
   * module.exports = window.__ENGINE__.ui.UI;
   */
  externals: [
    ({ request }, callback) => {
      if (request?.startsWith(engineExport)) {
        return callback(
          null,
          request.replace(engineExport, engineModuleName).split("/"),
        );
      }
      callback();
    },
  ],
  externalsType: "window",
});
