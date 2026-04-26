# Engine

Core game engine built on PixiJS. Handles rendering, GSAP, asset loading, game lifecycle, layout, and the Tweakpane debug panel.

> Part of the [Games Collection](../../README.md) monorepo

```bash
# No direct commands — develop by running any game:
moon run <game-name>:dev
```

It is designed to stay **game-agnostic** — no game logic, no game assets. Games consume it as a dependency.

## What it provides

|                      |                                                                                            |
| -------------------- | ------------------------------------------------------------------------------------------ |
| **PixiJS app**       | WebGPU-preferred renderer, auto-sized to the window.                                       |
| **GSAP**             | Ticker synced to PixiJS; `PixiPlugin` registered.                                          |
| **Lifecycle**        | `startGame` / `finishGame` / `resetGame` cascade to game and emit typed events.            |
| **GameController**   | Abstract base for game with `start`, `reset`, `finish` and `resize` lifecycle methods.     |
| **Asset loading**    | Loads an AssetPack `manifest.json` bundle behind a spinner before the game starts.         |
| **Layout**           | Fit-scale + virtual-pixel helpers for both the full screen and the design-resolution rect. |
| **Graphics presets** | `High` / `Medium` / `Low` adjust renderer resolution and max FPS at runtime.               |
| **Debug panel**      | Tweakpane with FPS, speed slider, restart, and graphics toggle. Collapses to ⚙️.           |
