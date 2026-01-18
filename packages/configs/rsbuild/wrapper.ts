import { defineConfig, RsbuildConfig } from "@rsbuild/core";
import path from "path";

const root = path.resolve(__dirname, "../../../");

export const create = (dirname?: string) =>
  defineConfig({
    source: {},
    dev: {
      port: 3000,
    },
    html: {
      template: "./public/index.html",
    },
    output: {
      distPath: path.resolve(root, "dist"),
      cleanDistPath: false,
    },
  } as RsbuildConfig);
