import { defineConfig, LibConfig, RslibConfig } from "@rslib/core";

export default defineConfig(({ envMode }) => {
  const isDev = envMode === "dev";

  const devLib: LibConfig = {
    format: "esm",
    syntax: "esnext",
    bundle: false,
    autoExternal: false, // can be true for dev ?
    dts: true,
  };

  const prodLib: LibConfig = {
    format: "umd",
    umdName: "__ENGINE__",
    syntax: "esnext",
    bundle: true,
    autoExternal: false,
    dts: true,
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
