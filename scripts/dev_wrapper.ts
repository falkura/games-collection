import { getArgs } from "./utils/utils";
import { execa } from "execa";

const args = getArgs();
const flags = [];

if (args.force) {
  flags.push("--force");
}

await execa({
  stdio: "inherit",
})`turbo ${["run", "dev", "--filter", "./packages/*", ...flags]}`;
