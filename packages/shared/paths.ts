import path from "path";

const root = path.resolve(__dirname, "../../");

export default {
  rootPath: root,
  gamesPath: path.join(root, "games"),
  buildPath: path.join(root, "build"),
};
