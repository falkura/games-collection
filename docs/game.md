# Create Game with GameBase & Engine

## Mental model

1. The game class (that extends `GameBase`) is a registry, cross-system coordination and Tweakpane configurator.
2. Systems are **game modules** — view and/or game logic + lifecycle hooks.
3. Engine is lifecycle orchestrator, assets and game loader.
4. Triggering a restart or end-of-round is done through **`Engine.restartGame()` / `Engine.finishGame(data?)`**.

## Engine

`Engine` is a singleton exported from `@falkura-pet/engine` — the monorepo package in `packages/engine/`. It owns the PixiJS `Application`, the layout system, a single typed event bus, the load scene, and the running game's lifecycle state. It is game-agnostic: no gameplay, no assets, no scenes beyond `loadScene` and the root `view`.

```ts
import { Engine } from "@falkura-pet/engine";
```

### Lifecycle

Three public methods drive the running game. Each one cascades through `GameBase` → `SystemController` → every system, and emits an event:

- `Engine.startGame()` -> `game.start()` + emit(`engine:game-started`) -> `systems.start()` -> each `system.start()`
- `Engine.restartGame()` -> `game.reset()` + emit(`engine:game-reseted`) -> `systems.reset()` -> each `system.reset()` then `Engine.startGame()`
- `Engine.finishGame(data?)` -> `game.finish(data)` + emit(`engine:game-finished`, `data`) -> `systems.finish(data)` -> each `system.finish(data)`

Window resizes cascade the same way: `Engine.onResize` → `layout.resize` → `game.resize` → `systems.resize` → each `system.resize`.

**Trigger lifecycle through the Engine API**, not by calling `GameBase` methods directly.

### Public state

| Field               | Type                         | Use                                                |
| ------------------- | ---------------------------- | -------------------------------------------------- |
| `Engine.app`        | `Application`                | The raw PixiJS application.                        |
| `Engine.view`       | `LayoutContainer`            | Root container; systems are added under this.      |
| `Engine.layout`     | `LayoutManager`              | Responsive layout driver [layout.md](./layout.md). |
| `Engine.events`     | `EventEmitter<EngineEvents>` | Typed engine event bus                             |
| `Engine.gameConfig` | `IGameConfig`                | The game's `game.json` contents,                   |

## GameBase & Systems

`GameBase` (from `@falkura-pet/game-base`) is the default implementation of the engine's `GameInstance` interface. Every game extends it. It wires up a PixiJS `Ticker`, a master GSAP `Timeline`, the root `view` (from `Engine.view`), a Tweakpane `Pane`, and a `SystemController` that hosts the game's systems.

### GameBase

All gameplay lives in **systems** — subclasses of `System` under `games/<name>/src/core/`. For a small game, put all the logic in `MainSystem.ts`. For a larger one, split by concern (`BoardSystem`, `InputSystem`, etc.) and register each in your game class:

```ts
// games/<name>/src/<GameName>.ts
import { GameBase } from "@falkura-pet/game-base";
import { BoardSystem } from "./core/BoardSystem";
import { InputSystem } from "./core/InputSystem";

export class MyGame extends GameBase {
  protected override init(): void {
    this.systems.add(BoardSystem);
    this.systems.add(InputSystem);
  }
}
```

#### `GameBase` lifecycle hooks

The engine calls these through its cascade. Override with `override` so TypeScript catches typos.

| Hook            | When                                                    | Default                                                                             |
| --------------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `init()`        | Once, in the constructor.                               | Add systems systems.                                                                |
| `start()`       | On `Engine.startGame` and after reset on `restartGame`. | Starts ticker, plays timeline, starts all systems.                                  |
| `finish(data?)` | On `Engine.finishGame(data)`.                           | Stops ticker, clears child timelines, finishes all systems.                         |
| `reset()`       | On `Engine.restartGame`, before `start`.                | Stops ticker, resets ControlPanel, re-enables disabled systems, resets all systems. |
| `resize()`      | On window resize.                                       | Delegates to `systems.resize()`.                                                    |

### `System` — where gameplay and visual lives

A `System` is a self-contained module with its own view, timeline, and lifecycle hooks. Every system has a static `MODULE_ID` for registration and lookup.

#### Auto-provisioned fields

When `SystemController` adds a system, it injects:

| Field      | Type                 | Notes                                                                                                                                       |
| ---------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `game`     | `T extends GameBase` | Typed reference to the owning game. Use `this.game.systems.get(OtherSystem)` to reach other systems.                                        |
| `view`     | `LayoutContainer`    | Full-screen (`sw × sh`) container already added to `this.game.view`, z-indexed by registration order. Add your display objects as children. |
| `timeline` | `GSAPTimeline`       | A nested GSAP timeline. Tween against it — the game plays/clears it automatically.                                                          |
| `enabled`  | `boolean`            | Flipped by `systems.enable/disable`. Disabled systems skip ticks and lifecycle hooks.                                                       |

#### Lifecycle hooks — reserved names

The `SystemController` calls these hooks by name. **Do not declare methods with these names unless you mean to override the hook** — even `private` shadowing silently breaks the lifecycle.

- `start()`
- `finish(data?)`
- `reset()`
- `resize()`
- `tick(ticker)` — every frame

#### Enabling / disabling systems

`systems.disable(Ctor | MODULE_ID)` removes a system's view from the stage and parks it in a disabled registry — its hooks stop firing. `systems.enable(...)` reverses that. `reset()` re-enables everything before cascading.

#### When a system grows — decompose it

Once a `System` file passes ~300 lines or grows more than one reason to change, split it. A system should orchestrate; real behavior belongs in plain classes it owns.

Pull those concerns into sibling folders next to `core/`.

Guidelines that keep this clean:

- **Entity classes own their view and body.** `new Ship(x, y, world, parent)` attaches to the stage; `ship.destroy()` removes both view and body. The system's `reset()` becomes a loop of `destroy()` calls, not a pile of per-type cleanup.
- **The system is the orchestrator.** It holds entity arrays, calls `entity.update(dt)` in the right order, checks game-over conditions, and fires `Engine.finishGame()`. No draw code, no physics math, no entity-specific branching.

## Game implementation

- Every game's entry file (`games/<name>/src/index.ts`) runs the same boot sequence.
- Prefer **systems talk to the game, the game talks to other systems**.
- When specifying colors in game code, use **hex string representation** - `"#ffffff"`.

### Passing data through the systems

```ts
// In a gameplay system:
this.game.puzzleSolved({score: 80});

// In the game
onSolved(data) {
  const hud = this.systems.get(OverlaySystem);
  this.systems.enable(OverlaySystem);
  hud.puzzleSolved(data);
}

// In the OverlaySystem:
puzzleSolved({score}) {
  this.showWin(score);
}
```

### Good practice

Each game needs intro page, most needs overlay/HUD. You can use `games/connect-dots/` systems for examples of it.

## Game Assets

Each game has its own `assets/` folder. Anything you drop into `assets/` ends up in the built bundle. All assets loads automatically by engine.

### Accessing at runtime

`Engine.loadAssets()` loads the manifest bundle during the boot sequence, so by the time `initGame()` runs everything is cached. Keys are paths relative to the `assets/` folder. Read with PixiJS `Assets.get(key)`. Type-cast with a generic on `Assets.get<T>` to get autocompletion:

```
games/<name>/assets/
  game.json              // autogenerated
  icon.png               // autogenerated
  sprites/player.png
```

```ts
import { Assets } from "pixi.js";
const playerTexture = Assets.get("sprites/player.png");
```

## Events

`Engine.events` is a single typed `EventEmitter<EngineEvents>` shared by the engine, the game, and the wrapper. The engine emits lifecycle events automatically — you can listen from any system, the ControlPanel, or wrapper UI.

```ts
import { Engine } from "@falkura-pet/engine";

Engine.events.on("engine:game-finished", (data) => {
  // show the win/lose overlay
});
```

### Event catalogue

| Event                  | Payload      | Emitted by                                                 |
| ---------------------- | ------------ | ---------------------------------------------------------- |
| `engine:game-started`  | —            | `Engine.startGame()` before `game.start()` cascade.        |
| `engine:game-finished` | `data?: any` | `Engine.finishGame(data)` after the cascade.               |
| `engine:game-reseted`  | —            | `Engine.resetGame()` (called internally by `restartGame`). |

### Firing engine events the right way

Drive lifecycle transitions **through the public engine API**, not by hand:

```ts
Engine.restartGame();
Engine.finishGame({ score, moves });
```

Listeners everywhere rely on the events.

### Passing data to the finish event

`Engine.finishGame(data)` forwards `data` on the event. A typical win/lose flow:

```ts
// In a gameplay system:
Engine.finishGame({ won: true, score: this.score, level: this.level });

// In the HUD system:
Engine.events.on("engine:game-finished", (data) => {
  if (data.won) this.showWinOverlay(data);
  else this.showLoseOverlay(data);
});
```

### Cleaning up listeners

Listeners attached in `start()` fire again on every `Engine.restartGame()` — stack them naively and you'll wire duplicate handlers. Patterns that work: **`built` flag** — subscribe once in `start()` guarded by a boolean; reset state in `reset()`.

## Layout

The layout system is a custom responsive layer on top of PixiJS — **not** `@pixi/layout`. Source lives in `packages/engine/src/layout/`. Two pieces do the work: `LayoutManager` (singleton on `Engine.layout`) and `LayoutContainer` (a `Container` subclass you place in the scene graph).

Games are authored in **virtual pixels**. You declare sizes and positions in expressions like `"sw/2"` or `"sh-100"`, and the layout system re-evaluates them on every resize and orientation flip.

### `LayoutContainer`

A `Container` subclass that accepts a **layout config** and re-evaluates it on resize and on being added to the stage. You build your whole UI out of these.

### Config keys

| Key        | Type                          | Notes                                                           |
| ---------- | ----------------------------- | --------------------------------------------------------------- |
| `x`, `y`   | `string \| number`            | Evaluated as an expression (see below) against the layout vars. |
| `width`    | `string \| number`            | Evaluated; also written to `view` if one is attached.           |
| `height`   | `string \| number`            | Same as `width`.                                                |
| `zIndex`   | `number`                      | Standard PixiJS zIndex — parent has `sortableChildren = true`.  |
| `view`     | `Container`                   | Optional inner child. `width`/`height` are forwarded to it.     |
| `onResize` | `({ manager, vars }) => void` | Custom callback, runs after built-in handlers.                  |
| `portrait` | `Partial<LayoutConfig>`       | Overrides applied when `LayoutManager.isPortrait` is true.      |

### Layout expressions

Strings are evaluated as math expressions with these variables:

| Var    | Meaning                                                       |
| ------ | ------------------------------------------------------------- |
| `sw`   | Screen width (virtual).                                       |
| `sh`   | Screen height (virtual).                                      |
| `smax` | `Math.max(sw, sh)`.                                           |
| `gx`   | Game rect X (game offset inside screen on the over-fit axis). |
| `gy`   | Game rect Y.                                                  |
| `gw`   | Game rect width.                                              |
| `gh`   | Game rect height.                                             |

Anything valid in a JS math expression works: `"sw/2"`, `"sh - 100"`, `"gx + gw"`, `"smax * 0.8"`, `"(sw - 800) / 2"`. Numeric literals (`200`) pass through unchanged.

### Where this fits

- `Engine.view` — the root `LayoutContainer` (`sw × sh`) that hosts the active game.
- Every `System` gets its own full-screen `LayoutContainer` at `this.view`, z-indexed by registration order.
- Add your display objects as children of `this.view` inside each system.
- For a child that should respond to orientation changes or layout vars, make it a `LayoutContainer` too.

### Screen vs game rect — which do I use?

- **`screen`** covers the full viewport. Use it for full-bleed backgrounds, edge-anchored HUDs, and anything that should reach the actual window bounds.
- **`game`** is your declared virtual play area. Use it for gameplay content that must stay inside the design-intent rect regardless of aspect ratio. Content outside the game rect is visible on over-fit axes (letterboxing in reverse) — great for decorative HUD, bad for anything critical.

### Choosing a gameplay viewport

Pick one of these patterns per system and stick to it.

### 1. Full-screen (`sw × sh`)

Default — `this.view` is already `sw × sh`. Use when gameplay is aspect-agnostic: procedural spaces, full-bleed HUDs, backgrounds that should reach the real edges.

```ts
const { width, height } = Engine.layout.screen;
// place stuff with `width`/`height`
```

### 2. Square viewport (`smin × smin`)

Use when gameplay is **square or orientation-agnostic** — grids, puzzles, arenas. One container, same shape in both orientations, no per-orientation branching:

```ts
const stage = new LayoutContainer({
  x: "sw/2 - smin/2",
  y: "sh/2 - smin/2",
  width: "smin",
  height: "smin",
});
this.view.addChild(stage);
// Work in 0..smin local coords inside stage — it stays centered and square.
```

With the default engine config (`1920×1080` landscape / `1080×1920` portrait), `smin = 1080` in either orientation. Building gameplay against a fixed `1080×1080` reference and dropping it into this container eliminates the orientation branch for the gameplay area. HUD and background live outside the square at `sw × sh`.

### 3. Game rect (`gw × gh` = `1920×1080`)

Use when the layout is **authored for a specific aspect ratio** and breaks if stretched. Work in `Engine.layout.game` coords; the layout scales the rect to fit and letterboxes on over-fit axes. Good for cutscenes, fixed-camera 16:9 games; bad for puzzles where you want the HUD to reach the screen edges.

### Tips

- **Prefer `LayoutContainer` over `System.resize()` math** when the thing you're positioning doesn't need per-frame logic. Layout expressions are cheaper to read and maintain.
- **Use `onResize` on a `LayoutContainer`** for one-offs like changing a `Text` fontSize by orientation — keeps the state out of a full `System.resize()` override.
- **Never hardcode `1920` / `1080`** in gameplay code. Derive bounds from `Engine.layout.screen`, `Engine.layout.game`, or your local container's `width/height`. Hardcoded numbers break the moment the virtual size changes.
- **Full-bleed backgrounds use `screen.width/height`**, not `game.*`, so they reach the real edges on over-fit axes.

### Examples

```ts
import { LayoutContainer, Engine } from "@falkura-pet/engine";
import { Graphics } from "pixi.js";

class MySystem extends System<MyGame> {
  private build() {
    // Multiple different texts can be packed into HTMLText
    this.text = new HTMLText({
      text:
        "<t1>BOIDS SIMULATION</t1><br><br>" + "<t2>TAP ANYWHERE TO START</t2>",
      resolution: Engine.textResolution, // this line is required for correct representation of text
      anchor: 0.5,
    });

    this.view.addChildWithLayout(this.text, {
      x: 30, // 30 px from left
      y: "sh - 80", // 80 px frpm screen bottom
      width: "sw - 60",
      height: 60,
      portrait: {
        y: "sh - 120",
        height: 100,
      },
      zIndex: 2,
      onResize({ manager, view }) {
        view.style.fontSize = manager.isMobile ? 46 : 32;
        view.style.tagStyles = {
          t1: {
            fill: C.title,
            fontWeight: "bold",
            fontSize: manager.isMobile ? 100 : 74,
          },
          t2: {
            fontSize: manager.isMobile ? 46 : 32,
            fill: C.accent,
            fontWeight: "bold",
          },
        };
      },
    });
  }
}
```

There's no flexbox — compose rows with explicit math.

```ts
const makeButton = (label: string, index: number, total: number) => {
  const w = 180,
    gap = 20;
  const rowWidth = total * w + (total - 1) * gap;
  return new LayoutContainer({
    x: `sw/2 - ${rowWidth / 2} + ${index * (w + gap)}`,
    y: "sh - 100",
    width: w,
    height: 60,
    portrait: { y: `sh - ${100 + index * 80}` }, // stack vertically in portrait
  });
};
```

### Gotchas

- **Don't nest huge expressions** — prefer doing the math in `onResize` for anything complex. Expressions are parsed each resize.
- **Child `Container`s aren't re-evaluated** — only `LayoutContainer`s are. Raw `Container`/`Graphics` children stay at whatever coordinates you gave them; update them in `System.resize()`.
- **Portrait config is a partial overlay** — you don't need to repeat unchanged keys.
