import { create as createBase } from "./base.ts";
import path from "path";

export default createBase({
  output: path.resolve("dist", "assets"),
  entry: "assets",
  manifestOutput: "manifest.json",
});
