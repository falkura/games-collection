import fs from "fs";
import path from "path";
import { rm } from "fs/promises";
import PATHS from "../paths";

/**
 * Copies all game icons from games/<game-folder>/assets/<icon-path>
 * to packages/wrapper/public/icons/<game-folder>.<extension>
 *
 * Reads game.json["icon"] for each game to determine the icon filename.
 */
export async function copyGameIcons(gamesMeta: IGamesConfig) {
  const iconDir = path.resolve("public/icons");

  await rm(iconDir, { recursive: true, force: true });
  fs.mkdirSync(iconDir, { recursive: true });

  for (const [gamePath, config] of Object.entries(gamesMeta)) {
    if (!config.icon) {
      console.warn(`No icon specified for game: ${gamePath}`);
      continue;
    }

    const sourceIconPath = path.join(
      PATHS.gamesPath,
      gamePath,
      "assets",
      config.icon,
    );

    if (!fs.existsSync(sourceIconPath)) {
      console.warn(`Icon not found: ${sourceIconPath}`);
      continue;
    }

    const ext = path.extname(config.icon);
    const destIconPath = path.join(iconDir, `${gamePath}${ext}`);

    fs.copyFileSync(sourceIconPath, destIconPath);
  }
}
