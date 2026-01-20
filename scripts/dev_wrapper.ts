import { getGamesList } from "./utils/games";
import { getArgs } from "./utils/utils";
import { execa } from "execa";
import fs from "fs";

const games = await getGamesList();

fs.writeFileSync("dist/meta.json", JSON.stringify(games));

const args = getArgs();
const flags = [];

if (args.force) {
  flags.push("--force");
}

await execa({
  stdio: "inherit",
})`turbo ${["run", "dev", "--filter", "./packages/*", ...flags]}`;
