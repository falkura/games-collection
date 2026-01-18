import { defineConfig, RsbuildConfig } from "@rsbuild/core";
import path from "path";

const root = path.resolve(__dirname, "../../../");
const distPath = path.resolve(root, "dist");
const gamesRoot = path.join(distPath, "games");

export const create = (dirname?: string) =>
  defineConfig({
    source: {
      entry: {
        game1: ["./src/global.ts", path.join(gamesRoot, "template")],
        index: ["./src/global.ts", "./src/index.ts"],
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
