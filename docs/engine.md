# Engine

`Engine` is a singleton exported from `@falkura-pet/engine` — the monorepo package in `packages/engine/`. It owns the PixiJS `Application`, the layout system, a single typed event bus, the load scene, and the running game's lifecycle state. It is game-agnostic: no gameplay, no assets, no scenes beyond `loadScene` and the root `view`.

```ts
import { Engine } from "@falkura-pet/engine";
```

## Init sequence

Every game's entry file (`games/<name>/src/index.ts`) runs the same boot sequence:

```ts
Engine.initEvents();
Engine.initGSAP();
await Engine.initApplication();    // Application + LayoutManager + view + loadScene
await Engine.loadAssets();         // loads the manifest bundle, progress piped to loadScene
Engine.initGame(MyGame, config);   // instantiates GameBase, swaps loadScene → view
Engine.startGame();                // fires the start cascade
```

`initApplication()` accepts optional landscape/portrait sizes (defaults: `1920×1080` landscape, `1080×1920` portrait). `initGame()` removes `loadScene` from the stage and reveals `view` — games never manage scenes themselves.

## Lifecycle

Three public methods drive the running game. Each one cascades through `GameBase` → `SystemController` → every system, and emits an event:

| Method | Cascade | Event |
| --- | --- | --- |
| `Engine.startGame()` | `game.start()` → `systems.start()` → each `system.start()` | `engine:game-started` |
| `Engine.restartGame()` | `resetGame()` (fires `engine:game-reseted`) then `startGame()` | both events in order |
| `Engine.finishGame(data?)` | `game.finish(data)` → `systems.finish(data)` | `engine:game-finished` with `data` |

Window resizes cascade the same way: `Engine.onResize` → `layout.resize` → `game.resize` → `systems.resize` → each `system.resize`.

`GAME_STATE` (`Init | Started | Finished`) guards against redundant transitions. There is no paused state — if you need to freeze a game, set `this.ticker.speed = 0` or `systems.disable(SomeSystem)`.

**Trigger lifecycle through the Engine API**, not by calling `GameBase` methods directly. `Engine.restartGame()` / `Engine.finishGame(data)` keep `GAME_STATE` correct and fire the events that the ControlPanel, wrapper UI, and other listeners depend on.

## Public state

| Field | Type | Use |
| --- | --- | --- |
| `Engine.app` | `Application` | The raw PixiJS application. Use for renderer, stage, ticker access, or anything the engine wrapper doesn't expose. |
| `Engine.view` | `LayoutContainer` | Full-screen root container that hosts the active game. Systems add their own views under this. |
| `Engine.layout` | `LayoutManager` | Responsive layout driver — see [layout.md](./layout.md). |
| `Engine.events` | `EventEmitter<EngineEvents>` | Typed engine event bus — see [events.md](./events.md). |
| `Engine.state` | `GAME_STATE` | Current lifecycle phase. |
| `Engine.graphics` | `"Low" \| "Medium" \| "High"` | Graphics quality — drives renderer resolution and ticker FPS cap. **High**: 1× DPR, 120 FPS. **Medium**: 0.85× DPR, 60 FPS. **Low**: 0.5× DPR, 30 FPS. Applied on init and whenever `Engine.changeSettings({ graphics })` fires. |
| `Engine.gameConfig` | `IGameConfig` | The game's `game.json` contents, passed to the `GameBase` constructor. |

## Assets

Drop any asset into your game's `assets/` directory — images, spritesheets, JSON, audio, fonts. AssetPack builds a manifest and PixiJS `Assets` serves them at runtime via keys **relative to the `assets/` folder**:

```
games/<name>/assets/config.json         →  Assets.get("config.json")
games/<name>/assets/levels/level1.json  →  Assets.get("levels/level1.json")
games/<name>/assets/ui/logo.png         →  Assets.get("ui/logo.png")
```

Shortcut aliases (`levels/level1`, `level1.json`, `level1`) also work — the manifest includes them. Full details in [assets.md](./assets.md).

## Direct PixiJS access

`Engine.app` is the raw `pixi.js` `Application`. Use it when you need something the engine doesn't wrap — a custom renderer extension, direct stage manipulation, ticker priorities, etc. Most game code shouldn't need to reach past `this.view` and `this.timeline` on a system, but the escape hatch is there.

```ts
import { Engine } from "@falkura-pet/engine";
Engine.app.renderer.background.color = 0x000000;
Engine.app.stage.addChild(someDebugOverlay);
```

## Dev-only globals

When `__DEV__` is true, the engine exposes itself on `globalThis` for console debugging: `engine`, `game`, `gsap`, `layout`, `PIXI`, `app`, `__PIXI_APP__`. Great for poking around at runtime, off-limits in production code.
