# Game Base

Abstract base class and system architecture for building games. Implements the [`GameInstance`](../engine/README.md) interface defined by the engine.

> Part of the [Games Collection](../../README.md) monorepo

## Usage example

```ts
// Custom system with game lifecycle
class MySystem extends System<MyGame> {
  static MODULE_ID = "game-feature";

  override start(): void;
  override tick(): void;
}

// Custom game instance
class MyGame extends GameBase {
  override init(): void {
    this.systems.add(MySystem);
  }
}
```

## Details

`GameBase` implements `GameInstance` and provides the full game lifecycle: `init`, `start`, `reset`, `finish`, and `resize`. Each game gets a PixiJS `Ticker`, a GSAP `Timeline`, a display `Container`, and a Tweakpane `ControlPanel`.

`System` is an abstract class with optional lifecycle hooks: `tick`, `start`, `finish`, `reset`, `resize`. Each system gets its own `view` (a PixiJS `Container` added to the game's display tree), a GSAP `timeline` (nested into the game timeline), and a typed reference to the parent game.

`SystemController` manages all systems. When a system is added, it is initialized with the game reference, its own view layer (z-ordered by registration order), and its timeline. Systems can be enabled and disabled at runtime — disabled systems are moved to an internal registry and removed from the display tree.

`ControlPanel` is a debug UI (Tweakpane) initialized automatically for every game. It shows FPS, a game speed slider, restart buttons, a graphics quality toggle, and a toggleable button per registered system.
