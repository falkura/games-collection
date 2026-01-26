import { create as createBase } from "./base";
import path from "path";

export const create = (dirname: string) =>
  createBase({
    output: path.resolve(dirname, "dist", "assets"),
    entry: "assets",
    manifestOutput: "manifest.json",
  });
