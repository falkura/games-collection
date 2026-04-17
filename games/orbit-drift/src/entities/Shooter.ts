import { Container, Graphics } from "pixi.js";

export class Shooter {
  readonly view: Graphics;
  readonly radius: number;
  private timer: number;

  constructor(
    readonly x: number,
    readonly y: number,
    readonly cooldown: number,
    readonly projectileSpeed: number,
    readonly gravity: boolean,
    parent: Container,
  ) {
    this.radius = gravity ? 16 : 14;
    this.timer = cooldown * 0.5;

    const color = gravity ? 0xffa94d : 0xb388ff;
    const inner = gravity ? 0xfff4b0 : 0xffffff;
    this.view = new Graphics()
      .circle(0, 0, this.radius)
      .fill({ color })
      .circle(0, 0, this.radius - 6)
      .fill({ color: inner });
    if (gravity) {
      this.view
        .circle(0, 0, this.radius + 4)
        .stroke({ color, width: 2, alpha: 0.5 })
        .circle(0, 0, this.radius + 10)
        .stroke({ color, width: 1, alpha: 0.3 });
    }
    this.view.x = x;
    this.view.y = y;
    this.view.zIndex = 2;
    parent.addChild(this.view);
  }

  /** Advance the cooldown timer. Returns true when it's time to fire. */
  tick(dt: number): boolean {
    this.timer -= dt;
    if (this.timer <= 0) {
      this.timer = this.cooldown;
      return true;
    }
    return false;
  }

  destroy() {
    this.view.destroy();
  }
}
