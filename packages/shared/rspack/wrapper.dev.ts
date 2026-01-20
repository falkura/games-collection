import { defineConfig } from "@rspack/cli";
import path from "path";
import { rspack } from "@rslib/core";

export default defineConfig({
  extends: path.join(__dirname, "/wrapper.base.ts"),
  output: {
    path: path.resolve("dist"),
    clean: false,
  },
  plugins: [
    // Project entry page
    new rspack.HtmlRspackPlugin({
      template: "./public/index.html",
      filename: "index.html",
      inject: "body",
      templateParameters: {
        engine: "",
      },
    }),
    new rspack.DefinePlugin({
      __DEV__: true,
    }),
  ],
  devServer: {
    port: 3001,
    static: [
      {
        directory: path.resolve("dist"),
        publicPath: "/",
        watch: true,
      },
    ],
  },
});
