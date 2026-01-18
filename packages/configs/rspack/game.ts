import { defineConfig } from "@rspack/cli";
import path from "path";

export const create = (dirname: string) => {
  return defineConfig({
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
};
