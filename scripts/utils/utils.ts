import Enquirer from "enquirer";
import config from "../../config.json";
import { parseArgs } from "util";
import logger from "./logger";

export async function pickGame() {
  const gameName = getArgs().game;

  if (gameName) {
    if (!config.games.gamesList[gameName]) {
      logger.warn(`Game with name [${gameName}] does not exist`);
    } else {
      return gameName;
    }
  }

  const gamesList = Object.entries(config.games.gamesList)
    .filter(([_, { enabled }]) => enabled !== false)
    .map(([key, _]) => key);

  if (gamesList.length === 0) {
    logger.warn("Games not found.");
    process.exit(0);
  }

  if (gamesList.length === 1) {
    logger.info(gamesList[0]);

    return gamesList[0];
  }

  return await Enquirer.prompt<{ game: string }>({
    type: "select",
    name: "game",
    message: "Pick a game",
    choices: gamesList,
  }).then(({ game }) => game);
}

export function getArgs() {
  const { values } = parseArgs({
    args: Bun.argv,
    options: {
      game: {
        type: "string",
      },
      force: {
        type: "boolean",
      },
    },
    strict: true,
    allowPositionals: true,
  });

  return values;
}
