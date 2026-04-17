import Matter from "matter-js";
import { PhysicsWorld } from "../physics/PhysicsWorld";
import { distToSegment, type SegmentObstacle } from "../physics/gravity";

export class Wall implements SegmentObstacle {
  readonly body: Matter.Body;

  constructor(
    readonly x1: number,
    readonly y1: number,
    readonly x2: number,
    readonly y2: number,
    private world: PhysicsWorld,
  ) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx);
    this.body = Matter.Bodies.rectangle(
      (x1 + x2) / 2,
      (y1 + y2) / 2,
      length,
      10,
      { isStatic: true, angle, label: "wall" },
    );
    this.world.add(this.body);
  }

  distTo(px: number, py: number): number {
    return distToSegment(px, py, this.x1, this.y1, this.x2, this.y2);
  }

  destroy() {
    this.world.remove(this.body);
  }
}
