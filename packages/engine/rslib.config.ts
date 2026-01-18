import { defineConfig } from "@rslib/core";

export default defineConfig({
  lib: [
    {
      format: "esm",
      syntax: "esnext",
      bundle: true,
      autoExternal: false,
      dts: true,
    },
  ],
  output: {
    cleanDistPath: true,
    target: "web",
    minify: true,
  },
});
