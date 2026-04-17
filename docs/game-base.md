# GameBase & Systems

`GameBase` (from `@falkura-pet/game-base`) is the default implementation of the engine's `GameInstance` interface. Every game extends it. It wires up a PixiJS `Ticker`, a master GSAP `Timeline`, the root `view` (from `Engine.view`), a Tweakpane `Pane`, and a `SystemController` that hosts the game's systems.

```ts
import { GameBase } from "@falkura-pet/game-base";

export class MyGame extends GameBase {
  protected override init(): void {
    this.systems.add(MainSystem);
    this.systems.add(HUDSystem);
  }
}
```

That's the whole shape of a game class. **Actual gameplay lives in systems**, not in `MyGame` — the game class is just a registry and a place to mediate between systems when they need to talk.

## `GameBase` lifecycle hooks

The engine calls these through its cascade. Override with `override` so TypeScript catches typos.

| Hook | When | Default |
| --- | --- | --- |
| `init()` | Once, in the constructor. | Empty — override to register systems. |
| `start()` | On `Engine.startGame` and after reset on `restartGame`. | Starts ticker, plays timeline, starts all systems. |
| `finish(data?)` | On `Engine.finishGame(data)`. | Stops ticker, clears child timelines, finishes all systems. |
| `reset()` | On `Engine.restartGame`, before `start`. | Stops ticker, resets ControlPanel, re-enables disabled systems, resets all systems. |
| `resize()` | On window resize. | Delegates to `systems.resize()`. |

## `System` — where gameplay lives

A `System` is a self-contained module with its own view, timeline, and lifecycle hooks. Every system has a static `MODULE_ID` for registration and lookup.

```ts
import { System } from "@falkura-pet/game-base";
import { Engine } from "@falkura-pet/engine";
import { Graphics, Ticker } from "pixi.js";
import { MyGame } from "../MyGame";

export class BoardSystem extends System<MyGame> {
  static MODULE_ID = "board";

  private board!: Graphics;

  override start(): void {
    this.board = new Graphics().rect(0, 0, 400, 400).fill(0x333333);
    this.view.addChild(this.board);
  }

  override tick(ticker: Ticker): void {
    this.board.rotation += 0.01 * ticker.deltaTime;
  }

  override resize(): void {
    const { width, height } = Engine.layout.screen;
    this.board.position.set(width / 2 - 200, height / 2 - 200);
  }
}
```

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

For end-of-round or completion logic that should not trigger the global `finish` cascade, pick a different name (`complete`, `win`, `gameOver`, …). Always use `override`.

## Cross-system communication

Reach another system through the game as a mediator:

```ts
// Inside a system:
this.game.systems.get(ScoreSystem).addPoint();

// Inside the game class:
this.systems.get(ScoreSystem).reset();
```

Prefer **systems talk to the game, the game talks to other systems**. Direct system-to-system coupling gets tangled quickly; routing through the game class keeps the dependency graph a star instead of a mesh.

You can also broadcast over `Engine.events` (see [events.md](./events.md)) when multiple listeners care about the same signal (e.g. an `engine:game-finished` overlay that every system can react to).

## Enabling / disabling systems

`systems.disable(Ctor | MODULE_ID)` removes a system's view from the stage and parks it in a disabled registry — its hooks stop firing. `systems.enable(...)` reverses that. `reset()` re-enables everything before cascading. Disable toggles also appear as buttons in the ControlPanel in dev builds.

Use this for pause-like effects, debug toggles, or systems that only run in certain game modes.

## ControlPanel

Every game auto-mounts a Tweakpane debug UI: FPS, game-speed slider, restart button, graphics-quality toggle, and one enable/disable button per registered system. Available in dev builds. Nothing to wire up — just register your systems.

## When a system grows — decompose it

Once a `System` file passes ~200 lines or grows more than one reason to change, split it. A system should orchestrate; real behavior belongs in plain classes it owns. Signs it's time:

- entity types (enemies, projectiles, pickups) each with their own view + update + hit-test, inlined as structs and scattered lambdas,
- physics / generation / I/O logic interleaved with the tick loop,
- long `reset()` with one destroy line per entity type,
- trajectory or pure math that's awkward to unit-test because it reaches for `this`.

Pull those concerns into sibling folders next to `core/`:

```
games/<name>/src/
  core/
    SpaceSystem.ts        — orchestration only: arrays + tick order
    InputSystem.ts
    HUDSystem.ts
  entities/
    Ship.ts               — view + body + setVelocity/syncView/destroy
    Planet.ts
    Orb.ts
    Wall.ts
    Chaser.ts
    Shooter.ts
    Projectile.ts
  physics/
    PhysicsWorld.ts       — matter engine wrapper, collision events
    gravity.ts            — pure gravityAt() + simulateTrajectory()
  level/
    LevelGenerator.ts     — pure function: (level, bounds) → LevelData
  progress.ts             — localStorage wrapper
  types.ts                — shared types (FinishData, reasons, constants)
```

Guidelines that keep this clean:

- **Entity classes own their view and body.** `new Ship(x, y, world, parent)` attaches to the stage; `ship.destroy()` removes both view and body. The system's `reset()` becomes a loop of `destroy()` calls, not a pile of per-type cleanup.
- **Pure functions for physics and generation.** `gravityAt(px, py, sources)` and `generateLevel(opts)` take plain data in and return plain data out. They're trivial to reuse in trajectory previews, tests, or offline tooling.
- **Physics wrappers, not physics leakage.** Wrap the physics engine (`matter-js`, `p2`, etc.) behind a `PhysicsWorld` class. Entities take it in the constructor and call a handful of methods on it — they don't `import Matter from "matter-js"` themselves unless they genuinely need to touch bodies.
- **The system is the orchestrator.** It holds entity arrays, calls `entity.update(dt)` in the right order, checks game-over conditions, and fires `Engine.finishGame()`. No draw code, no physics math, no entity-specific branching.
- **Data flows `level → entities → system`**, not the other way. Generators return specs (plain objects); the system spawns entities from specs. Never generate inside an entity constructor — it couples placement to spawning and breaks level-data reuse.
- **Shared constants live in `types.ts`**, shared math in `physics/` or a `util/` folder. If two entities need the same number, it lives in one of those — not duplicated across their files.

## Mental model

1. The game class is a **registry**.
2. Systems are **modules** — view + timeline + hooks.
3. Cross-system coordination is **mediated by the game**.
4. Triggering a restart or end-of-round is done through **`Engine.restartGame()` / `Engine.finishGame(data)`**, never by calling `GameBase` methods directly.
5. When a system grows, **split by concern** (entities, physics, generation) and keep the system as the orchestrator.
