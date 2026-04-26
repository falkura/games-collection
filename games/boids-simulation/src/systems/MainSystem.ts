import { Graphics, Point, Ticker } from "pixi.js";
import { Layout } from "@falkura-pet/engine";
import { BoidsSimulation } from "../BoidsSimulation";
import { BladeApi } from "tweakpane";
import { Boid } from "../Boid";
import { SpatialGrid } from "../SpatialGrid";
import { System } from "./System";

const DEFAULTS = {
  count: 800,
  perceptionRadius: 60,
  alignmentWeight: 0.06,
  cohesionWeight: 0.012,
  separationWeight: 0.15,
  maxSpeed: 4,
  maxForce: 0.08,
  mouseEnabled: true,
  mouseRadius: 150,
  mouseStrength: 0.4,
  mouseRepel: true,
};

export class MainSystem extends System<BoidsSimulation> {
  static MODULE_ID = "main";

  private boids: Boid[] = [];
  private config = { ...DEFAULTS };
  private grid = new SpatialGrid(DEFAULTS.perceptionRadius);
  private mousePos = new Point(-99999, -99999);
  private paneItems: BladeApi[] = [];
  private bg: Graphics;
  private screenW = 0;
  private screenH = 0;

  override build(): void {
    this.bg = new Graphics();
    this.view.addChild(this.bg);

    this.view.eventMode = "static";
    this.view.on("pointermove", (e) => {
      const p = e.getLocalPosition(this.view);
      this.mousePos.set(p.x, p.y);
    });
    this.view.on("pointerleave", () => this.mousePos.set(-99999, -99999));
  }

  override start(): void {
    this.config = { ...DEFAULTS };
    this.spawnBoids(this.config.count);
    this.buildPane();
  }

  override resize(): void {
    const { width, height } = Layout.screen;
    this.screenW = width;
    this.screenH = height;

    this.bg.clear().rect(0, 0, width, height).fill({ color: "#030510" });
  }

  override reset(): void {
    for (const item of this.paneItems) this.game.pane.remove(item);
    for (const b of this.boids) b.graphics.destroy();
    this.boids = [];
    this.paneItems = [];
    this.mousePos.set(-99999, -99999);
  }

  override tick(ticker: Ticker): void {
    const dt = ticker.deltaTime;
    this.grid.cellSize = this.config.perceptionRadius;
    this.grid.clear();
    for (const b of this.boids) this.grid.insert(b);

    for (const b of this.boids) {
      this.applyFlocking(b);
      this.applyMouse(b);
      this.limitMag(b.velocity, this.config.maxSpeed);
      this.wrap(b);
      b.update(dt);
    }
  }

  private applyFlocking(b: Boid) {
    const neighbors = this.grid.neighbors(b);
    const sep = new Point();
    const ali = new Point();
    const coh = new Point();
    let total = 0;
    const r2 = this.config.perceptionRadius * this.config.perceptionRadius;

    for (const other of neighbors) {
      if (other === b) continue;
      const dx = b.x - other.x;
      const dy = b.y - other.y;
      const d2 = dx * dx + dy * dy;
      if (d2 > r2 || d2 === 0) continue;
      total++;
      sep.x += dx / d2;
      sep.y += dy / d2;
      ali.x += other.velocity.x;
      ali.y += other.velocity.y;
      coh.x += other.x;
      coh.y += other.y;
    }

    if (total === 0) return;
    const inv = 1 / total;

    sep.x *= inv;
    sep.y *= inv;
    this.limitMag(sep, this.config.maxForce);
    b.acceleration.x += sep.x * this.config.separationWeight;
    b.acceleration.y += sep.y * this.config.separationWeight;

    ali.x *= inv;
    ali.y *= inv;
    this.limitMag(ali, this.config.maxForce);
    b.acceleration.x += ali.x * this.config.alignmentWeight;
    b.acceleration.y += ali.y * this.config.alignmentWeight;

    coh.x = coh.x * inv - b.x;
    coh.y = coh.y * inv - b.y;
    this.limitMag(coh, this.config.maxForce);
    b.acceleration.x += coh.x * this.config.cohesionWeight;
    b.acceleration.y += coh.y * this.config.cohesionWeight;
  }

  private applyMouse(b: Boid) {
    if (!this.config.mouseEnabled) return;
    const dx = b.x - this.mousePos.x;
    const dy = b.y - this.mousePos.y;
    const d2 = dx * dx + dy * dy;
    const r2 = this.config.mouseRadius * this.config.mouseRadius;
    if (d2 >= r2 || d2 === 0) return;
    const dist = Math.sqrt(d2);
    const force =
      this.config.mouseStrength * (1 - dist / this.config.mouseRadius);
    const sign = this.config.mouseRepel ? 1 : -1;
    b.acceleration.x += (dx / dist) * force * sign;
    b.acceleration.y += (dy / dist) * force * sign;
  }

  private limitMag(v: Point, max: number) {
    const m2 = v.x * v.x + v.y * v.y;
    if (m2 > max * max) {
      const s = max / Math.sqrt(m2);
      v.x *= s;
      v.y *= s;
    }
  }

  private wrap(b: Boid) {
    const pad = 10;
    if (b.x < -pad) b.x = this.screenW + pad;
    else if (b.x > this.screenW + pad) b.x = -pad;
    if (b.y < -pad) b.y = this.screenH + pad;
    else if (b.y > this.screenH + pad) b.y = -pad;
  }

  private spawnBoids(count: number) {
    while (this.boids.length < count) {
      const b = new Boid(
        Math.random() * this.screenW,
        Math.random() * this.screenH,
      );
      this.boids.push(b);
      this.view.addChild(b.graphics);
    }
  }

  private setCount(count: number) {
    while (this.boids.length < count) {
      const b = new Boid(
        Math.random() * this.screenW,
        Math.random() * this.screenH,
      );
      this.boids.push(b);
      this.view.addChild(b.graphics);
    }
    while (this.boids.length > count) {
      const b = this.boids.pop()!;
      b.graphics.destroy();
    }
  }

  private buildPane() {
    const pane = this.game.pane;

    const countItem = pane
      .addBinding(this.config, "count", { min: 50, max: 3000, step: 1 })
      .on("change", ({ value }) => this.setCount(value));
    this.paneItems.push(countItem);

    const perception = pane.addFolder({ title: "Perception" });
    this.paneItems.push(perception);
    perception.addBinding(this.config, "perceptionRadius", {
      min: 10,
      max: 200,
      step: 1,
    });

    const forces = pane.addFolder({ title: "Forces" });
    this.paneItems.push(forces);
    forces.addBinding(this.config, "alignmentWeight", {
      min: 0,
      max: 0.3,
      step: 0.001,
    });
    forces.addBinding(this.config, "cohesionWeight", {
      min: 0,
      max: 0.1,
      step: 0.001,
    });
    forces.addBinding(this.config, "separationWeight", {
      min: 0,
      max: 0.5,
      step: 0.001,
    });

    const speed = pane.addFolder({ title: "Speed" });
    this.paneItems.push(speed);
    speed.addBinding(this.config, "maxSpeed", { min: 0.5, max: 12, step: 0.1 });
    speed.addBinding(this.config, "maxForce", {
      min: 0.001,
      max: 0.5,
      step: 0.001,
    });

    const mouse = pane.addFolder({ title: "Mouse" });
    this.paneItems.push(mouse);
    mouse.addBinding(this.config, "mouseEnabled", { label: "enabled" });
    mouse.addBinding(this.config, "mouseRepel", { label: "repel" });
    mouse.addBinding(this.config, "mouseRadius", {
      min: 30,
      max: 400,
      step: 1,
      label: "radius",
    });
    mouse.addBinding(this.config, "mouseStrength", {
      min: 0,
      max: 1,
      step: 0.01,
      label: "strength",
    });

    const resetBtn = pane
      .addButton({ title: "Scatter velocities" })
      .on("click", () => {
        for (const b of this.boids) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 1 + Math.random() * 2;
          b.velocity.set(Math.cos(angle) * speed, Math.sin(angle) * speed);
        }
      });
    this.paneItems.push(resetBtn);
  }
}
