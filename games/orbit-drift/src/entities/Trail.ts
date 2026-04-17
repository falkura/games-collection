import { Container, Graphics } from "pixi.js";
import type { Vec } from "../types";

export class Trail {
  readonly view: Graphics;
  private points: Vec[] = [];

  constructor(parent: Container, readonly limit = 180) {
    this.view = new Graphics();
    this.view.zIndex = 1;
    parent.addChild(this.view);
  }

  push(x: number, y: number) {
    this.points.push({ x, y });
    if (this.points.length > this.limit) this.points.shift();
  }

  draw() {
    this.view.clear();
    if (this.points.length < 2) return;
    this.view.moveTo(this.points[0].x, this.points[0].y);
    for (let i = 1; i < this.points.length; i++) {
      this.view.lineTo(this.points[i].x, this.points[i].y);
    }
    this.view.stroke({ color: 0xffffff, width: 1, alpha: 0.3 });
  }

  destroy() {
    this.view.destroy();
  }
}
