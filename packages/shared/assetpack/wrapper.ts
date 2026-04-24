import { create as createBase } from "./base";
import path from "path";
import config from "../config";

export default createBase({
  output: path.resolve(config.buildPath, "assets"),
  entry: "assets",
  manifestOutput: "manifest.json",
});
