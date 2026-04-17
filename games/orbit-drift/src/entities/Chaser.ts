import { Container, Graphics } from "pixi.js";
import type { Vec } from "../types";

export class Chaser {
  static RADIUS = 12;

  readonly view: Graphics;
  x: number;
  y: number;

  constructor(x: number, y: number, readonly speed: number, parent: Container) {
    this.x = x;
    this.y = y;
    this.view = new Graphics()
      .circle(0, 0, Chaser.RADIUS)
      .fill({ color: 0xff4d4d })
      .circle(0, 0, Chaser.RADIUS + 4)
      .stroke({ color: 0xff4d4d, width: 1, alpha: 0.45 });
    this.view.x = x;
    this.view.y = y;
    this.view.zIndex = 2;
    parent.addChild(this.view);
  }

  update(dt: number, target: Vec) {
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const dist = Math.hypot(dx, dy);
    if (dist > 0.01) {
      this.x += (dx / dist) * this.speed * dt;
      this.y += (dy / dist) * this.speed * dt;
    }
    this.view.x = this.x;
    this.view.y = this.y;
  }

  hits(px: number, py: number, pr: number): boolean {
    const dx = this.x - px;
    const dy = this.y - py;
    return dx * dx + dy * dy < (Chaser.RADIUS + pr) ** 2;
  }

  destroy() {
    this.view.destroy();
  }
}
