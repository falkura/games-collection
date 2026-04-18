import { System } from "@falkura-pet/game-base";
import { Engine } from "@falkura-pet/engine";
import { Graphics, Ticker } from "pixi.js";
import gsap from "gsap";
import { OrbitDrift } from "../OrbitDrift";
import { PhysicsWorld } from "../physics/PhysicsWorld";
import { gravityAt, simulateTrajectory } from "../physics/gravity";
import type { Vec, FinishData, FinishReason } from "../types";
import {
  PHYSICS,
  LEVEL,
  AIM_TIME,
  PROJECTILE as PROJECTILE_CFG,
  SHIP_BOUNDS_MARGIN,
  STARFIELD,
  TRAJECTORY_PREVIEW,
} from "../config";
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

export const TOTAL_LEVELS = LEVEL.TOTAL;
export type { FinishData } from "../types";

export class SpaceSystem extends System<OrbitDrift> {
  static MODULE_ID = "space";

  readonly maxSpeed = PHYSICS.MAX_SPEED;
  readonly maxDragDistance = PHYSICS.MAX_DRAG_DISTANCE;
  readonly dragImpulseScale = PHYSICS.DRAG_IMPULSE_SCALE;
  readonly safeMarginPct = LEVEL.SAFE_MARGIN_PCT;
  readonly projectileLifeFrames = PROJECTILE_CFG.LIFE_FRAMES;

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
  private starfieldView!: Graphics;
  private wallsView!: Graphics;

  active = false;
  collected = 0;
  shots = 0;
  elapsedMs = 0;

  private world!: PhysicsWorld;
  private pendingEnd: FinishReason | null = null;
  private aimTween: gsap.core.Tween | null = null;
  private baseSpeed = 1;

  override start(): void {
    this.currentLevel = loadProgress();
    this.levelName =
      LEVEL.NAMES[Math.min(this.currentLevel, LEVEL.NAMES.length) - 1] ??
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
    this.starfieldView?.destroy();
    this.wallsView?.destroy();

    this.world?.destroy();

    this.aimTween?.kill();
    this.aimTween = null;
    this.game.ticker.speed = 1;

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
    this.ship.setVelocity(dx * this.dragImpulseScale, dy * this.dragImpulseScale);
  }

  /**
   * Smoothly scale game time toward `AIM_TIME.SPEED` while `aiming`, back to
   * the pre-aim speed when released. If `AIM_TIME.TRANSITION_MS` is 0 the
   * speed flips instantly instead of tweening.
   */
  setAiming(aiming: boolean) {
    if (!this.active) return;
    const ticker = this.game.ticker;

    if (aiming) {
      if (!this.aimTween) this.baseSpeed = ticker.speed;
      this.aimTween?.kill();
      const target = this.baseSpeed * AIM_TIME.SPEED;
      if (AIM_TIME.TRANSITION_MS <= 0) {
        ticker.speed = target;
        this.aimTween = null;
      } else {
        this.aimTween = gsap.to(ticker, {
          speed: target,
          duration: AIM_TIME.TRANSITION_MS / 1000,
          ease: "power2.out",
          onComplete: () => (this.aimTween = null),
        });
      }
    } else {
      this.aimTween?.kill();
      if (AIM_TIME.TRANSITION_MS <= 0) {
        ticker.speed = this.baseSpeed;
        this.aimTween = null;
      } else {
        this.aimTween = gsap.to(ticker, {
          speed: this.baseSpeed,
          duration: AIM_TIME.TRANSITION_MS / 1000,
          ease: "power2.out",
          onComplete: () => (this.aimTween = null),
        });
      }
    }
  }

  retry() {
    Engine.restartGame();
  }

  nextLevel() {
    const next = this.currentLevel >= LEVEL.TOTAL ? 1 : this.currentLevel + 1;
    saveProgress(next);
    Engine.restartGame();
  }

  goToLevel(n: number) {
    const clamped = Math.max(1, Math.min(LEVEL.TOTAL, Math.floor(n)));
    saveProgress(clamped);
    Engine.restartGame();
  }

  simulate(sx: number, sy: number, vx: number, vy: number): Vec[] {
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
        steps: TRAJECTORY_PREVIEW.STEPS,
      },
    );
  }

  private buildLevel() {
    const { width, height } = Engine.layout.screen;
    const data = generateLevel({
      level: this.currentLevel,
      totalLevels: LEVEL.TOTAL,
      width,
      height,
      safeMarginPct: this.safeMarginPct,
      shipRadius: Ship.RADIUS,
    });

    this.starfieldView = new Graphics();
    this.starfieldView.zIndex = -2;
    this.view.addChild(this.starfieldView);
    this.drawStarfield(width, height);

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

  override resize(): void {
    if (!this.starfieldView || !this.active) return;
    const { width, height } = Engine.layout.screen;
    this.drawStarfield(width, height);
    this.drawWalls();
  }

  private drawWalls() {
    this.wallsView.clear();
    for (const w of this.walls) {
      this.wallsView.moveTo(w.x1, w.y1).lineTo(w.x2, w.y2);
    }
    this.wallsView.stroke({ color: "#ff6b6b", width: 5, cap: "round" });
  }

  private drawStarfield(width: number, height: number) {
    const area = width * height;
    const starCount = Math.max(
      STARFIELD.MIN_STARS,
      Math.min(STARFIELD.MAX_STARS, Math.round(area * STARFIELD.BASE_DENSITY)),
    );
    const random = this.seededRandom(
      this.currentLevel * 9973 + Math.round(width) * 37 + Math.round(height) * 101,
    );

    this.starfieldView.clear();
    this.starfieldView.rect(0, 0, width, height).fill(STARFIELD.BACKGROUND_COLOR);

    for (let i = 0; i < starCount; i++) {
      const x = random() * width;
      const y = random() * height;
      const tier = random();
      const alpha = 0.35 + random() * 0.55;

      if (tier < STARFIELD.GIANT_STAR_RATIO) {
        const r = 2.4 + random() * 1.6;
        const glow = 12 + random() * 12;
        this.starfieldView.circle(x, y, glow).fill({ color: "#9fc4ff", alpha: 0.05 });
        this.starfieldView.circle(x, y, r).fill({ color: "#ffffff", alpha });
        this.starfieldView
          .moveTo(x - 8, y)
          .lineTo(x + 8, y)
          .moveTo(x, y - 8)
          .lineTo(x, y + 8)
          .stroke({ color: "#cfe0ff", width: 1, alpha: STARFIELD.PARALLAX_ALPHA });
        continue;
      }

      if (tier < STARFIELD.GIANT_STAR_RATIO + STARFIELD.BIG_STAR_RATIO) {
        const r = 1.2 + random() * 0.8;
        this.starfieldView.circle(x, y, 6 + random() * 6).fill({
          color: "#8fb8ff",
          alpha: 0.035,
        });
        this.starfieldView.circle(x, y, r).fill({ color: "#f8fbff", alpha });
        continue;
      }

      this.starfieldView.circle(x, y, 0.6 + random() * 0.9).fill({
        color: "#ffffff",
        alpha,
      });
    }
  }

  private seededRandom(seed: number) {
    let state = seed >>> 0;
    return () => {
      state = (state * 1664525 + 1013904223) >>> 0;
      return state / 0x100000000;
    };
  }

  override tick(ticker: Ticker): void {
    if (!this.active) return;

    const dt = ticker.deltaTime;
    this.elapsedMs += ticker.deltaMS;

    const shipAccel = gravityAt(this.ship.x, this.ship.y, this.planets);
    this.ship.applyAccel(shipAccel.ax * dt, shipAccel.ay * dt);
    this.ship.clampSpeed(this.maxSpeed);

    this.world.update((1000 / 60) * dt);
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
    const margin = PROJECTILE_CFG.OFFSCREEN_MARGIN;

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
    const m = SHIP_BOUNDS_MARGIN;
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
    this.aimTween?.kill();
    this.aimTween = null;
    this.game.ticker.speed = 1;

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
