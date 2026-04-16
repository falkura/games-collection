# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A PixiJS-based game collection monorepo. A shared engine and wrapper let you create multiple small web games that are developed independently but deployed as a single application.

## Commands

```bash
# Install dependencies
bun install

# Create a new game from template, then install deps and implement game logic
moon generate game -- --name '<human readable name>'
bun install

# Develop a specific game (port 3000, hot-reload includes engine changes)
moon run <game-name>:dev

# Develop the wrapper/launcher (port 3001)
moon run games-wrapper:dev

# Build a single game
moon run <game-name>:build

# Production build (outputs to /build)
moon run games-wrapper:assemble
```

## Monorepo Layout

- **Moon** orchestrates the workspace; each package/game has a `moon.yml` defining its layer, tags, and dependencies.
- **Bun** is the package manager.

| Directory             | Purpose                                                                                                       | Build tool |
| --------------------- | ------------------------------------------------------------------------------------------------------------- | ---------- |
| `packages/engine/`    | PixiJS game engine (UMD library, game-agnostic, no assets)                                                    | Rslib      |
| `packages/wrapper/`   | Launcher, game picker, final production assembler                                                             | Rspack     |
| `packages/game-base/` | `GameBase` abstract class, `SystemController`, `ControlPanel` (Tweakpane)                                     | —          |
| `packages/ui/`        | Shared UI components                                                                                          | —          |
| `packages/shared/`    | Shared Rspack configs (`rspack/`), TypeScript configs (`tsconfig/`), JSON schemas (`schemas/`), build scripts | —          |
| `games/<name>/`       | Individual games, each with `src/`, `assets/`, and `game.json` config                                         | Rspack     |
| `templates/`          | Moon generator templates for new games                                                                        | —          |

## Architecture

**Engine** → UMD module loaded separately in the browser; handles rendering (PixiJS), layout (@pixi/layout + Yoga), animations (GSAP), asset loading, game lifecycle, input. Must stay game-agnostic with no assets (SVG icons only for UI).

**Games** → Extend `GameBase` from `game-base`. Register systems in `init()`, use `SystemController` for ECS-like system management. Each game has a `game.json` config and an `assets/` directory processed by AssetPack.

**Wrapper** → Container app that assembles all game builds into a single deployable bundle. Depends on engine + UI.

**Build pipeline**: Shared Rspack configs live in `packages/shared/rspack/` (`base.config.ts`, `engine.config.ts`, `game.config.ts`, `wrapper.config.ts`). SWC for TypeScript transpilation, LightningCSS for styles.

## Key Conventions

- Engine types are imported from `@falkura-pet/engine/types/*` (e.g., `Game`, `UI`, `globals`)
- `__DEV__` global is available for dev-only code paths
- The default branch is `master`
- No test framework or linter is currently configured
- All workspace packages use the `@falkura-pet/` scope

## Game Init Sequence (`src/index.ts`)

```
Engine.initEvents() → Engine.initGSAP() → Engine.initApplication() → Engine.loadAssets()
→ Engine.initUI(UI) → Engine.initGame(MyGame, config) → Engine.ui.setScene("Game") → Engine.start()
```

## System Lifecycle (reserved method names)

`System` (in `packages/game-base/src/system/System.ts`) defines lifecycle hooks called automatically by `SystemController`: `start`, `finish(isWin?)`, `reset`, `pause`, `resume`, `resize`, `tick(ticker)`. **Do not declare a method on a System subclass with one of these names unless you intend to override the lifecycle hook** — shadowing one (even as `private`) silently breaks the game lifecycle. For end-of-round / completion logic that should not run the global `finish` cascade, use a different name (`complete`, `win`, `gameOver`, etc.). Always use the `override` keyword when implementing a hook so TypeScript catches accidental shadowing.

## Game Creation Workflow

When creating a new game (via `moon generate game` or by user request):

1. Scaffold with `moon generate game -- --name '<Human Name>'`, then `bun install`.
2. Implement game logic in `games/<name>/src/core/MainSystem.ts` (or split across multiple files in `src/core/`).
3. **Replace the placeholder description** in `games/<name>/README.md` (the `_Add a description..._` line) with 1–3 sentences about what the game does.
4. **Replace the placeholder `description` in `games/<name>/assets/game.json`** (defaults to `"template project"`) with a short, non-implementation-specific blurb — it's surfaced in the wrapper's game picker, so describe what the player does, not how the code works.
5. Verify with `moon run <name>:build`.

## Structuring Game Logic Across Systems

For complex games, split functionality across multiple `System` subclasses (e.g. `BoardSystem`, `InputSystem`, `ScoreSystem`) for readability. Register each one in the game class's `init()` via `this.systems.add(MySystem)`. Cross-system coordination belongs in the game class itself — reach another system from anywhere using `this.systems.get(MainSystem)` (from the game) or `this.game.systems.get(OtherSystem)` (from within a system).

**Prefer systems that talk to the game, and the game that talks to other systems**, rather than systems reaching into each other directly. This keeps systems loosely coupled and makes the game class the single place where cross-system flow is wired up.

## Deployment

Hosted on Cloudflare Pages: <http://games-collection-7ga.pages.dev/>

- Build command: `bun run assemble`
- Output directory: `/build`
- Required env vars: `NODE_ENV=production`, `__DEV__=false`

## Maintainer

Vladyslav (GitHub: `@falkura-pet`). Primary dev environment: Windows 11 with bash shell.
