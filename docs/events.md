# Events

`Engine.events` is a single typed `EventEmitter<EngineEvents>` shared by the engine, the game, and the wrapper. The engine emits lifecycle events automatically — you can listen from any system, the ControlPanel, or wrapper UI.

```ts
import { Engine } from "@falkura-pet/engine";

Engine.events.on("engine:game-finished", (data) => {
  // show the win/lose overlay
});
```

## Event catalogue

| Event                  | Payload      | Emitted by                                                 |
| ---------------------- | ------------ | ---------------------------------------------------------- |
| `engine:game-started`  | —            | `Engine.startGame()` before `game.start()` cascade.        |
| `engine:game-finished` | `data?: any` | `Engine.finishGame(data)` after the cascade.               |
| `engine:game-reseted`  | —            | `Engine.resetGame()` (called internally by `restartGame`). |

## Firing engine events the right way

Drive lifecycle transitions **through the public engine API**, not by hand:

```ts
// Correct:
Engine.restartGame();
Engine.finishGame({ score, moves });
```

Listeners everywhere rely on the events.

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

Listeners attached in `start()` fire again on every `Engine.restartGame()` — stack them naively and you'll wire duplicate handlers. Patterns that work: **`built` flag** — subscribe once in `start()` guarded by a boolean; reset state in `reset()`.

Pick one per system and be consistent.
