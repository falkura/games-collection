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

| Directory | Purpose | Build tool |
|---|---|---|
| `packages/engine/` | PixiJS game engine (UMD library, game-agnostic, no assets) | Rslib |
| `packages/wrapper/` | Launcher, game picker, final production assembler | Rspack |
| `packages/game-base/` | `GameBase` abstract class, `SystemController`, `ControlPanel` (Tweakpane) | — |
| `packages/ui/` | Shared UI components | — |
| `packages/shared/` | Shared Rspack configs (`rspack/`), TypeScript configs (`tsconfig/`), JSON schemas (`schemas/`), build scripts | — |
| `games/<name>/` | Individual games, each with `src/`, `assets/`, and `game.json` config | Rspack |
| `templates/` | Moon generator templates for new games | — |

## Architecture

**Engine** → UMD module loaded separately in the browser; handles rendering (PixiJS), layout (@pixi/layout + Yoga), animations (GSAP), asset loading, game lifecycle, input. Must stay game-agnostic with no assets (SVG icons only for UI).

**Games** → Extend `GameBase` from `game-base`. Register systems in `init()`, use `SystemController` for ECS-like system management. Each game has a `game.json` config and an `assets/` directory processed by AssetPack.

**Wrapper** → Container app that assembles all game builds into a single deployable bundle. Depends on engine + UI.

**Build pipeline**: Shared Rspack configs live in `packages/shared/rspack/` (`base.config.ts`, `engine.config.ts`, `game.config.ts`, `wrapper.config.ts`). SWC for TypeScript transpilation, LightningCSS for styles.

## Key Conventions

- Engine types are imported from `@falkura-pet/engine/types/*` (e.g., `Game`, `UI`, `globals`)
- Games use `strict: true` TypeScript (`packages/shared/tsconfig/game.tsconfig.json`); engine uses a looser config
- `__DEV__` global is available for dev-only code paths
- The default branch is `master`
- No test framework or linter is currently configured
