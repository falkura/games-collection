# Engine

Core game engine built on PixiJS. Handles rendering, GSAP, asset loading, game lifecycle, layout, and the Tweakpane debug panel.

> Part of the [Games Collection](../../README.md) monorepo

```bash
# No direct commands — develop by running any game:
moon run <game-name>:dev
```

It is designed to stay **game-agnostic** — no game logic, no game assets. Games consume it as a dependency.

## What it provides

|                      |                                                                                              |
| -------------------- | -------------------------------------------------------------------------------------------- |
| **PixiJS app**       | WebGPU-preferred renderer, auto-sized to the window.                                         |
| **GSAP**             | Ticker synced to PixiJS; `PixiPlugin` registered.                                            |
| **Asset loading**    | Loads an AssetPack `manifest.json` bundle behind a spinner before the game starts.           |
| **Lifecycle**        | `startGame` / `finishGame` / `resetGame` cascade through every system and emit typed events. |
| **Layout**           | Fit-scale + virtual-pixel helpers for both the full screen and the design-resolution rect.   |
| **Graphics presets** | `High` / `Medium` / `Low` adjust renderer resolution and max FPS at runtime.                 |
| **Debug panel**      | Tweakpane with FPS, speed slider, restart, and graphics toggle. Collapses to ⚙️.             |

## Architecture

```
Engine (singleton)
└── GameController (abstract, one per game)
    └── SystemController
        └── System[] (all gameplay and visuals live here)
```
