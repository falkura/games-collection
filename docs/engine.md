# Engine

`Engine` is a singleton exported from `@falkura-pet/engine` — the monorepo package in `packages/engine/`. It owns the PixiJS `Application`, the layout system, a single typed event bus, the load scene, and the running game's lifecycle state. It is game-agnostic: no gameplay, no assets, no scenes beyond `loadScene` and the root `view`.

```ts
import { Engine } from "@falkura-pet/engine";
```

## Init sequence

Every game's entry file (`games/<name>/src/index.ts`) runs the same boot sequence.

## Lifecycle

Three public methods drive the running game. Each one cascades through `GameBase` → `SystemController` → every system, and emits an event:

| Method | Cascade | Event |
| --- | --- | --- |
| `Engine.startGame()` | `game.start()` → `systems.start()` → each `system.start()` | `engine:game-started` |
| `Engine.restartGame()` | `resetGame()` (fires `engine:game-reseted`) then `startGame()` | both events in order |
| `Engine.finishGame(data?)` | `game.finish(data)` → `systems.finish(data)` | `engine:game-finished` with `data` |

Window resizes cascade the same way: `Engine.onResize` → `layout.resize` → `game.resize` → `systems.resize` → each `system.resize`.

**Trigger lifecycle through the Engine API**, not by calling `GameBase` methods directly.

## Public state

| Field | Type | Use |
| --- | --- | --- |
| `Engine.app` | `Application` | The raw PixiJS application. Use for renderer, stage, ticker access, or anything the engine wrapper doesn't expose. |
| `Engine.view` | `LayoutContainer` | Full-screen root container that hosts the active game. Systems add their own views under this. |
| `Engine.layout` | `LayoutManager` | Responsive layout driver — see [layout.md](./layout.md). |
| `Engine.events` | `EventEmitter<EngineEvents>` | Typed engine event bus — see [events.md](./events.md). |
| `Engine.gameConfig` | `IGameConfig` | The game's `game.json` contents, passed to the `GameBase` constructor. |

## Direct PixiJS access

`Engine.app` is the raw `pixi.js` `Application`. Use it when you need something the engine doesn't wrap. Most game code shouldn't need to reach past `this.view` and `this.timeline` on a system, but the escape hatch is there.

## Dev-only globals

Variable `__DEV__` is true only for develop