import { Graphics } from "pixi.js";
import Matter from "matter-js";

const BALL_COLORS = [
  0xff5577, 0xffa500, 0xffd84d, 0x4ade80, 0x22d3ee, 0x60a5fa, 0xc084fc,
  0xfb7185, 0xf472b6, 0x34d399,
];

export class Ball extends Graphics {
  public readonly body: Matter.Body;
  private _alive = true;

  constructor(body: Matter.Body, radius: number) {
    super();
    this.body = body;

    const color = BALL_COLORS[Math.floor(Math.random() * BALL_COLORS.length)];
    this.circle(0, 0, radius)
      .fill({ color })
      .circle(0, 0, radius)
      .stroke({ color: 0xffffff, alpha: 0.3, width: 1.5 });

    this.syncToBody();
  }

  public syncToBody() {
    this.position.set(this.body.position.x, this.body.position.y);
  }

  public isAlive() {
    return this._alive;
  }

  public markDead() {
    this._alive = false;
  }
}
