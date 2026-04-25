import { defineConfig } from "@rspack/cli";
import path from "path";
import type { SwcLoaderOptions } from "@rspack/core";

const targets = ["chrome >= 87", "edge >= 88", "firefox >= 78", "safari >= 14"];

const tsLoader = (tsx: boolean) => ({
  loader: "builtin:swc-loader",
  options: {
    jsc: {
      parser: { syntax: "typescript", tsx },
      ...(tsx && {
        transform: { react: { runtime: "automatic" } },
      }),
    },
    env: { targets },
  } satisfies SwcLoaderOptions,
});

export default defineConfig({
  extends: [path.join(__dirname, "./game.config.ts")],
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".mjs", ".json"],
  },
  module: {
    rules: [
      { test: /\.ts$/, use: [tsLoader(false)] },
      { test: /\.tsx$/, use: [tsLoader(true)] },
    ],
  },
});
