
# Game Template

This repository is a **game template** and should be used as the base for creating new games.

All games **must be created from this repository** to ensure compatibility with the engine, wrapper, and build system.

## Creating a New Game

Follow these steps to create a new game from this template:

1. Copy this repository inside games folder. Name of the folder will be the **game key**.
2. Set a **unique** package name in `package.json`.
3. Set a **unique** `route` value in `game.json`.

Game is ready and will be added to next build.

To develop the game run dev script from monorepo root and select the game by **game key**:
   ```bash
   bun run dev
   ```
and open local server: **http://localhost:3000/**

## Project Structure

### Game Configuration

The `game.json` file contains **metadata** about the game.

The `route` value is used to access the game after build and **must be unique across all games**.

The package name in `package.json` **must be unique across all games**.

> [!TIP]
> For more information about `game.json` fields, hover over the required field.

---

### Assets

All game assets **must be placed inside** `./assets/` folder.

Assets can be accessed in the game code using:

```ts
PIXI.Assets.get("<asset-name-or-relative-path>")
```

---

### Source Code

Game logic and functionality should be implemented as usual in `./src/`

This includes gameplay logic, systems, state management, and any game-specific code.

## Additional information

Extra dependencies can be added to the game if needed.

For architecture details and shared concepts, see the **monorepo root README**.