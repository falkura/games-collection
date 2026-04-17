# Events

`Engine.events` is a single typed `EventEmitter<EngineEvents>` shared by the engine, the game, and the wrapper. The engine emits lifecycle events automatically — you can listen from any system, the ControlPanel, or wrapper UI.

```ts
import { Engine } from "@falkura-pet/engine";

Engine.events.on("engine:game-finished", (data) => {
  // show the win/lose overlay
});
```

## Event catalogue

| Event                     | Payload               | Emitted by                                                    |
| ------------------------- | --------------------- | ------------------------------------------------------------- |
| `engine:game-started`     | —                     | `Engine.startGame()` before `game.start()` cascade.           |
| `engine:game-finished`    | `data?: any`          | `Engine.finishGame(data)` after the cascade.                  |
| `engine:game-reseted`     | —                     | `Engine.resetGame()` (called internally by `restartGame`).    |
| `engine:settings-updated` | `Partial<UISettings>` | `Engine.changeSettings` — e.g. when graphics quality changes. |
| `engine:game-chosen`      | `gameKey: string`     | `Engine.chooseGame` — the wrapper's game picker.              |

Event types live in `packages/engine/src/types/EngineEvents.ts`.

## Firing engine events the right way

Drive lifecycle transitions **through the public engine API**, not by hand:

```ts
// Correct:
Engine.restartGame();
Engine.finishGame({ score, moves });

// Wrong — bypasses GAME_STATE and skips the event emit:
this.game.reset();
this.game.start();
this.game.finish(data);
```

Listeners everywhere — ControlPanel, wrapper overlays, analytics — rely on the events. Calling `GameBase` methods directly silently breaks them.

## Passing data to the finish event

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

## Cleaning up listeners

Listeners attached in `start()` fire again on every `Engine.restartGame()` — stack them naively and you'll wire duplicate handlers. Patterns that work:

1. **`built` flag** — subscribe once in `start()` guarded by a boolean; reset state in `reset()`.
2. **Unsubscribe in `reset()`** — pair every `Engine.events.on` with `Engine.events.off` using the same bound reference.

Pick one per system and be consistent.

## Custom events

For signals inside a single game, you can either:

- Add an `EventEmitter` to your `GameBase` subclass (scoped to that game only).
- Use a cross-system method call via `this.game.systems.get(OtherSystem).foo()`.
- Extend the engine's typed event map only if the signal is genuinely engine-wide — resist this for game-specific events.
