import { defineConfig } from "@rspack/cli";
import { rspack, RspackOptions } from "@rspack/core";
import { generateGamesMeta } from "../scripts/gamesMeta";
import path from "path";
import { rm } from "fs/promises";

const workspaceRoot = path.resolve(__dirname, "../../../");
const outDist = path.resolve(workspaceRoot, "build");
const gamesDir = path.resolve(workspaceRoot, "games");
const gamesMetaFile = path.resolve(outDist, "meta.json");

export default defineConfig(async ({ RSPACK_SERVE }) => {
  await rm(outDist, { recursive: true, force: true });
  await generateGamesMeta(gamesDir, gamesMetaFile);

  const gamesMeta = (await import(gamesMetaFile)).default as IGamesConfig;
  const copyPatterns = Object.entries(gamesMeta).map(([gamePath, config]) => ({
    from: path.join(gamesDir, gamePath, "dist"),
    to: config.route || gamePath,
  }));

  return {
    extends: path.join(__dirname, "/base.config.ts"),
    entry: "./src/index.ts",
    resolve: {
      alias: {
        "@gamesMeta": gamesMetaFile,
      },
    },
    output: {
      path: outDist,
    },
    devServer: {
      port: 3001,
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
        template: path.join(__dirname, "../html/wrapper.index.html"),
        // base: RSPACK_SERVE ? undefined : `${config.route}/`,
        // title: config.title,
      }),
      new rspack.CopyRspackPlugin({
        patterns: copyPatterns,
      }),
    ],
  } satisfies RspackOptions;
});
