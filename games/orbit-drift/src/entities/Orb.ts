import { Container, Graphics, Sprite } from "pixi.js";
import gsap from "gsap";
import { bakeTexture } from "./textures";

export class Orb {
  static RADIUS = 12;

  readonly view: Sprite;
  collected = false;

  constructor(readonly x: number, readonly y: number, parent: Container) {
    const texture = bakeTexture(
      `orb:${Orb.RADIUS}`,
      () =>
        new Graphics()
          .circle(0, 0, Orb.RADIUS + 10)
          .fill({ color: "#00ffaa", alpha: 0.08 })
          .circle(0, 0, Orb.RADIUS + 4)
          .stroke({ color: "#7fffd8", width: 2, alpha: 0.45 })
          .moveTo(-Orb.RADIUS - 6, 0)
          .lineTo(Orb.RADIUS + 6, 0)
          .moveTo(0, -Orb.RADIUS - 6)
          .lineTo(0, Orb.RADIUS + 6)
          .stroke({ color: "#b4ffe9", width: 1, alpha: 0.38 })
          .circle(0, 0, Orb.RADIUS)
          .fill({ color: "#00ffaa" })
          .circle(-3, -4, Orb.RADIUS * 0.4)
          .fill({ color: "#eafff9", alpha: 0.9 }),
      Orb.RADIUS + 10,
    );

    this.view = new Sprite(texture);
    this.view.anchor.set(0.5);
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
