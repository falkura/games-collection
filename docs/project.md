# Project

The monorepo, build pipeline, conventions, and deployment.

## Overview

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
bun run assemble
```

## Monorepo Layout

- **Moon** orchestrates the workspace; each package/game has a `moon.yml` defining its layer, tags, and dependencies.
- **Bun** is the package manager (workspaces: `packages/*`, `games/*`).

| Directory           | Purpose                                                                                                                                                 | Build tool |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| `packages/engine/`  | PixiJS engine + game framework: `Engine` singleton, `GameController`, `System`, `SystemController`, `ControlPanel`, `Layout`, load scene, asset loading | Rslib      |
| `packages/wrapper/` | Launcher, game picker, final production assembler                                                                                                       | Rspack     |
| `packages/shared/`  | Shared Rspack/Rslib configs, TypeScript configs, AssetPack configs, JSON schemas, build scripts, global types, HTML/CSS                                 | —          |
| `games/<name>/`     | Individual games, each with `src/`, `assets/`, and `game.json` config                                                                                   | Rspack     |
| `templates/`        | Moon generator templates for new games (`game`, `game-react`)                                                                                           | —          |

## Architecture summary

- **Engine** (`packages/engine/src/Engine.ts`) — singleton owning the PixiJS `Application`, GSAP setup, `Layout`, root view, typed event bus, asset loading, and game lifecycle state. Game-agnostic; holds no assets.
- **GameController** (`packages/engine/src/game/GameController.ts`) — abstract base every game extends. Wires up `Ticker`, master GSAP `Timeline`, view, Tweakpane `Pane`, and `SystemController`.
- **Systems** (`packages/engine/src/game/System.ts`) — all gameplay code lives here. Modules with lifecycle hooks and auto-provisioned `game` / `view` / `timeline`.
- **Wrapper** (`packages/wrapper/`) — launcher with game picker. During `bun run assemble`, aggregates all game builds, and engine output into a single deployable bundle.

## Build pipeline

- `bun run assemble` = `bun i && moon run '#game:build' -f && moon run games-wrapper:build`.
- Games build to `games/<name>/dist/`; wrapper copies all game dists + engine output + icons into `/build`.
- `packages/shared/scripts/copyGameIcons.ts` copies each game's icon into `packages/wrapper/public/icons/`.

## Deployment

Hosted on Cloudflare Pages: <http://games-collection-7ga.pages.dev/>

- Build command: `bun run assemble`
- Output directory: `/build`
- Required env vars: `NODE_ENV=production`

## Maintainer

Vladyslav (GitHub: `https://github.com/falkura`). Primary dev environment: Windows 11 with bash shell.
