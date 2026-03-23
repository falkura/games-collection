import { create as createBase } from "./base";
import path from "path";

export default createBase({
  output: path.resolve("dist", "assets"),
  entry: "assets",
  manifestOutput: "manifest.json",
});
