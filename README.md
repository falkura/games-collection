# Games Collection

A monorepo for building and shipping multiple games with minimal overhead. It includes a shared engine and wrapper that handle asset loading, rendering, layout, resizing, lifecycle, dev tools, and build configuration. Creating a new game requires a single command and a few lifecycle methods. Multiple games can be bundled into one deployable app just as easily.

[PROJECT DEPLOY](https://gameskiki.com/)

## Init

1. Install [Bun](https://bun.com/docs/installation)
2. Run `bun install`

> **Windows note:** Windows Defender / SmartScreen may block `moon.exe` after install. If `moon` fails to run, add it as an exception in your antivirus/Defender settings (or disable the Smart App Control), remove global moon with command `bun r -g @moonrepo/cli` and try again.

## Usage

### New game

To create new game run `moon generate game` then `bun install`. Game will be created in `/games/<game-name>` folder.

Alternatively, you can ask [Claude Code](https://claude.com/claude-code) to create a new game for you — just type `create <game-name>` (e.g. `create tetris`) and Claude will generate the project and write the game logic.

### Develop game

To develop new game run `moon run <game-name>:dev` and open in browser <http://localhost:3000>.

### Develop wrapper

Wrapper can be developed with `moon run games-wrapper:dev`. It will be served at <http://localhost:3001>.

### Build

Run `bun run assemble` to assemble application. It will be assembled to `/build` folder in the project root.

After build you can run `bun run preview` to preview project build locally.

## Project Structure

| Directory                                                   | Description                                            |
| ----------------------------------------------------------- | ------------------------------------------------------ |
| [`packages/engine/`](./packages/engine/README.md)           | PixiJS Game engine                                     |
| [`packages/shared/`](./packages/shared/README.md)           | Rspack / TypeScript / AssetPack configs, build scripts |
| [`packages/wrapper/`](./packages/wrapper/README.md)         | Application launcher and game picker                   |
| [`templates/game/`](./templates/game/README.md)             | Moon generator template — Pixi-only game               |
| [`templates/game-react/`](./templates/game-react/README.md) | Moon generator template — Pixi gameplay + React UI     |
| `games/<name>/`                                             | Individual games                                       |

## Architecture

The project is a monorepo managed with `Moon` and the `Bun` package manager. It includes a shared engine built on `PixiJS`, `GSAP`, and `Tweakpane`, a wrapper application with a game picker, and all the games.

The architecture also includes **build** and **assembly** scripts, asset processing via `AssetPack`, `Rspack` for games and wrapper, and `Rslib` for the engine. Game scaffolding is handled through `Tera` templates integrated with `Moon` generators, along with predefined `Claude Code` instructions for rapid game creation.

## Deployment

Hosted on Cloudflare Pages.

Use `bun run assemble` as the build command, `/build` as the output directory. Set the following environment variables:

```bash
NODE_ENV=production     # production Rspack build
BUN_VERSION=1.3.5       # enable Bun
```

Configure on Cloudflare Pages (Settings → Builds & deployments):

- **Build cache** — enable. Cloudflare preserves `node_modules/` and `.moon/cache/` between runs; Moon then only rebuilds projects whose inputs actually changed.
- **Build watch paths** — `games/*`, `packages/*`, `.moon/**/*.yml`, `package.json`. Exclude paths:`*.md`
