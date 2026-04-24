import path from "path";

const root = path.resolve(__dirname, "../../");

export default {
  rootPath: root,
  gamesPath: path.join(root, "games"),
  buildPath: path.join(root, "build"),

  /** Absolute base URL of the deployed site. Used to build og:image / og:url meta tags. */
  url: "https://games-collection-7ga.pages.dev",
};
