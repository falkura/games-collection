import { create as createBase } from "./base";
import path from "path";
import PATHS from "../paths";

export default createBase({
  output: path.resolve(PATHS.buildPath, "assets"),
  entry: "assets",
  manifestOutput: "manifest.json",
});
