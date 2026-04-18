import { Container, Graphics, Sprite } from "pixi.js";
import Matter from "matter-js";
import { PhysicsWorld } from "../physics/PhysicsWorld";
import { PHYSICS } from "../config";
import { bakeTexture } from "./textures";

export class Ship {
  static RADIUS = PHYSICS.SHIP_RADIUS;
  private static readonly ROTATION_EPSILON = 0.05;

  readonly view: Sprite;
  readonly body: Matter.Body;

  constructor(x: number, y: number, private world: PhysicsWorld, parent: Container) {
    const texture = bakeTexture(
      `ship:${Ship.RADIUS}`,
      () =>
        new Graphics()
          .circle(0, 0, Ship.RADIUS + 10)
          .fill({ color: "#9fd8ff", alpha: 0.08 })
          .circle(0, 0, Ship.RADIUS + 5)
          .stroke({ color: "#b8ecff", width: 1.5, alpha: 0.45 })
          .poly([
            -Ship.RADIUS - 1,
            Ship.RADIUS - 1,
            0,
            -Ship.RADIUS - 7,
            Ship.RADIUS + 1,
            Ship.RADIUS - 1,
          ])
          .fill({ color: "#dff6ff", alpha: 0.95 })
          .circle(0, 1, Ship.RADIUS - 4)
          .fill({ color: "#ffffff" })
          .circle(0, -1, Ship.RADIUS - 8)
          .fill({ color: "#7fdcff" })
          .poly([-5, Ship.RADIUS - 1, 0, Ship.RADIUS + 7, 5, Ship.RADIUS - 1])
          .fill({ color: "#4dc4ff", alpha: 0.8 }),
      Ship.RADIUS + 10,
    );

    this.view = new Sprite(texture);
    this.view.anchor.set(0.5);
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

  /**
   * Integrate gravity directly into velocity so one tick = `v += a`, matching
   * `simulateTrajectory`. `applyForce` would go through matter's Verlet step
   * and scale by `delta²`, desynchronizing the preview from actual motion.
   */
  applyAccel(ax: number, ay: number) {
    const v = this.body.velocity;
    Matter.Body.setVelocity(this.body, { x: v.x + ax, y: v.y + ay });
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

    const { x: vx, y: vy } = this.body.velocity;
    if (Math.hypot(vx, vy) > Ship.ROTATION_EPSILON) {
      this.view.rotation = Math.atan2(vy, vx) + Math.PI / 2;
    }
  }

  destroy() {
    this.world.remove(this.body);
    this.view.destroy();
  }
}
