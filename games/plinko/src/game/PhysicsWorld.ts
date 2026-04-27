import Matter from "matter-js";
import { BoardLayout } from "./Board";

const { Engine, Composite, Bodies, Body, Events } = Matter;

export interface PhysicsBall {
  body: Matter.Body;
  targetBin: number;
  landed: boolean;
  onLanded: (bin: number) => void;
}

export class PhysicsWorld {
  public engine: Matter.Engine;
  private balls: PhysicsBall[] = [];
  private layout: BoardLayout | null = null;

  constructor() {
    this.engine = Engine.create({ gravity: { x: 0, y: 1.8 } });
  }

  public rebuild(layout: BoardLayout) {
    Composite.clear(this.engine.world, false);
    this.balls = [];
    this.layout = layout;

    for (const p of layout.pegs) {
      const peg = Bodies.circle(p.x, p.y, layout.pegRadius, {
        isStatic: true,
        restitution: 0.3,
        friction: 0.0,
        label: "peg",
      });
      Composite.add(this.engine.world, peg);
    }

    const wallThick = 20;
    const wallH = layout.height * 2;
    const leftWall = Bodies.rectangle(
      -wallThick / 2,
      layout.height / 2,
      wallThick,
      wallH,
      { isStatic: true, label: "wall" },
    );
    const rightWall = Bodies.rectangle(
      layout.width + wallThick / 2,
      layout.height / 2,
      wallThick,
      wallH,
      { isStatic: true, label: "wall" },
    );
    Composite.add(this.engine.world, [leftWall, rightWall]);

    this.buildBinWalls(layout);

    Events.on(this.engine, "collisionStart", (event) => {
      this.onCollision(event);
    });
  }

  private buildBinWalls(layout: BoardLayout) {
    const { binCenters, binWidth, binHeight } = layout;
    const wallThick = 4;
    const wallH = binHeight * 1.8;
    const topY = binCenters[0].y - binHeight * 0.1;

    for (let i = 0; i <= binCenters.length; i++) {
      let x: number;
      if (i === 0) {
        x = binCenters[0].x - binWidth / 2;
      } else if (i === binCenters.length) {
        x = binCenters[binCenters.length - 1].x + binWidth / 2;
      } else {
        x = (binCenters[i - 1].x + binCenters[i].x) / 2;
      }
      const wall = Bodies.rectangle(x, topY + wallH / 2, wallThick, wallH, {
        isStatic: true,
        restitution: 0.1,
        friction: 0.0,
        label: "bin-wall",
      });
      Composite.add(this.engine.world, wall);
    }
  }

  // On peg collision: redirect ball horizontally toward target bin
  private onCollision(event: Matter.IEventCollision<Matter.Engine>) {
    for (const pair of event.pairs) {
      const { bodyA, bodyB } = pair;

      let ballBody: Matter.Body | null = null;
      let otherLabel: string | null = null;

      if (bodyA.label === "ball" && bodyB.label === "peg") {
        ballBody = bodyA;
        otherLabel = "peg";
      } else if (bodyB.label === "ball" && bodyA.label === "peg") {
        ballBody = bodyB;
        otherLabel = "peg";
      }

      if (!ballBody || otherLabel !== "peg") continue;

      const pb = this.balls.find((b) => b.body === ballBody);
      if (!pb || pb.landed || !this.layout) continue;

      const layout = this.layout;
      const targetX = layout.binCenters[pb.targetBin].x;
      const dx = targetX - ballBody.position.x;

      // Nudge velocity toward target; strength scales with remaining distance
      const distNorm = Math.abs(dx) / (layout.width / 2);
      const nudge = 0.6 + distNorm * 1.2;
      const dir = dx > 0 ? 1 : -1;

      const vx = ballBody.velocity.x;
      const newVx = vx * 0.2 + dir * nudge;
      Body.setVelocity(ballBody, { x: newVx, y: ballBody.velocity.y });
    }
  }

  public spawnBall(
    targetBin: number,
    onLanded: (bin: number) => void,
  ): Matter.Body {
    if (!this.layout) throw new Error("no layout");

    const cx = this.layout.width / 2;
    const spawnX = cx + (Math.random() - 0.5) * this.layout.colSpacingX * 0.2;
    const spawnY = this.layout.topY - this.layout.ballRadius * 2;
    const r = this.layout.ballRadius;

    const body = Bodies.circle(spawnX, spawnY, r, {
      restitution: 0.2,
      friction: 0.0,
      frictionAir: 0.01,
      density: 0.004,
      label: "ball",
    });

    Body.setVelocity(body, { x: (Math.random() - 0.5) * 0.3, y: 1 });

    Composite.add(this.engine.world, body);
    this.balls.push({ body, targetBin, landed: false, onLanded });
    return body;
  }

  public step(dt: number) {
    if (!this.layout) return;

    Engine.update(this.engine, dt * 1000);
    this.checkLanding();
    this.clampBallsInBounds();
  }

  private checkLanding() {
    if (!this.layout) return;
    const layout = this.layout;
    const landY = layout.binCenters[0].y + layout.ballRadius * 0.5;

    for (const pb of this.balls) {
      if (pb.landed) continue;
      if (pb.body.position.y >= landY) {
        this.landBall(pb);
      }
    }
  }

  private clampBallsInBounds() {
    if (!this.layout) return;
    for (const pb of this.balls) {
      if (pb.landed) continue;
      const { x, y } = pb.body.position;
      const r = this.layout.ballRadius;
      const clampedX = Math.max(r, Math.min(this.layout.width - r, x));
      if (clampedX !== x) {
        Body.setPosition(pb.body, { x: clampedX, y });
        Body.setVelocity(pb.body, {
          x: -pb.body.velocity.x * 0.3,
          y: pb.body.velocity.y,
        });
      }
    }
  }

  private landBall(pb: PhysicsBall) {
    pb.landed = true;
    Composite.remove(this.engine.world, pb.body);
    pb.onLanded(pb.targetBin);
  }

  public removeBall(body: Matter.Body) {
    Composite.remove(this.engine.world, body);
    this.balls = this.balls.filter((b) => b.body !== body);
  }

  public getBalls(): PhysicsBall[] {
    return this.balls;
  }
}
