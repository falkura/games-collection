import { Container, Graphics } from "pixi.js";
import gsap from "gsap";

export class Orb {
  static RADIUS = 10;

  readonly view: Graphics;
  collected = false;

  constructor(readonly x: number, readonly y: number, parent: Container) {
    this.view = new Graphics()
      .circle(0, 0, 14)
      .stroke({ color: 0x00ffaa, width: 1, alpha: 0.5 })
      .circle(0, 0, 10)
      .fill({ color: 0x00ffaa });
    this.view.x = x;
    this.view.y = y;
    this.view.zIndex = 1;
    parent.addChild(this.view);
  }

  tryCollect(px: number, py: number, pr: number): boolean {
    if (this.collected) return false;
    const dx = this.x - px;
    const dy = this.y - py;
    if (dx * dx + dy * dy >= (Orb.RADIUS + pr + 4) ** 2) return false;

    this.collected = true;
    gsap.to(this.view, {
      pixi: { scale: 2.4, alpha: 0 },
      duration: 0.35,
      ease: "power2.out",
      onComplete: () => (this.view.visible = false),
    });
    return true;
  }

  destroy() {
    this.view.destroy();
  }
}
