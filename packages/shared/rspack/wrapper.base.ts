import { defineConfig } from "@rspack/cli";
import path from "path";

const root = path.resolve(__dirname, "../../../");
const gameMetaPath = path.join(root, "dist", "meta.json");

export default defineConfig({
  extends: path.join(__dirname, "/base.ts"),
  entry: {
    index: {
      import: ["./src/index.ts", gameMetaPath],
      filename: "index.js",
    },
  },
  resolve: {
    alias: {
      "@gamesMeta": gameMetaPath,
    },
  },
});
