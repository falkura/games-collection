import { System } from "@falkura-pet/game-base";
import { Point, RectangleLike, Ticker } from "pixi.js";
import { LayoutManager } from "@falkura-pet/ui-base/layout/LayoutManager";
import { BoidsSimulation } from "../BoidsSimulation";
import { BladeApi } from "tweakpane";
import { Boid } from "./Boid";

const configDefault = {
  perceptionRadius: 50,

  alignmentWeight: 0.05,
  cohesionWeight: 0.01,
  separationWeight: 0.1,

  maxSpeed: 3,
  maxForce: 0.05,
};

export class MainSystem extends System<BoidsSimulation> {
  static MODULE_ID = "main";

  boids: Boid[] = [];
  config!: typeof configDefault;
  gamePaneComponents: BladeApi[] = [];
  outterBorderPadding = 10;
  bounds!: RectangleLike;

  limitMagnitude(vec: Point, max: number) {
    const mag = vec.magnitude();

    if (mag > max) {
      vec.x = (vec.x / mag) * max;
      vec.y = (vec.y / mag) * max;
    }
  }

  override resize(): void {
    const { width, height } = LayoutManager.instance.screen;

    this.bounds = {
      x: -this.outterBorderPadding,
      y: -this.outterBorderPadding,
      width: width + this.outterBorderPadding,
      height: height + this.outterBorderPadding,
    };
  }

  wrap(b: Boid) {
    const { width, height, x, y } = this.bounds;

    if (b.x < x) b.x = width;
    if (b.x > width) b.x = x;

    if (b.y < y) b.y = height;
    if (b.y > height) b.y = y;
  }

  override start(): void {
    this.config = JSON.parse(JSON.stringify(configDefault));
    this.resize();

    for (let i = 0; i < 500; i++) {
      this.addBoid();
    }

    if (__DEV__) {
      // @ts-ignore
      globalThis.main = this;
    }

    this.initTweakpane();
  }

  setBoidCount(count: number) {
    while (this.boids.length < count) {
      this.addBoid();
    }

    while (this.boids.length > count) {
      const b = this.boids.pop();
      if (b) this.removeBoid(b);
    }
  }

  addBoid() {
    const { width, height } = this.bounds;

    const b = new Boid(Math.random() * width, Math.random() * height);
    this.boids.push(b);
    this.view.addChild(b.graphics);
  }

  removeBoid(b: Boid) {
    this.view.removeChild(b.graphics);
  }

  override reset(): void {
    this.gamePaneComponents.forEach((item) => {
      this.game.pane.remove(item);
    });

    this.boids.forEach((boid) => {
      boid.graphics.clear();
    });

    this.boids = [];
  }

  distanceSquared(a: Point, b: Point) {
    return a.subtract(b).magnitudeSquared();
  }

  initTweakpane() {
    const count = this.game.pane
      .addBinding({ count: this.boids.length }, "count", {
        min: 100,
        max: 5000,
        step: 1,
      })
      .on("change", ({ value }) => this.setBoidCount(value));

    this.gamePaneComponents.push(count);

    const config = this.config;

    // perception
    const perception = this.game.pane.addFolder({ title: "Perception" });
    this.gamePaneComponents.push(perception);

    perception.addBinding(config, "perceptionRadius", {
      min: 10,
      max: 200,
      step: 1,
    });

    // weights
    const weights = this.game.pane.addFolder({ title: "Forces" });
    this.gamePaneComponents.push(weights);

    weights.addBinding(config, "alignmentWeight", {
      min: 0,
      max: 0.2,
      step: 0.001,
    });

    weights.addBinding(config, "cohesionWeight", {
      min: 0,
      max: 0.1,
      step: 0.001,
    });

    weights.addBinding(config, "separationWeight", {
      min: 0,
      max: 0.5,
      step: 0.001,
    });

    // limits
    const limits = this.game.pane.addFolder({ title: "Limits" });
    this.gamePaneComponents.push(limits);

    limits.addBinding(config, "maxSpeed", {
      min: 0.5,
      max: 10,
      step: 0.1,
    });

    limits.addBinding(config, "maxForce", {
      min: 0.001,
      max: 0.5,
      step: 0.001,
    });

    // debug actions
    const reset = this.game.pane
      .addButton({ title: "Reset velocities" })
      .on("click", () => {
        this.resetVelocities();
      });

    this.gamePaneComponents.push(reset);
  }

  resetVelocities() {
    for (const b of this.boids) {
      b.velocity.x = (Math.random() - 0.5) * 2;
      b.velocity.y = (Math.random() - 0.5) * 2;
    }
  }

  updateRules(b: Boid) {
    const separation = new Point(0, 0);
    const alignment = new Point(0, 0);
    const cohesion = new Point(0, 0);
    let total = 0;

    const r2 = this.config.perceptionRadius * this.config.perceptionRadius;

    for (const other of this.boids) {
      if (other === b) continue;

      const distance = this.distanceSquared(b, other);
      if (distance > r2) continue;

      total++;

      // Separation
      separation.x += (b.x - other.x) / distance;
      separation.y += (b.y - other.y) / distance;

      // Alignment
      alignment.x += other.velocity.x;
      alignment.y += other.velocity.y;

      // Cohesion
      cohesion.x += other.x;
      cohesion.y += other.y;
    }

    if (total > 0) {
      // Separation
      separation.x /= total;
      separation.y /= total;
      this.limitMagnitude(separation, this.config.maxForce);
      b.acceleration.x += separation.x * this.config.separationWeight;
      b.acceleration.y += separation.y * this.config.separationWeight;

      // Alignment
      alignment.x /= total;
      alignment.y /= total;
      this.limitMagnitude(alignment, this.config.maxForce);
      b.acceleration.x += alignment.x * this.config.alignmentWeight;
      b.acceleration.y += alignment.y * this.config.alignmentWeight;

      // Cohesion
      cohesion.x = cohesion.x / total - b.x;
      cohesion.y = cohesion.y / total - b.y;
      this.limitMagnitude(cohesion, this.config.maxForce);
      b.acceleration.x += cohesion.x * this.config.cohesionWeight;
      b.acceleration.y += cohesion.y * this.config.cohesionWeight;
    }
  }

  override tick(ticker: Ticker): void {
    for (const b of this.boids) {
      this.updateRules(b);
      this.limitMagnitude(b.velocity, this.config.maxSpeed);
      this.wrap(b);
      b.update(ticker.deltaTime);
    }
  }
}
