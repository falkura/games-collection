import { pickGame } from "./utils";
import { execa } from "execa";

const game = await pickGame();

await execa({
  stdio: "inherit",
})`turbo run dev --filter=./packages/* --filter=./games/${game}`;
