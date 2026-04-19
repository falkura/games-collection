import { defineConfig, RslibConfig } from "@rslib/core";

const isProd = process.env.NODE_ENV === "production";

export default defineConfig({
  lib: [
    {
      format: "esm",
      syntax: "esnext",
      bundle: false,
      dts: true,
      output: {
        distPath: "./dist",
      },
      source: {
        define: {
          __DEV__: !isProd,
        },
      },
    },
  ],
  output: {
    cleanDistPath: false,
    target: "web",
    minify: false,
  },
});
