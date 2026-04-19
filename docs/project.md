# Project

The monorepo, build pipeline, conventions, and deployment. For per-package details follow the links into [engine.md](./engine.md), [game-base.md](./game-base.md), [layout.md](./layout.md), [events.md](./events.md), [assets.md](./assets.md), [create-game.md](./create-game.md).

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

| Directory             | Purpose                                                                                                                   | Build tool |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------- | ---------- |
| `packages/engine/`    | PixiJS engine: Application, layout system, load scene, lifecycle, event emitter, asset loading                            | Rslib      |
| `packages/game-base/` | `GameBase` abstract class, `System` abstract class, `SystemController`, `ControlPanel` (Tweakpane)                        | Rslib      |
| `packages/wrapper/`   | Launcher, game picker, final production assembler                                                                         | Rspack     |
| `packages/shared/`    | Shared Rspack/Rslib configs, TypeScript configs, AssetPack configs, JSON schemas, build scripts, global types, HTML/CSS   | —          |
| `games/<name>/`       | Individual games, each with `src/`, `assets/`, and `game.json` config                                                     | Rspack     |
| `templates/`          | Moon generator templates for new games                                                                                    | —          |

Dependency graph:

```
engine (lib-engine) — no workspace deps
  └─ game-base (lib-game-base)
     └─ games/* (depend on engine + game-base)
     └─ wrapper (games-wrapper, depends on engine only)
shared — devDependency everywhere (configs only, no runtime code)
```

Libraries (engine, game-base) are built unbundled with Rslib (ESM + `.d.ts`, no minification). Games and wrapper are bundled applications built with Rspack (SWC for TS, LightningCSS for styles, SVG as source assets).

## Architecture summary

- **Engine** (`packages/engine/src/Engine.ts`) — singleton owning the PixiJS `Application`, GSAP setup, `LayoutManager`, shared `loadScene`, root `view`, typed event bus, asset loading, and game lifecycle state. Game-agnostic; holds no assets. See [engine.md](./engine.md).
- **Game Base** (`packages/game-base/`) — default `GameInstance` implementation. Wires up `Ticker`, master GSAP `Timeline`, `view`, Tweakpane `Pane`, `SystemController`. See [game-base.md](./game-base.md).
- **Systems** (`packages/game-base/src/system/System.ts`) — all gameplay code lives here. ECS-like modules with lifecycle hooks and auto-provisioned infrastructure. See [game-base.md](./game-base.md).
- **Wrapper** (`packages/wrapper/`) — launcher with game picker. During `bun run assemble`, aggregates all game builds, engine output, and a generated `@gamesMeta` module into a single deployable bundle.

## Key conventions

- All workspace packages use the `@falkura-pet/` scope.
- `__DEV__` is a global boolean for dev-only code paths (disabled in prod).
- `globalThis.engine`, `globalThis.game`, `globalThis.gsap`, `globalThis.layout`, `globalThis.PIXI`, `globalThis.app`, and `globalThis.__PIXI_APP__` are exposed in dev for console debugging.
- `canvas` and `root` are available as globals (see `packages/shared/types/global.d.ts`) — they come from `packages/shared/html/game.index.html`.
- Default branch: `master`.
- No test framework or linter is currently configured.
- Four TypeScript configs in `packages/shared/tsconfig/`: `game` (strict), `engine` (relaxed — no strict nulls / no-implicit-any), `wrapper`, `package` (libraries).
- In game source files, specify colors using hex strings only (for example `"#ffffff"`), not numeric literals like `0xffffff`.

## Game versioning

After modifying a game, bump `version` in `games/<name>/assets/game.json` (semver) — the wrapper's game picker surfaces it. Rules:

- **Patch** (`x.y.Z`) — bug fixes, tweaks, small content/UX changes.
- **Minor** (`x.Y.0`) — new features, new systems, sizable content additions, anything user-visible.
- **Major** (`X.0.0`) — only when the user explicitly asks for it. Never bump on your own.

## Build pipeline

- `bun run assemble` = `bun i && moon run '#game:build' -f && moon run games-wrapper:build`.
- Games build to `games/<name>/dist/`; wrapper copies all game dists + engine output + icons into `/build`.
- `packages/shared/scripts/gamesMeta.ts` scans `games/*/assets/game.json`, filters disabled games, writes `meta.json` — consumed via the `@gamesMeta` alias in the wrapper.
- `packages/shared/scripts/copyGameIcons.ts` copies each game's icon into `packages/wrapper/public/icons/`.
- Rspack configs live in `packages/shared/rspack/`: `base.config.ts` (shared loaders), `engine.config.ts` (Rslib), `game.config.ts` (port 3000, injects `game.json` + `wrapper.json` into the HTML template's `%TITLE%` / `%DESCRIPTION%` / `%OG_IMAGE%` / `%OG_URL%` placeholders for link previews; copies `assets/icon.*` to the game's dist root as a stable OG image), `wrapper.config.ts` (port 3001, runs meta/icon scripts before bundling and replaces the same placeholders on the wrapper's own HTML).

### Link previews & social meta

- Each game's HTML (`packages/shared/html/game.index.html`) and the wrapper's HTML (`packages/wrapper/public/index.html`) contain `%TITLE%`, `%DESCRIPTION%`, `%OG_IMAGE%`, `%OG_URL%` placeholders.
- For games: values come from `games/<name>/assets/game.json` (`title`, `description`) plus `packages/wrapper/assets/wrapper.json#url` (absolute base URL).
- For the wrapper: values come from `packages/wrapper/assets/wrapper.json` (`title`, `subtitle`, `url`).
- Set the absolute deployment URL in `wrapper.json#url` (e.g. `https://games-collection-7ga.pages.dev`); without it, OG URLs fall back to relative paths and crawlers will likely ignore them.
- The game rspack config also copies `assets/icon.*` to the game dist root as `icon.<ext>` so the OG image URL resolves to a stable (non-cache-busted) path — separate from AssetPack's hashed icon used at runtime.

### Game ordering in the wrapper

- `game.json#order` (number, optional) controls the position in the wrapper list — lower = earlier.
- Games without `order` sort last, alphabetically by title.

## Deployment

Hosted on Cloudflare Pages: <http://games-collection-7ga.pages.dev/>

- Build command: `bun run assemble`
- Output directory: `/build`
- Required env vars: `NODE_ENV=production`

## Maintainer

Vladyslav (GitHub: `@falkura-pet`). Primary dev environment: Windows 11 with bash shell.
