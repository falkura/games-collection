import { getArgs, pickGame } from "./utils/utils";
import { execa } from "execa";

const game = await pickGame();

const args = getArgs();
const flags = [];

if (args.force) {
  flags.push("--force");
}

await execa({
  stdio: "inherit",
})`turbo ${["run", "dev", "--filter", "./packages/*", "--filter", "./games/" + game, ...flags]}`;
