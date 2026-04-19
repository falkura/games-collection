import { Graphics, Point } from "pixi.js";

export class Boid extends Point {
  graphics: Graphics;
  velocity: Point;
  acceleration: Point;

  constructor(x: number, y: number) {
    super(x, y);

    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * 2;
    this.velocity = new Point(Math.cos(angle) * speed, Math.sin(angle) * speed);
    this.acceleration = new Point();

    this.graphics = new Graphics()
      .moveTo(-6, -3.5)
      .lineTo(7, 0)
      .lineTo(-6, 3.5)
      .lineTo(-3, 0)
      .closePath()
      .fill("#ffffff");
  }

  update(dt: number) {
    this.velocity.x += this.acceleration.x * dt;
    this.velocity.y += this.acceleration.y * dt;

    this.x += this.velocity.x * dt;
    this.y += this.velocity.y * dt;

    this.acceleration.set(0, 0);

    this.graphics.position.set(this.x, this.y);
    this.graphics.rotation = Math.atan2(this.velocity.y, this.velocity.x);
    this.graphics.tint = angleToColor(this.graphics.rotation);
  }
}

function angleToColor(angle: number): number {
  const hue = ((angle / Math.PI + 1) * 180) % 360;
  return hslToInt(hue, 0.75, 0.62);
}

function hslToInt(h: number, s: number, l: number): number {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }
  return (
    (Math.round((r + m) * 255) << 16) |
    (Math.round((g + m) * 255) << 8) |
    Math.round((b + m) * 255)
  );
}
