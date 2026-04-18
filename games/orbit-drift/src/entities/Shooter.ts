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
    this.radius = gravity ? 18 : 16;
    this.timer = cooldown * 0.5;

    const color = gravity ? "#ffa94d" : "#b388ff";
    const inner = gravity ? "#fff4b0" : "#f7f0ff";
    this.view = new Graphics()
      .circle(0, 0, this.radius + 8)
      .fill({ color, alpha: 0.08 })
      .circle(0, 0, this.radius + 3)
      .stroke({ color, width: 2, alpha: 0.4 })
      .circle(0, 0, this.radius)
      .fill({ color })
      .circle(0, 0, this.radius - 5)
      .fill({ color: inner })
      .circle(0, 0, this.radius - 10)
      .fill({ color, alpha: 0.85 });
    if (gravity) {
      this.view
        .circle(0, 0, this.radius + 4)
        .stroke({ color, width: 2, alpha: 0.5 })
        .circle(0, 0, this.radius + 10)
        .stroke({ color, width: 1, alpha: 0.3 });
    } else {
      this.view
        .moveTo(-this.radius - 3, 0)
        .lineTo(this.radius + 3, 0)
        .moveTo(0, -this.radius - 3)
        .lineTo(0, this.radius + 3)
        .stroke({ color: "#e7d9ff", width: 1, alpha: 0.35 });
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
