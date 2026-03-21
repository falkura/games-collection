import { defineConfig, LibConfig, RslibConfig } from "@rslib/core";

export default defineConfig(({ envMode }) => {
  const isDev = envMode === "dev";

  const libDefault: LibConfig = {
    syntax: "esnext",
    dts: false,
    source: {
      define: {
        __DEV__: JSON.stringify(envMode),
      },
    },
  };

  const devLib: LibConfig = {
    format: "esm",
    bundle: false,
    output: {
      distPath: "./dist/esm",
    },
    ...libDefault,
  };

  const prodLib: LibConfig = {
    format: "umd",
    umdName: "__ENGINE__",
    bundle: true,
    autoExternal: false,
    output: {
      distPath: "./dist/umd",
    },
    ...libDefault,
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
