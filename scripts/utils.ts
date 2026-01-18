import fs from "fs";
import path from "path";
import Enquirer from "enquirer";
import config from "./config.json";
import { parseArgs } from "util";
import logger from "./logger";

const _gamesPath = path.resolve(config.gamesFolder);

export async function pickGame() {
  const gameName = getArgs().game;

  if (gameName) {
    const targetPath = path.join(_gamesPath, gameName);

    if (!fs.existsSync(targetPath) || !fs.statSync(targetPath).isDirectory()) {
      logger.warn(`Game with name [${gameName}] does not exist`);
    } else {
      return gameName;
    }
  }

  let _games: string[] = [];

  fs.readdirSync(_gamesPath).forEach((file) => {
    const targetPath = path.join(_gamesPath, file);

    if (
      fs.statSync(targetPath).isDirectory() &&
      !config.ignoreList.includes(file)
    ) {
      _games.push(file);
    }
  });

  if (_games.length === 0) {
    logger.warn("Games not found.");
    process.exit(0);
  }

  return await Enquirer.prompt<{ game: string }>({
    type: "select",
    name: "game",
    message: "Pick a game",
    choices: _games,
  }).then(({ game }) => game);
}

export function getArgs() {
  const { values } = parseArgs({
    args: Bun.argv,
    options: {
      game: {
        type: "string",
      },
    },
    strict: true,
    allowPositionals: true,
  });

  return values;
}
