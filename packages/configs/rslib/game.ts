import { defineConfig } from "@rslib/core";
import path from "path";
import projectConfig from "../../../config.json";

export const create = (dirname: string) => {
  return defineConfig({
    lib: [
      {
        format: "esm",
        syntax: "esnext",
        bundle: true,
        dts: false,
        autoExternal: true,
      },
    ],
    output: {
      cleanDistPath: false,
      target: "web",
      minify: true,
      distPath: path.resolve(
        dirname,
        "../../dist",
        projectConfig.games.path,
        path.basename(dirname),
      ),
    },
  });
};
