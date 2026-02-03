import { findUp } from "find-up";
import fs from "fs";
import path from "path";

/**
 * Walks through games folder, checking each file.
 * If file is a folder that contains game.json
 * add game to result list in format
 * ```js
 * {
 *      [directoryName]: (parsed game.json),
 *      [directoryName2]: (parsed game.json),
 * }
 * ```
 */
export async function getGamesList(): Promise<Record<string, IGameConfig>> {
  const gamesFolder = path.resolve("games");
  const files = fs.readdirSync(gamesFolder);
  const promises = files.map(
    (item) =>
      new Promise<{ gamePath: string; configPath: string } | undefined>(
        (resolve) => {
          const target = path.join(gamesFolder, item);

          fs.stat(target, async (err, stats) => {
            if (!stats.isDirectory()) return resolve(undefined);

            findUp("game.json", {
              cwd: target,
            }).then((result) =>
              resolve(
                result ? { gamePath: item, configPath: result } : undefined,
              ),
            );
          });
        },
      ),
  );

  const result = await Promise.all(promises);
  const games: {
    gamePath: string;
    configPath: string;
  }[] = [];

  result.forEach((item) => {
    item && games.push(item);
  });

  const configPromises = games.map(
    ({ gamePath, configPath }) =>
      new Promise<[string, IGameConfig]>(async (resolve) =>
        resolve(
          import(configPath).then(({ default: config }) => [gamePath, config]),
        ),
      ),
  );

  const gamesList = {};

  await Promise.all(configPromises).then((result) =>
    result.forEach(([gameDir, gameConfig]) => {
      if (gameConfig.enabled !== false) {
        gamesList[gameDir] = gameConfig;
      }
    }),
  );

  return gamesList;
}
