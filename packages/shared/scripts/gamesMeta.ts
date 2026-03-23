import fs from "fs";
import path from "path";

/**
 * Walks through games folder, checking each file.
 * If file is a folder that contains game.json
 * add game to result list in format
 * ```js
 * {
 *      [directoryName]: (game.json),
 *      [directoryName2]: (game.json),
 * }
 * ```
 */
export async function generateGamesMeta(gamesDir: string, outFile: string) {
  const entries = fs.readdirSync(gamesDir, { withFileTypes: true });
  const result: Record<string, IGameConfig> = {};

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const configPath = path.join(gamesDir, entry.name, "game.json");
    if (!fs.existsSync(configPath)) continue;

    const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

    if (config.enabled !== false) {
      result[entry.name] = config;
    }
  }

  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(result));
}
