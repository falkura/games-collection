# Building a Game

Method signatures, field types, and lifecycle ordering live as JSDoc on the exported classes in `@falkura-pet/engine` (`Engine`, `GameController`, `System`, `SystemController`, `Layout`).

## Mental model

Three layers:

1. **`Engine`** (singleton, `@falkura-pet/engine`) — boots Pixi, loads assets, owns the lifecycle state machine, exposes the typed event bus. Game-agnostic. Call `Engine.startGame()` / `Engine.finishGame(data)` / `Engine.resetGame()` to drive transitions — never call the `GameController` lifecycle methods directly.
2. **Game** — your class extending `GameController`. Registers systems in `init()`, coordinates between them, configures the Tweakpane `pane`, owns the master GSAP `timeline`.
3. **Systems** — subclasses of `System`. All gameplay, visuals, and per-system state live here. Each has its own `view` (a PixiJS `Container`) and nested `timeline`, auto-injected on creation.

**Communication direction: systems talk to the game; the game talks to other systems.** One system does not reach directly into another — go through a method on the game class. Keeps the dependency graph flat.

## System lifecycle

Hooks fire in the order the engine cascades them. Override only the ones you need. **Don't declare methods with reserved hook names** (`build`, `mount`, `unmount`, `start`, `finish`, `reset`, `resize`, `tick`) unless you mean to override them.

- `build()` — once, when the system is first enabled after registration. Create display objects and attach listener here.
- `start()` — on `Engine.startGame()`.
- `finish(data?)` — on `Engine.finishGame(data)`.
- `reset()` — on `Engine.resetGame()`; restore pre-start state.
- `resize()` — on every window resize. Reposition and resize display objects here.
- `tick(ticker)` — every frame. Prefer GSAP tweens over per-frame logic where possible.
- `mount()` / `unmount()` — when re-enabled / disabled via `systems.enable(System)/disable(System)`.

### Enable / disable pattern

`systems.disable(Ctor)` removes the system's view from the stage, stops its hooks firing, and parks it in a disabled registry. `systems.enable(Ctor)` reverses that — and calls `build()` if the system was disabled on `GameController.init()`. This is how both templates gate the intro screen: all systems disabled except `IntroSystem`, then on tap the game disables intro and enables the gameplay systems before calling `Engine.startGame()`.

**`systems.get()` only finds active (enabled) systems.** A disabled system is not in the active list — `get()` returns `undefined` for it. Always call `systems.enable(Ctor)` before calling `systems.get(Ctor)` to configure the system. Never call `get()` on a system you just disabled or haven't enabled yet.

## Layout

`Layout` (exported from `@falkura-pet/engine`) is a plain helper updated by the engine on every resize.

Useful fields:

- `Layout.screen` — full viewport rect (`x`, `y`, `width`, `height`, `center`). Use for backgrounds, edge-anchored HUDs, anything that should reach the real window bounds.
- `Layout.game` — design-resolution rect (`1920×1080` landscape / `1080×1920` portrait by default). Use for gameplay content that must stay inside the fixed-aspect design rect. Over-fit axes are visible around it.
- `Layout.isPortrait`, `Layout.isMobile` — orientation and device flags for branching sizes/positions.

Design target defaults to `1920×1080` landscape; override per game via `Engine.init({ sizeLandscape, sizePortrait })` in `index.ts` if needed.

### Viewport pattern

Pick one per system:

- **Full-screen** — use `Layout.screen.*` directly. Default. Backgrounds, HUDs, full-bleed content.
- **Square arena** — position a container at `Layout.screen.center` with side `Layout.screenMin` (= `1080` by default in either orientation). Eliminates the orientation branch for grids/puzzles/arenas.
- **Design rect** — use `Layout.game.*` when the layout breaks if the aspect is stretched. Content outside the rect is letterboxed on over-fit axes.

### Rules

- Raw `Container`/`Graphics` children don't re-layout automatically. Reposition in `System.resize()`.
- Branch on `Layout.isMobile` for font sizes (mobile needs bigger text — both templates demonstrate this in `resize()`).

## Game lifecycle

Drive lifecycle via the engine API:

```ts
Engine.finishGame({ win: true, score });
Engine.resetGame(); // restart = reset then start
Engine.startGame();
```

## Passing data between systems

Systems reach the game via `this.game`; the game reaches other systems via `this.systems.get(OtherSystem)`. Example:

```ts
// In MainSystem:
this.game.updateHUD({ levelNumber: 2, levelCount: 5, ... });

// In Game:
updateHUD(data: IHUDData) {
  this.systems.get(HUDSystem).update(data);
}

// In HUDSystem:
update(data: IHUDData) { this.textField.text = ...; }
```

## Assets

Each game's `assets/` folder is bundled automatically. `Engine` loads the manifest during boot, so by the time `build()` runs everything is cached.

```
games/<name>/assets/
  game.json          // generated
  icon.png           // generated
  sprites/player.png
```

```ts
import { Assets } from "pixi.js";
const texture = Assets.get<Texture>("sprites/player.png");
```

Keys are paths relative to `assets/`.

## Game versioning

After modifying a game, bump `version` in `games/<name>/assets/game.json` (semver) — the wrapper's game picker surfaces it. Rules:

- **Patch** (`x.y.Z`) — bug fixes, tweaks, small content/UX changes.
- **Minor** (`x.Y.0`) — new features, new systems, sizable content additions, anything user-visible.
- **Major** (`X.0.0`) — when the architecture changes or when user asks.

## Conventions

- Colors in game code use hex strings: `"#ffffff"`.
- `__DEV__` is a global boolean — dev-only code paths are stripped in prod.
- `HTMLText` / `BitmapText` need `resolution: Engine.textResolution` for sharpness.
- Intro shows once, on game start only. Both templates do this by enabling only `IntroSystem` in `init()` and disabling it in `onPlay()`.
- Past ~300 lines or more than one reason to change, split it.
