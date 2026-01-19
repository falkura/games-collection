import { getArgs } from "./utils/utils";
import { execa } from "execa";
import path from "path";
import projectConfig from "../config.json";

const games = Object.values(projectConfig.games.gamesList)
  .filter(({ enabled }) => enabled !== false)
  .map(({ path: _path }) => _path);

const args = getArgs();
const flags = [];

if (args.force) {
  flags.push("--force");
}

// All packages required
flags.push("--filter", "./packages/*");

// Except wrapper
flags.push("--filter", "!./packages/wrapper");

// And the games
games.forEach((gamePath) => {
  flags.push("--filter", "./games/" + gamePath);
});

// Run build
await execa({
  stdio: "inherit",
})`turbo ${["run", "build", ...flags]}`;

// Then combine in wrapper
await execa({
  stdio: "inherit",
  cwd: path.resolve("packages/wrapper"),
})`bun ${["run", "build"]}`;
