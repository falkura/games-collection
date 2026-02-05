import { defineConfig, LibConfig, RslibConfig } from "@rslib/core";

export default defineConfig(({ envMode }) => {
  const isDev = envMode === "dev";

  const devLib: LibConfig = {
    format: "esm",
    syntax: "esnext",
    bundle: false,
    dts: false,
    output: {
      distPath: "./dist/esm",
    },
  };

  const prodLib: LibConfig = {
    format: "umd",
    umdName: "__ENGINE__",
    syntax: "esnext",
    bundle: true,
    autoExternal: false,
    dts: false,
    output: {
      distPath: "./dist/umd",
    },
  };

  return {
    lib: [isDev ? devLib : prodLib],
    output: {
      cleanDistPath: true,
      target: "web",
      minify: false,
    },
  } as RslibConfig;
});
