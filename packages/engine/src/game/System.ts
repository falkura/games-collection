import { Container, Ticker } from "pixi.js";
import { GameController } from "./GameController";
import { SystemController } from "./SystemController";

/**
 * Abstract base for all game systems. Each system has its own display layer,
 * GSAP timeline, and lifecycle hooks. No methods are called when system disabled.
 *
 * Must declare `static MODULE_ID: string` for registration and lookup via `game.systems.get(MySystem)`.
 *
 * `game`, `view` and `timeline` are injected by {@link SystemController} on system creation.
 */
export abstract class System<T extends GameController = GameController> {
  /** Typed reference to the owning game. */
  public game: T;

  /** PixiJS container added to the game root, z-indexed by registration order. */
  public view: Container;

  /** GSAP timeline nested into the game master timeline. Cleared on reset. */
  public timeline: GSAPTimeline;

  /** Called once after all systems are registered. Build display objects here. */
  public build() {}

  /** Called when re-enabled after being disabled. */
  public mount() {}

  /** Called when disabled and removed from the display tree. */
  public unmount() {}

  /** Called on `Engine.startGame`. */
  public start() {}

  /** Called on `Engine.finishGame(data)`. */
  public finish(data?: any) {}

  /** Called on `Engine.resetGame`. Restore to pre-start state. */
  public reset() {}

  /** Called on every window resize. */
  public resize() {}

  /** Called every frame. Prefer GSAP for animations over per-frame logic here. */
  public tick(ticker: Ticker) {}
}
