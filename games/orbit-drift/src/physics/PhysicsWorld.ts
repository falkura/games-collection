import Matter from "matter-js";

export class PhysicsWorld {
  readonly engine: Matter.Engine;

  constructor() {
    this.engine = Matter.Engine.create({ gravity: { x: 0, y: 0, scale: 0 } });
  }

  add(body: Matter.Body) {
    Matter.World.add(this.engine.world, body);
  }

  remove(body: Matter.Body) {
    Matter.World.remove(this.engine.world, body);
  }

  update(dtMs: number) {
    Matter.Engine.update(this.engine, dtMs);
  }

  onCollision(pairMatches: (a: string, b: string) => boolean, cb: () => void) {
    Matter.Events.on(this.engine, "collisionStart", (ev) => {
      for (const pair of ev.pairs) {
        const a = pair.bodyA.label;
        const b = pair.bodyB.label;
        if (pairMatches(a, b) || pairMatches(b, a)) {
          cb();
        }
      }
    });
  }

  destroy() {
    Matter.World.clear(this.engine.world, false);
    Matter.Engine.clear(this.engine);
  }
}
