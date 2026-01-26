import { create as createBase } from "./base";
import path from "path";
import Bun from "bun";

/**
 * Wrapper assets should be added to the root of 
 * project output folder on build, but for development
 * they should stay at the wrapper's package root
 */
export const create = (dirname: string) =>
  createBase({
    output: Bun.argv.includes("development")
      ? path.resolve("dist", "assets")
      : path.resolve("../../dist", "assets"),
    entry: "assets",
    manifestOutput: "manifest.json",
  });
