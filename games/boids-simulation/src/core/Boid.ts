import { Graphics, Point } from "pixi.js";

export class Boid extends Point {
  graphics: Graphics;
  velocity: Point;
  acceleration: Point;

  constructor(x: number, y: number) {
    super(x, y);

    this.velocity = new Point(
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2,
    );

    this.acceleration = new Point();

    this.graphics = new Graphics()
      .moveTo(-6, -6)
      .lineTo(6, 0)
      .lineTo(-6, 6)
      .closePath()
      .fill("#ffffff");

    this.graphics.position.copyFrom(this);
  }

  update(dt: number) {
    this.velocity.x += this.acceleration.x * dt;
    this.velocity.y += this.acceleration.y * dt;

    this.x += this.velocity.x * dt;
    this.y += this.velocity.y * dt;

    this.acceleration.set(0, 0);

    this.graphics.position.copyFrom(this);
    this.graphics.rotation = Math.atan2(this.velocity.y, this.velocity.x);
  }
}
