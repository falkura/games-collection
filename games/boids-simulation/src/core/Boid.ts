import { Graphics, Point } from "pixi.js";

export class Boid extends Point {
  graphics: Graphics;
  velocity: Point;
  acceleration: Point;

  constructor(x: number, y: number) {
    super(x, y);

    this.acceleration = new Point(0, 0);
    this.velocity = new Point(
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2,
    );
    this.graphics = this.draw();
    this.graphics.position.copyFrom(this);
  }

  draw() {
    const graphics = new Graphics()
      .moveTo(-6, -6)
      .lineTo(6, 0)
      .lineTo(-6, 6)
      .closePath()
      .fill("#ffffff");

    return graphics;
  }

  update() {
    // apply acceleration
    this.velocity.add(this.acceleration, this.velocity);

    // reset acceleration
    this.acceleration.set(0);

    // apply velocity to move
    this.add(this.velocity, this);

    this.graphics.position.copyFrom(this);
    this.graphics.rotation = Math.atan2(this.velocity.y, this.velocity.x);
  }
}
