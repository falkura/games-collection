import { System } from "@falkura-pet/game-base";
import { Engine } from "@falkura-pet/engine";
import { Graphics, Ticker } from "pixi.js";
import { OrbitDrift } from "../OrbitDrift";
import { PhysicsWorld } from "../physics/PhysicsWorld";
import { gravityAt, simulateTrajectory } from "../physics/gravity";
import type { Vec } from "../types";
import {
  TOTAL_LEVELS,
  LEVEL_NAMES,
  type FinishData,
  type FinishReason,
} from "../types";
import { loadProgress, saveProgress } from "../progress";
import { generateLevel } from "../level/LevelGenerator";
import { Ship } from "../entities/Ship";
import { Planet } from "../entities/Planet";
import { Orb } from "../entities/Orb";
import { Wall } from "../entities/Wall";
import { Chaser } from "../entities/Chaser";
import { Shooter } from "../entities/Shooter";
import { Projectile } from "../entities/Projectile";
import { Trail } from "../entities/Trail";

export { TOTAL_LEVELS } from "../types";
export type { FinishData } from "../types";

export class SpaceSystem extends System<OrbitDrift> {
  static MODULE_ID = "space";

  readonly maxSpeed = 17;
  readonly maxDragDistance = 380;
  readonly dragImpulseScale = 0.03;
  readonly safeMarginPct = 0.05;
  readonly projectileLifeFrames = 420;

  currentLevel = 1;
  levelName = "";

  ship!: Ship;
  planets: Planet[] = [];
  orbs: Orb[] = [];
  walls: Wall[] = [];
  chasers: Chaser[] = [];
  shooters: Shooter[] = [];
  projectiles: Projectile[] = [];
  private trail!: Trail;
  private wallsView!: Graphics;

  active = false;
  collected = 0;
  shots = 0;
  elapsedMs = 0;

  private world!: PhysicsWorld;
  private pendingEnd: FinishReason | null = null;

  override start(): void {
    this.currentLevel = loadProgress();
    this.levelName =
      LEVEL_NAMES[Math.min(this.currentLevel, LEVEL_NAMES.length) - 1] ??
      `Level ${this.currentLevel}`;

    this.world = new PhysicsWorld();
    this.world.onCollision(
      (a, b) => a === "ship" && b === "wall",
      () => (this.pendingEnd ??= "wall"),
    );

    this.buildLevel();

    this.active = true;
    this.collected = 0;
    this.shots = 0;
    this.elapsedMs = 0;
    this.pendingEnd = null;
  }

  override reset(): void {
    this.ship?.destroy();
    for (const p of this.planets) p.destroy();
    for (const o of this.orbs) o.destroy();
    for (const w of this.walls) w.destroy();
    for (const c of this.chasers) c.destroy();
    for (const s of this.shooters) s.destroy();
    for (const pr of this.projectiles) pr.destroy();
    this.trail?.destroy();
    this.wallsView?.destroy();

    this.world?.destroy();

    this.planets = [];
    this.orbs = [];
    this.walls = [];
    this.chasers = [];
    this.shooters = [];
    this.projectiles = [];

    this.collected = 0;
    this.shots = 0;
    this.elapsedMs = 0;
    this.active = false;
    this.pendingEnd = null;
  }

  applyImpulse(dx: number, dy: number) {
    this.shots++;
    this.ship.setVelocity(
      dx * this.dragImpulseScale,
      dy * this.dragImpulseScale,
    );
  }

  retry() {
    Engine.restartGame();
  }

  nextLevel() {
    const next = this.currentLevel >= TOTAL_LEVELS ? 1 : this.currentLevel + 1;
    saveProgress(next);
    Engine.restartGame();
  }

  goToLevel(n: number) {
    const clamped = Math.max(1, Math.min(TOTAL_LEVELS, Math.floor(n)));
    saveProgress(clamped);
    Engine.restartGame();
  }

  simulate(
    sx: number,
    sy: number,
    vx: number,
    vy: number,
    steps: number,
  ): Vec[] {
    const { width, height } = Engine.layout.screen;
    return simulateTrajectory(
      { x: sx, y: sy },
      { x: vx, y: vy },
      {
        sources: this.planets,
        walls: this.walls,
        maxSpeed: this.maxSpeed,
        shipRadius: Ship.RADIUS,
        bounds: { width, height, margin: 400 },
        steps,
      },
    );
  }

  private buildLevel() {
    const { width, height } = Engine.layout.screen;
    const data = generateLevel({
      level: this.currentLevel,
      totalLevels: TOTAL_LEVELS,
      width,
      height,
      safeMarginPct: this.safeMarginPct,
      shipRadius: Ship.RADIUS,
    });

    this.wallsView = new Graphics();
    this.wallsView.zIndex = 0;
    this.view.addChild(this.wallsView);

    this.trail = new Trail(this.view);

    for (const p of data.planets) {
      this.planets.push(
        new Planet(p.x, p.y, p.mass, p.radius, p.color, this.world, this.view),
      );
    }

    this.ship = new Ship(data.ship.x, data.ship.y, this.world, this.view);

    for (const w of data.walls) {
      this.walls.push(new Wall(w.x1, w.y1, w.x2, w.y2, this.world));
    }
    this.drawWalls();

    for (const o of data.orbs) {
      this.orbs.push(new Orb(o.x, o.y, this.view));
    }
    for (const c of data.chasers) {
      this.chasers.push(new Chaser(c.x, c.y, c.speed, this.view));
    }
    for (const s of data.shooters) {
      this.shooters.push(
        new Shooter(
          s.x,
          s.y,
          s.cooldown,
          s.projectileSpeed,
          s.gravity,
          this.view,
        ),
      );
    }
  }

  private drawWalls() {
    this.wallsView.clear();
    for (const w of this.walls) {
      this.wallsView.moveTo(w.x1, w.y1).lineTo(w.x2, w.y2);
    }
    this.wallsView.stroke({ color: 0xff6b6b, width: 5, cap: "round" });
  }

  override tick(ticker: Ticker): void {
    if (!this.active) return;

    const dt = ticker.deltaTime;
    this.elapsedMs += ticker.deltaMS;

    const shipAccel = gravityAt(this.ship.x, this.ship.y, this.planets);
    this.ship.applyAccel(shipAccel.ax, shipAccel.ay);
    this.ship.clampSpeed(this.maxSpeed);

    this.world.update(ticker.deltaMS);
    this.ship.syncView();

    this.trail.push(this.ship.x, this.ship.y);
    this.trail.draw();

    this.updateChasers(dt);
    this.updateShooters(dt);
    this.updateProjectiles(dt);
    this.checkShip();
    this.collectOrbs();

    if (this.orbs.length > 0 && this.collected === this.orbs.length) {
      this.finishWith("win", true);
      return;
    }
    if (this.pendingEnd) {
      this.finishWith(this.pendingEnd, false);
    }
  }

  private updateChasers(dt: number) {
    const target = { x: this.ship.x, y: this.ship.y };
    for (const c of this.chasers) {
      c.update(dt, target);
      if (c.hits(this.ship.x, this.ship.y, Ship.RADIUS)) {
        this.pendingEnd ??= "chaser";
      }
    }
  }

  private updateShooters(dt: number) {
    for (const s of this.shooters) {
      if (!s.tick(dt)) continue;
      const dx = this.ship.x - s.x;
      const dy = this.ship.y - s.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 0.01) continue;
      const nx = dx / dist;
      const ny = dy / dist;
      this.projectiles.push(
        new Projectile(
          s.x + nx * (s.radius + 8),
          s.y + ny * (s.radius + 8),
          nx * s.projectileSpeed,
          ny * s.projectileSpeed,
          s.gravity,
          this.world,
          this.view,
          this.projectileLifeFrames,
        ),
      );
    }
  }

  private updateProjectiles(dt: number) {
    const { width, height } = Engine.layout.screen;
    const margin = 200;

    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.update(dt, this.planets);

      if (
        Math.hypot(p.x - this.ship.x, p.y - this.ship.y) <
        Projectile.RADIUS + Ship.RADIUS
      ) {
        this.pendingEnd ??= "projectile";
      }

      let killed = p.isExpired;
      if (!killed) {
        for (const pl of this.planets) {
          if (pl.hits(p.x, p.y, Projectile.RADIUS)) {
            killed = true;
            break;
          }
        }
      }
      if (!killed) {
        for (const w of this.walls) {
          if (w.distTo(p.x, p.y) < Projectile.RADIUS + 3) {
            killed = true;
            break;
          }
        }
      }
      if (
        !killed &&
        (p.x < -margin ||
          p.x > width + margin ||
          p.y < -margin ||
          p.y > height + margin)
      ) {
        killed = true;
      }

      if (killed) {
        p.destroy();
        this.projectiles.splice(i, 1);
      }
    }
  }

  private checkShip() {
    for (const p of this.planets) {
      if (p.hits(this.ship.x, this.ship.y, Ship.RADIUS)) {
        this.pendingEnd ??= "collision";
        return;
      }
    }
    const { width, height } = Engine.layout.screen;
    const m = 500;
    if (
      this.ship.x < -m ||
      this.ship.x > width + m ||
      this.ship.y < -m ||
      this.ship.y > height + m
    ) {
      this.pendingEnd ??= "out-of-bounds";
    }
  }

  private collectOrbs() {
    for (const o of this.orbs) {
      if (o.tryCollect(this.ship.x, this.ship.y, Ship.RADIUS)) {
        this.collected++;
      }
    }
  }

  private finishWith(reason: FinishReason, won: boolean) {
    this.active = false;
    if (won) saveProgress(this.currentLevel);
    const data: FinishData = {
      won,
      reason,
      collected: this.collected,
      total: this.orbs.length,
      level: this.currentLevel,
      levelName: this.levelName,
      time: this.elapsedMs,
      shots: this.shots,
    };
    Engine.finishGame(data);
  }
}
