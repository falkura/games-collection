import { Container, Graphics } from "pixi.js";
import Matter from "matter-js";
import { PhysicsWorld } from "../physics/PhysicsWorld";
import { gravityAt, type GravitySource } from "../physics/gravity";

export class Projectile {
  static RADIUS = 5;

  readonly view: Graphics;
  private body?: Matter.Body;
  private _x: number;
  private _y: number;
  private vx: number;
  private vy: number;
  private life: number;

  constructor(
    x: number,
    y: number,
    vx: number,
    vy: number,
    readonly gravity: boolean,
    private world: PhysicsWorld,
    parent: Container,
    lifeFrames: number,
  ) {
    this._x = x;
    this._y = y;
    this.vx = vx;
    this.vy = vy;
    this.life = lifeFrames;

    const color = gravity ? 0xffa94d : 0xff4d4d;
    this.view = new Graphics()
      .circle(0, 0, Projectile.RADIUS)
      .fill({ color })
      .circle(0, 0, 8)
      .stroke({ color, width: 1, alpha: 0.5 });
    this.view.x = x;
    this.view.y = y;
    this.view.zIndex = 2;
    parent.addChild(this.view);

    if (gravity) {
      this.body = Matter.Bodies.circle(x, y, Projectile.RADIUS, {
        label: "projectile",
        frictionAir: 0,
        friction: 0,
        density: 0.001,
      });
      Matter.Body.setVelocity(this.body, { x: vx, y: vy });
      this.world.add(this.body);
    }
  }

  get x() {
    return this._x;
  }
  get y() {
    return this._y;
  }

  update(dt: number, sources: GravitySource[]) {
    if (this.body) {
      const { ax, ay } = gravityAt(this.body.position.x, this.body.position.y, sources);
      Matter.Body.applyForce(this.body, this.body.position, {
        x: ax * this.body.mass,
        y: ay * this.body.mass,
      });
      this._x = this.body.position.x;
      this._y = this.body.position.y;
      this.vx = this.body.velocity.x;
      this.vy = this.body.velocity.y;
    } else {
      this._x += this.vx * dt;
      this._y += this.vy * dt;
    }
    this.life -= dt;
    this.view.x = this._x;
    this.view.y = this._y;
  }

  get isExpired(): boolean {
    return this.life <= 0;
  }

  destroy() {
    if (this.body) this.world.remove(this.body);
    this.view.destroy();
  }
}
