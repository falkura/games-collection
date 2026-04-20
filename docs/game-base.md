# GameBase & Systems

`GameBase` (from `@falkura-pet/game-base`) is the default implementation of the engine's `GameInstance` interface. Every game extends it. It wires up a PixiJS `Ticker`, a master GSAP `Timeline`, the root `view` (from `Engine.view`), a Tweakpane `Pane`, and a `SystemController` that hosts the game's systems.

## `GameBase` lifecycle hooks

The engine calls these through its cascade. Override with `override` so TypeScript catches typos.

| Hook | When | Default |
| --- | --- | --- |
| `init()` | Once, in the constructor. | Empty — override to register systems. |
| `start()` | On `Engine.startGame` and after reset on `restartGame`. | Starts ticker, plays timeline, starts all systems. |
| `finish(data?)` | On `Engine.finishGame(data)`. | Stops ticker, clears child timelines, finishes all systems. |
| `reset()` | On `Engine.restartGame`, before `start`. | Stops ticker, resets ControlPanel, re-enables disabled systems, resets all systems. |
| `resize()` | On window resize. | Delegates to `systems.resize()`. |

## `System` — where gameplay and visual lives

A `System` is a self-contained module with its own view, timeline, and lifecycle hooks. Every system has a static `MODULE_ID` for registration and lookup.

### Auto-provisioned fields

When `SystemController` adds a system, it injects:

| Field | Type | Notes |
| --- | --- | --- |
| `game` | `T extends GameBase` | Typed reference to the owning game. Use `this.game.systems.get(OtherSystem)` to reach other systems. |
| `view` | `LayoutContainer` | Full-screen (`sw × sh`) container already added to `this.game.view`, z-indexed by registration order. Add your display objects as children. |
| `timeline` | `GSAPTimeline` | A nested GSAP timeline. Tween against it — the game plays/clears it automatically. |
| `enabled` | `boolean` | Flipped by `systems.enable/disable`. Disabled systems skip ticks and lifecycle hooks. |

### Lifecycle hooks — reserved names

The `SystemController` calls these hooks by name. **Do not declare methods with these names unless you mean to override the hook** — even `private` shadowing silently breaks the lifecycle.

- `start()`
- `finish(data?)`
- `reset()`
- `resize()`
- `tick(ticker)` — every frame

## Cross-system communication

Prefer **systems talk to the game, the game talks to other systems**.

## Enabling / disabling systems

`systems.disable(Ctor | MODULE_ID)` removes a system's view from the stage and parks it in a disabled registry — its hooks stop firing. `systems.enable(...)` reverses that. `reset()` re-enables everything before cascading.

## When a system grows — decompose it

Once a `System` file passes ~300 lines or grows more than one reason to change, split it. A system should orchestrate; real behavior belongs in plain classes it owns.

Pull those concerns into sibling folders next to `core/`.

Guidelines that keep this clean:

- **Entity classes own their view and body.** `new Ship(x, y, world, parent)` attaches to the stage; `ship.destroy()` removes both view and body. The system's `reset()` becomes a loop of `destroy()` calls, not a pile of per-type cleanup.
- **The system is the orchestrator.** It holds entity arrays, calls `entity.update(dt)` in the right order, checks game-over conditions, and fires `Engine.finishGame()`. No draw code, no physics math, no entity-specific branching.

## Mental model

1. The game class is a registry and cross-system coordination.
2. Systems are **modules** — view + timeline + hooks.
3. Triggering a restart or end-of-round is done through **`Engine.restartGame()` / `Engine.finishGame(data)`**.
4. When a system grows, **split by concern** (entities, physics, generation) and keep the system as the orchestrator.
