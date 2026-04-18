import { Container, Graphics } from "pixi.js";
import Matter from "matter-js";
import { PhysicsWorld } from "../physics/PhysicsWorld";
import type { GravitySource } from "../physics/gravity";

export class Planet implements GravitySource {
  readonly view: Graphics;
  readonly body: Matter.Body;

  constructor(
    readonly x: number,
    readonly y: number,
    readonly mass: number,
    readonly radius: number,
    readonly color: number,
    private world: PhysicsWorld,
    parent: Container,
  ) {
    this.view = new Graphics();
    this.view.zIndex = 0;
    Planet.drawGravityRings(this.view, radius, mass, color);
    this.view.x = x;
    this.view.y = y;
    parent.addChild(this.view);

    this.body = Matter.Bodies.circle(x, y, radius, {
      isStatic: true,
      label: "planet",
    });
    this.world.add(this.body);
  }

  hits(px: number, py: number, pr: number): boolean {
    const dx = this.x - px;
    const dy = this.y - py;
    return dx * dx + dy * dy < (this.radius + pr) ** 2;
  }

  destroy() {
    this.world.remove(this.body);
    this.view.destroy();
  }

  private static drawGravityRings(
    g: Graphics,
    radius: number,
    mass: number,
    color: number,
  ) {
    const rings = 6;
    const maxR = radius + Math.sqrt(mass) * 1.45;
    for (let i = rings; i >= 1; i--) {
      const t = i / rings;
      const r = radius + (maxR - radius) * t;
      const alpha = (1 - t) * 0.18;
      g.circle(0, 0, r).fill({ color, alpha });
    }
    g.circle(0, 0, radius + 6).fill({ color, alpha: 0.12 });
    g.circle(0, 0, radius).fill({ color });
    g.circle(-radius * 0.22, -radius * 0.28, radius * 0.62).fill({
      color: 0xffffff,
      alpha: 0.13,
    });
    g.circle(radius * 0.18, radius * 0.2, radius * 0.4).fill({
      color: 0x000000,
      alpha: 0.08,
    });
    g.circle(0, 0, radius).stroke({ color: 0xffffff, width: 1.5, alpha: 0.45 });
  }
}
