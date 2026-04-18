import type { Vec } from "../types";
import { GENERATION, PLANET_COLORS } from "../config";

export interface PlanetSpec {
  x: number;
  y: number;
  mass: number;
  radius: number;
  color: number;
}
export interface WallSpec {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}
export interface ChaserSpec {
  x: number;
  y: number;
  speed: number;
}
export interface ShooterSpec {
  x: number;
  y: number;
  cooldown: number;
  projectileSpeed: number;
  gravity: boolean;
}

export interface LevelData {
  ship: Vec;
  planets: PlanetSpec[];
  walls: WallSpec[];
  orbs: Vec[];
  chasers: ChaserSpec[];
  shooters: ShooterSpec[];
}

export interface LevelParams {
  planets: number;
  orbs: number;
  walls: number;
  chasers: number;
  shooters: number;
  gravityShooters: number;
}

export interface GenerateOpts {
  level: number;
  totalLevels: number;
  width: number;
  height: number;
  safeMarginPct: number;
  shipRadius: number;
}

type Zone = { x: number; y: number; r: number };

export function levelParams(n: number, total: number): LevelParams {
  const t = n / total;
  const gated = (start: number, step: number, max: number) =>
    n < start ? 0 : Math.min(max, Math.floor((n - (start - 1)) / step));
  return {
    planets: Math.min(GENERATION.PLANET.MAX, 1 + Math.floor(t * 5)),
    orbs: GENERATION.ORB.BASE + Math.floor(t * GENERATION.ORB.STEP),
    walls: gated(GENERATION.WALL.START_LEVEL, 2, GENERATION.WALL.MAX),
    chasers: gated(GENERATION.CHASER.START_LEVEL, 2, GENERATION.CHASER.MAX),
    shooters: gated(GENERATION.SHOOTER.START_LEVEL, 2, GENERATION.SHOOTER.MAX),
    gravityShooters: gated(
      GENERATION.GRAVITY_SHOOTER.START_LEVEL,
      1.5,
      GENERATION.GRAVITY_SHOOTER.MAX,
    ),
  };
}

export function generateLevel(opts: GenerateOpts): LevelData {
  const { level, totalLevels, width, height, safeMarginPct, shipRadius } = opts;
  const margin = Math.min(width, height) * safeMarginPct;
  const params = levelParams(level, totalLevels);
  const zones: Zone[] = [];

  const planets: PlanetSpec[] = [];
  for (let i = 0; i < params.planets; i++) {
    const mass = rand(GENERATION.PLANET.MIN_MASS, GENERATION.PLANET.MAX_MASS);
    const radius = Math.sqrt(mass) * GENERATION.PLANET.RADIUS_FACTOR;
    const spawnR = radius + GENERATION.PLANET.SAFE_PAD;
    const pos = tryPlace(
      width,
      height,
      margin,
      spawnR,
      zones,
      GENERATION.PLANET.SPAWN_ATTEMPTS,
    );
    if (!pos) continue;
    planets.push({
      x: pos.x,
      y: pos.y,
      mass,
      radius,
      color: PLANET_COLORS[i % PLANET_COLORS.length],
    });
    zones.push({ x: pos.x, y: pos.y, r: spawnR });
  }

  const shipSafeR = shipRadius + GENERATION.SHIP_SAFE_PAD;
  const ship = tryPlace(
    width,
    height,
    margin,
    shipSafeR,
    zones,
    GENERATION.SHIP_SPAWN_ATTEMPTS,
  ) ?? { x: margin + shipSafeR, y: height / 2 };
  zones.push({ x: ship.x, y: ship.y, r: shipSafeR + 40 });

  const walls: WallSpec[] = [];
  for (let i = 0; i < params.walls; i++) {
    const placed = tryPlaceWall(width, height, margin, zones);
    if (placed) {
      walls.push(placed.spec);
      zones.push(placed.zone);
    }
  }

  const orbs: Vec[] = [];
  for (let i = 0; i < params.orbs; i++) {
    const orbRadius = 16;
    const pos = tryPlace(
      width,
      height,
      margin,
      orbRadius + GENERATION.ORB.SAFE_PAD,
      zones,
      GENERATION.ORB.SPAWN_ATTEMPTS,
    );
    if (!pos) continue;
    orbs.push(pos);
    zones.push({ x: pos.x, y: pos.y, r: orbRadius + GENERATION.ORB.SAFE_PAD });
  }

  const chasers: ChaserSpec[] = [];
  for (let i = 0; i < params.chasers; i++) {
    const chaserRadius = 14;
    const pos = tryPlace(
      width,
      height,
      margin,
      chaserRadius + GENERATION.CHASER.SAFE_PAD,
      zones,
      GENERATION.CHASER.SPAWN_ATTEMPTS,
    );
    if (!pos) continue;
    chasers.push({
      x: pos.x,
      y: pos.y,
      speed:
        GENERATION.CHASER.SPEED_BASE + level * GENERATION.CHASER.SPEED_STEP,
    });
    zones.push({ x: pos.x, y: pos.y, r: chaserRadius + 60 });
  }

  const shooters: ShooterSpec[] = [];
  for (let i = 0; i < params.shooters; i++) {
    const shooterRadius = 16;
    const pos = tryPlace(
      width,
      height,
      margin,
      shooterRadius + GENERATION.SHOOTER.SAFE_PAD,
      zones,
      GENERATION.SHOOTER.SPAWN_ATTEMPTS,
    );
    if (!pos) continue;
    shooters.push({
      x: pos.x,
      y: pos.y,
      cooldown: Math.max(
        GENERATION.SHOOTER.COOLDOWN_MIN,
        GENERATION.SHOOTER.COOLDOWN_BASE -
          level * GENERATION.SHOOTER.COOLDOWN_STEP,
      ),
      projectileSpeed:
        GENERATION.SHOOTER.SPEED_BASE + level * GENERATION.SHOOTER.SPEED_STEP,
      gravity: false,
    });
    zones.push({
      x: pos.x,
      y: pos.y,
      r: shooterRadius + GENERATION.SHOOTER.SAFE_PAD,
    });
  }

  for (let i = 0; i < params.gravityShooters; i++) {
    const shooterRadius = 18;
    const pos = tryPlace(
      width,
      height,
      margin,
      shooterRadius + GENERATION.GRAVITY_SHOOTER.SAFE_PAD,
      zones,
      GENERATION.GRAVITY_SHOOTER.SPAWN_ATTEMPTS,
    );
    if (!pos) continue;
    shooters.push({
      x: pos.x,
      y: pos.y,
      cooldown: Math.max(
        GENERATION.GRAVITY_SHOOTER.COOLDOWN_MIN,
        GENERATION.GRAVITY_SHOOTER.COOLDOWN_BASE -
          level * GENERATION.GRAVITY_SHOOTER.COOLDOWN_STEP,
      ),
      projectileSpeed:
        GENERATION.GRAVITY_SHOOTER.SPEED_BASE +
        level * GENERATION.GRAVITY_SHOOTER.SPEED_STEP,
      gravity: true,
    });
    zones.push({
      x: pos.x,
      y: pos.y,
      r: shooterRadius + GENERATION.GRAVITY_SHOOTER.SAFE_PAD,
    });
  }

  return { ship, planets, walls, orbs, chasers, shooters };
}

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function tryPlace(
  w: number,
  h: number,
  margin: number,
  radius: number,
  zones: Zone[],
  attempts: number,
): Vec | null {
  const minX = margin + radius;
  const maxX = w - margin - radius;
  const minY = margin + radius;
  const maxY = h - margin - radius;
  for (let i = 0; i < attempts; i++) {
    const x = minX + Math.random() * (maxX - minX);
    const y = minY + Math.random() * (maxY - minY);
    if (isClear(x, y, radius, zones)) return { x, y };
  }
  return null;
}

function isClear(x: number, y: number, r: number, zones: Zone[]): boolean {
  for (const z of zones) {
    const dx = x - z.x;
    const dy = y - z.y;
    const minDist = r + z.r;
    if (dx * dx + dy * dy < minDist * minDist) return false;
  }
  return true;
}

function tryPlaceWall(
  w: number,
  h: number,
  margin: number,
  zones: Zone[],
): { spec: WallSpec; zone: Zone } | null {
  for (let i = 0; i < GENERATION.WALL.SPAWN_ATTEMPTS; i++) {
    const length = rand(GENERATION.WALL.MIN_LEN, GENERATION.WALL.MAX_LEN);
    const cx = margin + 120 + Math.random() * (w - margin * 2 - 240);
    const cy = margin + 120 + Math.random() * (h - margin * 2 - 240);
    const vertical = Math.random() < 0.5;
    const x1 = vertical ? cx : cx - length / 2;
    const y1 = vertical ? cy - length / 2 : cy;
    const x2 = vertical ? cx : cx + length / 2;
    const y2 = vertical ? cy + length / 2 : cy;
    const r = length / 2 + GENERATION.WALL.SAFE_PAD;
    if (!isClear(cx, cy, r, zones)) continue;
    return { spec: { x1, y1, x2, y2 }, zone: { x: cx, y: cy, r } };
  }
  return null;
}
