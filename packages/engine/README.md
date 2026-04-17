# Engine

Core game engine built on PixiJS. Handles rendering, GSAP animations, asset loading, and game lifecycle.

> Part of the [Games Collection](../../README.md) monorepo

```bash
# No direct commands needed — develop by running any game:
moon run <game-name>:dev    # engine changes are picked up automatically
```

## Details

The engine is responsible for everything except game-specific logic: PixiJS rendering, GSAP animations, game loop and lifecycle management (start, pause, resume, finish, reset, resize), asset loading via AssetPack manifests, events handling.

It is designed to stay **game-agnostic** — no game logic, no game assets. Games and the wrapper consume it as a dependency.

The engine defines `GameInstance` interface. Any package that implements this interface can be plugged into the engine — `game-base` is the default implementations, but it is not the only possible one.
