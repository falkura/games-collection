import { defineConfig, RsbuildConfig } from "@rsbuild/core";
import path from "path";
import config from "../../config.json";

const root = path.resolve(__dirname, "../../");
const distPath = path.resolve(root, "dist");
const gamesRoot = path.join(distPath, "games");
const globalScript = "./src/global.ts";

const games = Object.values(config.games.gamesList)
  .filter(({ enabled }) => enabled !== false)
  .map((game) => {
    const route = game.route || game.path;

    return [route, [globalScript, path.join(gamesRoot, game.path)]];
  });

export default defineConfig({
  source: {
    entry: {
      ...Object.fromEntries(games),
      index: [globalScript, "./src/index.ts"],
    },
  },
  html: {
    template: "./public/index.html",
    inject: "body",
  },
  server: {
    port: 3000,
  },
  output: {
    distPath: distPath,
    cleanDistPath: false,
  },
  resolve: {
    alias: {
      "@falkura-pet/engine": path.join(root, "packages/engine/dist"),
    },
  },
} as RsbuildConfig);
