import Enquirer from "enquirer";
import Bun from "bun";
import { parseArgs } from "util";
import logger from "./logger";
import { getGamesList } from "./games";

export async function pickGame() {
  const gameName = getArgs().game;
  const games = await getGamesList();

  if (gameName) {
    if (!games[gameName]) {
      logger.warn(
        `Game with name [${gameName}] does not exist or it's disabled`,
      );
    } else {
      return gameName;
    }
  }

  const gameKeys = Object.keys(games);

  if (gameKeys.length === 0) {
    logger.warn("Games not found.");
    process.exit(0);
  }

  if (gameKeys.length === 1) {
    logger.info(gameKeys);

    return gameKeys[0];
  }

  return await Enquirer.prompt<{ game: string }>({
    type: "select",
    name: "game",
    message: "Pick a game",
    choices: gameKeys,
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
      ["assemble-only"]: {
        type: "boolean",
      },
    },
    strict: true,
    allowPositionals: true,
  });

  return values;
}
