import { defineConfig, RslibConfig } from "@rslib/core";

export default defineConfig(({ envMode }) => {
  return {
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
            __DEV__: JSON.stringify(envMode),
          },
        },
      },
    ],
    output: {
      cleanDistPath: true,
      target: "web",
      minify: false,
    },
  } as RslibConfig;
});
