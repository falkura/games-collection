import { getGamesList } from "./utils/games";
import { getArgs } from "./utils/utils";
import { execa } from "execa";
import fs from "fs";
import path from "path";

const games = await getGamesList();

const outFile = path.resolve("dist/meta.json");

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(games));

const args = getArgs();
const flags = [];

if (args.force) {
  flags.push("--force");
}

await execa({
  stdio: "inherit",
})`turbo ${["run", "dev", "--filter", "./packages/*", ...flags]}`;
