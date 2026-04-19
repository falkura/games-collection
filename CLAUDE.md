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

## Architecture

**Engine** (`packages/engine/src/Engine.ts`) — singleton `Engine` instance owning the PixiJS `Application`, GSAP setup, `LayoutManager`, a shared `loadScene`, a `view` (`LayoutContainer` root for the active game), a single typed `EventEmitter<EngineEvents>`, asset loading, and game lifecycle state (`Init → Started → Finished`). It is game-agnostic and holds no assets. Scenes are minimal — `loadScene` is shown during loading and removed from the stage when `initGame()` runs; `view` is the only game-side container. There is no scene controller, no add/remove API.

**Game Base** (`packages/game-base/`) — default implementation of the engine's `GameInstance` interface. `GameBase` wires up a PixiJS `Ticker`, a master GSAP `Timeline`, a reference to `Engine.view`, a Tweakpane `Pane`, and a `SystemController`. Games extend `GameBase`.

**Systems** (`packages/game-base/src/system/System.ts`) — all actual gameplay code lives here. Games register `System` subclasses in `GameBase.init()` via `this.systems.add(MySystem)`. Systems are ECS-like modules with lifecycle hooks and auto-provisioned infrastructure (view, timeline, game reference).

**Wrapper** (`packages/wrapper/`) — launcher with a game picker (cards with icon, title, version, description per game). During `bun run assemble`, the wrapper aggregates all game builds, the engine output, and a generated `@gamesMeta` module into a single deployable bundle.

## Game Init Sequence (`games/<name>/src/index.ts`)

```ts
Engine.initEvents();
Engine.initGSAP();
await Engine.initApplication();   // creates Application, LayoutManager, view, loadScene
await Engine.loadAssets();        // loads manifest bundle with progress updates to loadScene
Engine.initGame(MyGame, config);  // instantiates GameBase, removes loadScene from stage
Engine.startGame();               // fires the lifecycle cascade
```

`initApplication()` adds both `view` and `loadScene` to the stage (view hidden until `initGame`). `initGame()` swaps them automatically — games never manage scenes themselves.

## Lifecycle

The engine exposes three lifecycle methods that can be called from game code (or from UI/debug controls):

| Engine method          | Cascade into                                    | Engine event emitted        |
| ---------------------- | ----------------------------------------------- | --------------------------- |
| `Engine.startGame()`   | `game.start()` → `systems.start()` → each system's `start()` | `engine:game-started`       |
| `Engine.restartGame()` | internally: `resetGame()` then `startGame()` (fires both cascades) | `engine:game-reseted`, then `engine:game-started` |
| `Engine.finishGame(data?)` | `game.finish(data)` → `systems.finish(data)` → each system's `finish(data)` | `engine:game-finished` (with `data`) |

Window resize is handled by `Engine.onResize` → `layout.resize(...)` → `game.resize()` → `systems.resize()` → each system's `resize()`.

**Cascade:** each engine lifecycle method delegates to a matching `GameBase` method, which delegates to `SystemController`, which calls the hook on every enabled system. Order: `Engine → GameBase → SystemController → each System`.

`GAME_STATE` guards against redundant transitions: `startGame()` only runs from `Init`; `finishGame()` only runs when not already `Finished`. There is no `Paused` state — pause/resume were intentionally removed; use `ticker.speed = 0` or disable specific systems via `systems.disable()` if you need similar behavior.

### Game lifecycle hooks (in `GameBase`)

The game class implements these (defaults are provided — override with the `override` keyword):

- `start()` — runs on **`startGame` and on `restartGame`** (after reset). Kicks ticker, plays timeline, starts all systems.
- `finish(data?)` — runs on `finishGame`. Stops ticker, clears child timelines, finishes all systems with `data`.
- `reset()` — runs on `restartGame` (internally, before `start`). Stops ticker, resets `ControlPanel`, re-enables disabled systems, resets all systems.
- `resize()` — runs on **any window resize**. Delegates to `systems.resize()`.

### System lifecycle hooks (reserved method names)

`System` in `packages/game-base/src/system/System.ts` defines these hooks, called automatically by `SystemController`:

- `start()`
- `finish(data?)`
- `reset()`
- `resize()`
- `tick(ticker)` — called every frame by the game's `Ticker`

**Do not declare a method on a System subclass with one of these names unless you intend to override the lifecycle hook** — shadowing one (even as `private`) silently breaks the game lifecycle. For end-of-round / completion logic that should not run the global `finish` cascade, use a different name (`complete`, `win`, `gameOver`, etc.). Always use the `override` keyword so TypeScript catches accidental shadowing.

### Lifecycle from the game side

Games must trigger restart/finish through the engine's public API, not by calling `GameBase` methods directly:

```ts
Engine.restartGame();                // instead of this.game.reset() + this.game.start()
Engine.finishGame({ score, moves }); // instead of this.game.finish(data)
```

This keeps engine state transitions (`GAME_STATE`) and event emission (`engine:game-*`) correct. External listeners (ControlPanel, wrapper UI) rely on the events.

## Systems — the place where all game code lives

Each system is auto-provisioned by `SystemController.onInit()` with:

- `game: T` — typed reference to the owning `GameBase` subclass. Use this as a mediator to reach other systems: `this.game.systems.get(OtherSystem)`. Prefer mediating through the game rather than systems reaching into each other directly — keeps systems loosely coupled.
- `view: LayoutContainer` — a full-screen `LayoutContainer` (`{ width: "sw", height: "sh" }`) already added to `this.game.view`, z-indexed by registration order. Add all your display objects as children of `this.view`. You can also assign layout configs to any child container (see Layout System below).
- `timeline: GSAPTimeline` — a GSAP timeline nested into the game's master timeline at position `"<"` (starts with the game). Use this for animations owned by the system; the game will play/clear it appropriately.
- `enabled: boolean` — set by `SystemController.enable/disable`.

Each system also has a static `MODULE_ID` string used for registration and lookup:

```ts
export class BoardSystem extends System<MemoryFlip> {
  static MODULE_ID = "board";

  override start() { /* build board */ }
  override tick(ticker: Ticker) { /* frame update */ }
  override resize() { /* reposition relative to Engine.layout.screen */ }
}
```

Register in your game class:

```ts
export class MemoryFlip extends GameBase {
  protected override init() {
    this.systems.add(BoardSystem);
    this.systems.add(ScoreSystem);
  }
}
```

`SystemController.disable(Ctor | MODULE_ID)` removes a system's view from the stage and moves it to an internal disabled registry (skipped in `tick`/`start`/etc.). `reset()` re-enables all disabled systems before propagating the reset. Disable toggles are also surfaced in the `ControlPanel`.

## Layout System

Responsive layout is custom — **not** `@pixi/layout`. Source: `packages/engine/src/layout/`.

### LayoutManager (`Engine.layout`)

Singleton created in `Engine.initApplication()`. On resize it:

1. Picks orientation (`isPortrait = height > width`) and the matching target size (`options` vs `options.portrait`).
2. Computes a fit-to-screen scale (`Math.min(width/targetWidth, height/targetHeight)`) and applies it to the stage.
3. Updates two rects:
   - `layout.game` — the virtual game area (always the configured target width/height, centered).
   - `layout.screen` — the full screen in virtual pixels (bigger than `game` on the over-fit axis).
4. Re-evaluates every `LayoutContainer` in the tree.

For responsive math in systems (e.g. grid sizing), read from `Engine.layout.screen` / `Engine.layout.game` inside `resize()` and reposition accordingly.

`Engine.layout.isMobile` — getter forwarded from pixi's `isMobile.any` util. True on any phone/tablet regardless of orientation. Use for touch-vs-desktop behavior (larger text, bigger hit targets, gesture changes) independent of `isPortrait`.

### LayoutContainer

A `Container` subclass that accepts a layout config and re-evaluates it on resize and on being added to the stage. Config keys:

| Key        | Type               | Notes                                                                  |
| ---------- | ------------------ | ---------------------------------------------------------------------- |
| `x`, `y`   | `string \| number` | Evaluated as an expression (see below).                                |
| `width`    | `string \| number` | Evaluated; also written to `view` if a view is attached.               |
| `height`   | `string \| number` | Evaluated; also written to `view` if a view is attached.               |
| `zIndex`   | `number`           | Standard PixiJS `zIndex` (parent is `sortableChildren = true`).        |
| `view`     | `Container`        | Optional inner child; `width`/`height` are forwarded to it.            |
| `onResize` | `({ manager, vars }) => void` | Custom resize callback; fires after handlers.               |
| `portrait` | `Partial<LayoutConfig>` | Overrides applied when `LayoutManager.isPortrait` is true.         |

### Layout expressions

Strings passed to `x/y/width/height` are evaluated as math expressions against `LayoutVars`:

| Var    | Meaning                                             |
| ------ | --------------------------------------------------- |
| `sw`   | Screen width (virtual)                              |
| `sh`   | Screen height (virtual)                             |
| `smax` | `Math.max(sw, sh)`                                  |
| `smin` | `Math.min(sw, sh)`                                  |
| `gx`   | Game rect X (offset of game area inside screen)     |
| `gy`   | Game rect Y                                         |
| `gw`   | Game rect width                                     |
| `gh`   | Game rect height                                    |

Examples: `"sw/2"`, `"sh-100"`, `"gx+gw"`, `"smax*0.8"`, `200` (numeric literals pass through).

Usage:

```ts
const header = new LayoutContainer({
  x: "sw/2",
  y: 40,
  width: "sw-80",
  height: 120,
  portrait: { y: 20, width: "sw-40" },
});
this.view.addChild(header);
```

### Scenes

- `LoadScene` (`packages/engine/src/scenes/LoadScene.ts`) — a `LayoutContainer` with background, spinner (rotated via `tick`), and loading label; shown during `loadAssets()` and removed when `initGame()` runs.
- `Engine.view` — the single `LayoutContainer` (`{ width: "sw", height: "sh" }`) that hosts the game. `GameBase` stores this as `this.view`, and each system's `view` is added here.

### Choosing a gameplay viewport

Pick one of these patterns and stick to it — mixing strategies within one game will bite you on orientation flips.

1. **Full-screen systems** — the default `this.view` is already `sw × sh`. Use this when gameplay doesn't care about aspect ratio: full-bleed HUDs, procedural space, anything that can stretch. Read `Engine.layout.screen.width/height` in `resize()` for bounds.

2. **Square viewport in a `smin × smin` `LayoutContainer`** — use when gameplay is **square or orientation-agnostic** (grids, puzzles, arenas). One container, same shape in both orientations, no per-orientation branching:

    ```ts
    // Virtual reference size = 1080 (smin), centered, square.
    const stage = new LayoutContainer({
      x: "sw/2 - smin/2",
      y: "sh/2 - smin/2",
      width: "smin",
      height: "smin",
    });
    this.view.addChild(stage);
    // Work in 0..1080 local coords inside stage; it scales to fit smin automatically.
    ```

    With the game configured for 1920×1080 landscape (so `smin = 1080` in either orientation), building gameplay against a fixed `1080×1080` reference and dropping it into this container removes the orientation branch entirely. HUD and background live outside the square at `sw × sh`.

3. **Fit to the virtual game rect (1920×1080)** — use when the layout is **authored** for a specific aspect ratio and breaks if stretched. Work in `Engine.layout.game` coords (0..gw, 0..gh); the layout scales it to fit and letterboxes. Good for cutscenes or fixed-camera 16:9 games; bad for puzzles where you want HUD to reach the screen edges.

**Tips:**

- Prefer `LayoutContainer` over manual `resize()` math whenever the thing you're positioning doesn't need per-frame logic — layout expressions are cheaper to read and maintain than imperative repositioning.
- Use `onResize` on a `LayoutContainer` for one-offs (e.g. changing a `Text` fontSize by orientation) instead of pulling state into a `System.resize()`.
- Never hardcode `1920`/`1080` in gameplay code — derive bounds from `Engine.layout.screen`, `Engine.layout.game`, or your local container's `width/height`. Hardcoded numbers break the moment someone changes the virtual size.
- Background sprites/graphics that span the viewport should draw at `screen.width/height` (not `game.*`) so they reach the actual edges on over-fit axes.

## Event System

`Engine.events` is a single typed `EventEmitter<EngineEvents>` (see `packages/engine/src/types/EngineEvents.ts`):

```ts
"engine:game-started":     () => void
"engine:game-finished":    (data?: any) => void
"engine:game-reseted":     () => void
"engine:settings-updated": (settings: Partial<UISettings>) => void
"engine:game-chosen":      (gameKey: string) => void
```

Emitted automatically by the corresponding lifecycle methods. Listen from any system, the ControlPanel, or wrapper UI:

```ts
Engine.events.on("engine:game-finished", (data) => { /* show win overlay */ });
```

## ControlPanel (Tweakpane debug UI)

`ControlPanel` (in `packages/game-base/src/ControlPanel.ts`) is auto-initialized for every game. It shows FPS, a game speed slider (multiplier on the ticker), a Restart button (calls `Engine.restartGame()`), a Graphics quality toggle (Low/Medium/High), and one toggleable button per registered system (click to enable/disable). Available in all dev builds.

## Assets

Each game has `assets/` processed by AssetPack (shared config in `packages/shared/assetpack/`). Produces `dist/assets/` with atlases, compressed PNG/JPG/WEBP, mipmaps, cache-busted hashes, and a PixiJS manifest. Load via `Engine.loadAssets()` (reads `manifest.json`, loads the first bundle). **The engine holds no assets** — only SVG UI icons allowed in shared packages.

## Key Conventions

- All workspace packages use the `@falkura-pet/` scope.
- `__DEV__` is a global boolean for dev-only code paths (disabled in prod).
- `globalThis.engine`, `globalThis.game`, `globalThis.gsap`, `globalThis.layout`, `globalThis.PIXI`, `globalThis.app`, and `globalThis.__PIXI_APP__` are exposed in dev for console debugging.
- `canvas` and `root` are available as globals (see `packages/shared/types/global.d.ts`) — they come from `packages/shared/html/game.index.html`.
- Default branch: `master`.
- No test framework or linter is currently configured.
- Four TypeScript configs in `packages/shared/tsconfig/`: `game` (strict), `engine` (relaxed — no strict nulls / no-implicit-any), `wrapper`, `package` (libraries).
- In game source files, specify colors using hex strings only (for example `"#ffffff"`), not numeric literals like `0xffffff`.

## Game Creation Workflow

When creating a new game (via `moon generate game` or by user request):

1. Scaffold with `moon generate game -- --name '<Human Name>'`, then `bun install`.
2. Implement game logic in `games/<name>/src/core/MainSystem.ts`. For complex games, split across multiple systems in `src/core/` (e.g. `BoardSystem`, `InputSystem`, `ScoreSystem`) — register each in the game class's `init()`.
3. **Replace the placeholder description** in `games/<name>/README.md` (the `_Add a description..._` line) with 1–3 sentences about what the game does.
4. **Replace the placeholder `description`** in `games/<name>/assets/game.json` (defaults to `"template project"`) with a short, non-implementation-specific blurb — it's surfaced in the wrapper's game picker, so describe what the player does, not how the code works.
5. Verify with `moon run <name>:build`.

## Game Versioning

After modifying a game, bump `version` in `games/<name>/assets/game.json` (semver) — the wrapper's game picker surfaces it. Rules:

- **Patch** (`x.y.Z`) — bug fixes, tweaks, small content/UX changes.
- **Minor** (`x.Y.0`) — new features, new systems, sizable content additions, anything user-visible.
- **Major** (`X.0.0`) — only when the user explicitly asks for it. Never bump on your own.

## Structuring Game Logic Across Systems

For complex games, split functionality across multiple `System` subclasses. Cross-system coordination belongs in the game class itself — reach another system using `this.systems.get(OtherSystem)` (from the game) or `this.game.systems.get(OtherSystem)` (from within a system).

**Prefer systems that talk to the game, and the game that talks to other systems**, rather than systems reaching into each other directly. This keeps systems loosely coupled and makes the game class the single place where cross-system flow is wired up.

### Decomposing a system once it grows

A `System` file past ~200 lines or with more than one reason to change should be split. Systems orchestrate; real behavior belongs in plain classes the system owns. Signs it's time: entity types inlined as interfaces + scattered update lambdas, physics/generation/IO interleaved with the tick loop, long `reset()` with per-type cleanup, trajectory math that reaches for `this`.

Pull those concerns into sibling folders next to `core/`:

```
games/<name>/src/
  core/
    MainSystem.ts        — orchestration only: arrays + tick order + game-over
    InputSystem.ts
    HUDSystem.ts
  entities/               — one class per entity, owns view + body + update + destroy
    Ship.ts
    Enemy.ts
    Projectile.ts
  physics/                — engine wrapper + pure math
    PhysicsWorld.ts
    gravity.ts
  level/                  — pure (opts) → LevelData generators
    LevelGenerator.ts
  progress.ts             — localStorage / persistence
  types.ts                — shared types + constants
```

Rules that keep this clean:

- **Entity classes own their view and body.** `new Ship(x, y, world, parent)` attaches to stage; `ship.destroy()` removes both. The system's `reset()` becomes a loop of `destroy()` calls.
- **Pure functions for physics and generation.** `gravityAt(px, py, sources)` and `generateLevel(opts)` take plain data in, return plain data out. Trivial to reuse in trajectory previews, tests, tooling.
- **Wrap third-party physics engines** (`matter-js`, `p2`, …) behind a `PhysicsWorld`-style class. Entities take it in the constructor and call a handful of methods; they don't import the engine directly unless they truly need to touch bodies.
- **The system is the orchestrator.** It holds entity arrays, calls `entity.update(dt)` in the right order, checks game-over conditions, fires `Engine.finishGame()`. No draw code, no physics math, no per-entity branching.
- **Data flows `level → entities → system`**, not back. Generators return specs (plain objects); the system spawns entities from specs. Never generate inside an entity constructor — it couples placement to spawning and kills level-data reuse.
- **Shared constants live in `types.ts`**, shared math in `physics/` or `util/`. If two entities need the same number, it lives in one of those, not duplicated.

## Build Pipeline

- `bun run assemble` = `bun i && moon run '#game:build' -f && moon run games-wrapper:build`.
- Games build to `games/<name>/dist/`; wrapper copies all game dists + engine output + icons into `/build`.
- `packages/shared/scripts/gamesMeta.ts` scans `games/*/assets/game.json`, filters disabled games, writes `meta.json` — consumed via the `@gamesMeta` alias in the wrapper.
- `packages/shared/scripts/copyGameIcons.ts` copies each game's icon into `packages/wrapper/public/icons/`.
- Rspack configs live in `packages/shared/rspack/`: `base.config.ts` (shared loaders), `engine.config.ts` (Rslib), `game.config.ts` (port 3000, injects `game.json` title into HTML), `wrapper.config.ts` (port 3001, runs meta/icon scripts before bundling).

## Deployment

Hosted on Cloudflare Pages: <http://games-collection-7ga.pages.dev/>

- Build command: `bun run assemble`
- Output directory: `/build`
- Required env vars: `NODE_ENV=production`, `__DEV__=false`

## Maintainer

Vladyslav (GitHub: `@falkura-pet`). Primary dev environment: Windows 11 with bash shell.
