import { Container, Graphics } from "pixi.js";
import Matter from "matter-js";
import { PhysicsWorld } from "../physics/PhysicsWorld";

export class Ship {
  static RADIUS = 10;

  readonly view: Graphics;
  readonly body: Matter.Body;

  constructor(x: number, y: number, private world: PhysicsWorld, parent: Container) {
    this.view = new Graphics()
      .circle(0, 0, Ship.RADIUS)
      .fill({ color: 0xffffff })
      .circle(0, 0, Ship.RADIUS + 6)
      .stroke({ color: 0xffffff, width: 1, alpha: 0.35 });
    this.view.zIndex = 4;
    this.view.x = x;
    this.view.y = y;
    parent.addChild(this.view);

    this.body = Matter.Bodies.circle(x, y, Ship.RADIUS, {
      label: "ship",
      frictionAir: 0,
      friction: 0,
      restitution: 0,
      density: 0.001,
    });
    this.world.add(this.body);
  }

  get x() {
    return this.body.position.x;
  }

  get y() {
    return this.body.position.y;
  }

  setVelocity(vx: number, vy: number) {
    Matter.Body.setVelocity(this.body, { x: vx, y: vy });
  }

  applyAccel(ax: number, ay: number) {
    Matter.Body.applyForce(this.body, this.body.position, {
      x: ax * this.body.mass,
      y: ay * this.body.mass,
    });
  }

  clampSpeed(max: number) {
    const v = this.body.velocity;
    const s = Math.hypot(v.x, v.y);
    if (s > max) {
      Matter.Body.setVelocity(this.body, {
        x: (v.x / s) * max,
        y: (v.y / s) * max,
      });
    }
  }

  syncView() {
    this.view.x = this.x;
    this.view.y = this.y;
  }

  destroy() {
    this.world.remove(this.body);
    this.view.destroy();
  }
}
