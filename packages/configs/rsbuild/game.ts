import { defineConfig, RsbuildConfig } from "@rsbuild/core";

export const create = (dirname?: string) =>
  defineConfig({
    source: {},
    dev: {
      port: 3000,
    },
    html: {
      template: "./public/index.html",
    },
  } as RsbuildConfig);
