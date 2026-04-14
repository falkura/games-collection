# Engine

Core game engine built on PixiJS. Handles rendering, GSAP animations, asset loading, and game lifecycle. Built as an unbundled ESM library with Rslib.

> Part of the [Games Collection](../../README.md) monorepo

```bash
# No direct commands needed — develop by running any game:
moon run <game-name>:dev    # engine changes are picked up automatically
```

## Details

The engine is responsible for everything except game-specific logic: PixiJS rendering, GSAP animations (with PixiPlugin integration and ticker sync), game loop and lifecycle management (init, start, pause, resume, reset, finish), asset loading via AssetPack manifests, events handling.

It is designed to stay **game-agnostic** — no game logic, no game assets. Only SVG icons are allowed for built-in UI elements. Games and the wrapper consume it as a dependency.

The engine defines `GameInstance` and `UIInstance` interfaces. Any package that implements these interfaces can be plugged into the engine — `game-base` and `ui` are the default implementations, but they are not the only possible ones.

Built with Rslib as unbundled ESM (`bundle: false`) — each source file compiles to a separate `.js` + `.d.ts` output. Exports are fully controlled in `index.ts`.
