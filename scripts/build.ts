import { getArgs } from "./utils/utils";
import { execa } from "execa";
import Bun from "bun";
import path from "path";
import { getGamesList } from "./utils/games";
import { rm } from "fs/promises";

const args = getArgs();

const assemble = async () => {
  // Combine games and engine in wrapper
  await execa({
    stdio: "inherit",
    cwd: path.resolve("packages/wrapper"),
  })`bun ${["run", "build"]}`;
};

if (args["assemble-only"]) {
  await assemble();

  process.exit(0);
}

const flags = [];
const games = await getGamesList();

const cleanPromises = [];
cleanPromises.push(rm("dist", { recursive: true, force: true }));

for (let gamePath in games) {
  cleanPromises.push(
    rm(path.join("games", gamePath, "dist"), { recursive: true, force: true }),
  );
}

await Promise.all(cleanPromises);

await Bun.write("dist/meta.json", JSON.stringify(games));

if (args.force) {
  flags.push("--force");
}

// All packages required
flags.push("--filter", "./packages/*");

// Except wrapper
flags.push("--filter", "!./packages/wrapper");

// And the games
for (let gamePath in games) {
  flags.push("--filter", "./games/" + gamePath);
}

// Run build
await execa({
  stdio: "inherit",
})`turbo ${["run", "build", ...flags]}`;

await assemble();
