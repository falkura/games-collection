# CLAUDE.md

- You need to show short tokenomics table after each game creation / modification command (part - tokens). For reading part - decompose what you've read and how much tokens consumed each subsection.
- **DO NOT USE ANY REFERENCES.** When implementing or modifying a game, do not read other games `games/<name>/` directories for patterns or inspiration, only when user explicitly asks for it.
- **DO NOT READ** `dist/`, `build/` and `node_modules/` folders if not neaded explicitly.

## Project

- **Moon** orchestrates the workspace; each package/game has a `moon.yml` defining its layer, tags, and dependencies.
- **Bun** is the package manager (workspaces: `packages/*`, `games/*`).

## Mental model

Two layers:

1. **`Engine`** (singleton, `@falkura-pet/engine`) — boots Pixi, loads assets, owns the lifecycle state machine, exposes the typed event bus. Game-agnostic. Call `Engine.startGame()` / `Engine.finishGame(data)` / `Engine.resetGame()` to drive transitions — never call the `GameController` lifecycle methods directly.
2. **Game** — your game class extending `GameController`. Configures the Tweakpane `pane`, owns the master GSAP `timeline`, lifecycle methods `start`, `reset` and `finish`, resize handler `resize`,

## Game lifecycle

Drive game lifecycle via the engine API:

```ts
Engine.finishGame({ win: true, score });
Engine.resetGame();
Engine.startGame();
```

## Assets

Game's `assets/` folder is bundled automatically. `Engine` loads files during boot, so by the time game created everything is cached.

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

## Conventions

- Colors in game code use hex strings: `"#ffffff"`.
- After modifying a game, bump `version` in `games/<name>/assets/game.json` (semver)
- `__DEV__` is a global boolean — dev-only code paths are stripped in prod.
- `HTMLText` / `BitmapText` need `resolution: Engine.textResolution` for sharpness.
- Raw `Container`/`Graphics` children don't re-layout automatically. Reposition in `Game.resize()` with help of `Layout` properties.

## React information (skip this section if game template used instead of game-react)

Third layer with react added.

PixiJS owns the canvas (gameplay, animation). React owns the DOM overlay (menus, HUD, modals) mounted into a global `<div id="uiRoot">` that sits above the canvas. The two communicate through plain modules — there is no Pixi-React bridge.

### Tweakpane reservation

The Tweakpane debug panel is fixed to the top-right. The shared HTML template defines `--tweakpane-reserved` (CSS var). Padding should be added only to the top right corner buttons, not to all elements that are anchored to the right.

### Conventions

- Co-locate components: `ui/components/Foo/Foo.tsx` + `Foo.css`. Import the CSS at the top of the TSX.
- The shared HTML template defines `--tweakpane-reserved` (CSS var) that can be used to shift items from top right corner. Tweakpane can be disabled entirely with corresponding parameter in `Engine.init({ hideDebugPane: true })`.

## Maintainer

Vladyslav (GitHub: `https://github.com/falkura`). Primary dev environment: Windows 11 with bash shell.
