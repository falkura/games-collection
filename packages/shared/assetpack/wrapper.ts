import { create as createBase } from "./base";
import path from "path";

export const create = () =>
  createBase({
    output: path.resolve("../../build", "assets"),
    entry: "assets",
    manifestOutput: "manifest.json",
  });
