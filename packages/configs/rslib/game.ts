import { defineConfig } from "@rslib/core";
import path from "path";

export const create = (dirname: string, config: { gameCode: string }) =>
  defineConfig({
    lib: [
      {
        format: "esm",
        syntax: "esnext",
        bundle: true,
        dts: false,
        autoExternal: true,
      },
    ],
    output: {
      cleanDistPath: false,
      target: "web",
      minify: true,
      distPath: path.resolve(dirname, "../../dist/games", config.gameCode),
    },
  });
