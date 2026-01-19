import { getArgs, pickGame } from "./utils/utils";
import { execa } from "execa";

const game = await pickGame();

const args = getArgs();
const flags = [];

if (args.force) {
  flags.push("--force");
}

// All packages required
flags.push("--filter", "./packages/*");

// Except wrapper
flags.push("--filter", "!./packages/wrapper");

// And the game
flags.push("--filter", "./games/" + game);

// Run turbo
await execa({
  stdio: "inherit",
})`turbo ${["run", "dev", ...flags]}`;
