import { Container, Graphics, Sprite } from "pixi.js";
import type { Vec } from "../types";
import { bakeTexture } from "./textures";

export class Chaser {
  static RADIUS = 14;

  readonly view: Sprite;
  x: number;
  y: number;

  constructor(x: number, y: number, readonly speed: number, parent: Container) {
    this.x = x;
    this.y = y;
    const texture = bakeTexture(
      `chaser:${Chaser.RADIUS}`,
      () =>
        new Graphics()
          .circle(0, 0, Chaser.RADIUS + 8)
          .fill({ color: "#ff4d4d", alpha: 0.08 })
          .circle(0, 0, Chaser.RADIUS + 4)
          .stroke({ color: "#ff8080", width: 1.5, alpha: 0.35 })
          .poly([
            0,
            -Chaser.RADIUS - 2,
            Chaser.RADIUS + 1,
            -1,
            0,
            Chaser.RADIUS + 2,
            -Chaser.RADIUS - 1,
            -1,
          ])
          .fill({ color: "#ff5d5d" })
          .circle(0, 0, Chaser.RADIUS - 5)
          .fill({ color: "#5c0d0d", alpha: 0.45 })
          .circle(-3, -2, 2.2)
          .fill({ color: "#ffffff", alpha: 0.9 })
          .circle(3, -2, 2.2)
          .fill({ color: "#ffffff", alpha: 0.9 }),
      Chaser.RADIUS + 8,
    );

    this.view = new Sprite(texture);
    this.view.anchor.set(0.5);
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
