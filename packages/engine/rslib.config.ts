import { defineConfig } from "@rslib/core";

export default defineConfig({
  lib: [
    {
      format: "umd",
      umdName: "__ENGINE__",
      syntax: "esnext",
      bundle: true,
      autoExternal: false,
      dts: true,
      output: {
        distPath: "./dist/umd",
      },
    },
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
    minify: false,
  },
});
