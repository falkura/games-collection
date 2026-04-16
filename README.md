# Games Collection

A PixiJS game collection monorepo. A shared engine and wrapper let you create multiple small web games that are developed independently but deployed as a single application.

[PROJECT DEPLOY](http://games-collection-7ga.pages.dev/)

## Init

1. Install [Bun](https://bun.com/docs/installation)
2. Run `bun install`

## Usage

### New game

To create new game run `moon generate game` then `bun install`. Game will be created in `/games` folder.

Alternatively, you can ask [Claude Code](https://claude.com/claude-code) to scaffold and implement a game for you — just type `create <game name>` (e.g. `create tetris`) and Claude will generate the project and write the game logic.

### Develop game

To develop new game run `moon run <game-name>:dev` and open in browser [http://localhost:3000](http://localhost:3000).

### Develop wrapper

Wrapper can be developed with `moon run games-wrapper:dev`. It will be served at [http://localhost:3001](http://localhost:3001).

### Build

Run `bun run assemble` to assemble application. It will be assembled to `/build` folder in the project root.

## Project Structure

| Directory                                                         | Description                                                                |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------- |
| [`packages/engine/`](./packages/engine/README.md)                 | PixiJS game engine — rendering, animations, lifecycle, asset loading       |
| [`packages/game-base/`](./packages/game-base/README.md)           | Abstract game classes                                                      |
| [`packages/ui-base/`](./packages/ui-base/README.md)               | Scenes, custom layout system, responsive containers                        |
| [`packages/shared/`](./packages/shared/README.md)                 | Rspack/Rslib configs, TypeScript configs, AssetPack configs, build scripts |
| [`packages/wrapper/`](./packages/wrapper/README.md)               | Launcher app — game picker, final production assembler                     |
| `games/<name>/`                                                   | Individual games, each with `src/`, `assets/`, and `game.json`             |
| [`templates/game-template/`](./templates/game-template/README.md) | Moon generator template for new games                                      |

## Architecture

Library packages (engine, game-base, ui-base) are built unbundled with Rslib, games and the wrapper are bundled as applications with Rspack.

The **engine** is game-agnostic and defines `GameInstance` and `UIInstance` interfaces. **game-base** and **ui-base** are the default implementations, consumed by every game. Games register their logic as systems via `SystemController`. The **wrapper** assembles all game builds, engine output, and a generated `@gamesMeta` module into a single deployable bundle.

**Moon** orchestrates all tasks. **Bun** is the package manager.

## Deployment

Use `bun run assemble` as the build command, `/build` as the output directory. Set the following environment variables:

```bash
NODE_ENV=production     # production Rspack build
__DEV__=false           # disable dev globals
```

## License

License is **TBD**. Until a license is added, all rights are reserved by the author.
