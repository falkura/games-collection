import type { Vec } from "../types";

const PLANET_COLORS = [
  0xff6b6b, 0x4dabf7, 0xffd43b, 0xa29bfe, 0x55efc4, 0xfd79a8, 0xffa94d,
];

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
  return {
    planets: Math.min(5, 1 + Math.floor(t * 5)),
    orbs: 3 + Math.floor(t * 5),
    walls: n < 3 ? 0 : Math.min(3, Math.floor((n - 2) / 2)),
    chasers: n < 4 ? 0 : Math.min(3, Math.floor((n - 3) / 2)),
    shooters: n < 6 ? 0 : Math.min(2, Math.floor((n - 5) / 2)),
    gravityShooters: n < 8 ? 0 : Math.min(2, Math.floor((n - 7) / 1.5)),
  };
}

export function generateLevel(opts: GenerateOpts): LevelData {
  const { level, totalLevels, width, height, safeMarginPct, shipRadius } = opts;
  const margin = Math.min(width, height) * safeMarginPct;
  const params = levelParams(level, totalLevels);
  const zones: Zone[] = [];

  const planets: PlanetSpec[] = [];
  for (let i = 0; i < params.planets; i++) {
    const mass = rand(700, 1300);
    const radius = Math.sqrt(mass) * 1.15;
    const spawnR = radius + 80;
    const pos = tryPlace(width, height, margin, spawnR, zones, 80);
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

  const shipSafeR = shipRadius + 60;
  const ship =
    tryPlace(width, height, margin, shipSafeR, zones, 120) ?? {
      x: margin + shipSafeR,
      y: height / 2,
    };
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
    const pos = tryPlace(width, height, margin, 14 + 30, zones, 80);
    if (!pos) continue;
    orbs.push(pos);
    zones.push({ x: pos.x, y: pos.y, r: 14 + 30 });
  }

  const chasers: ChaserSpec[] = [];
  for (let i = 0; i < params.chasers; i++) {
    const pos = tryPlace(width, height, margin, 12 + 80, zones, 60);
    if (!pos) continue;
    chasers.push({ x: pos.x, y: pos.y, speed: 1.1 + level * 0.06 });
    zones.push({ x: pos.x, y: pos.y, r: 12 + 60 });
  }

  const shooters: ShooterSpec[] = [];
  for (let i = 0; i < params.shooters; i++) {
    const pos = tryPlace(width, height, margin, 14 + 60, zones, 60);
    if (!pos) continue;
    shooters.push({
      x: pos.x,
      y: pos.y,
      cooldown: Math.max(80, 180 - level * 8),
      projectileSpeed: 3.4 + level * 0.08,
      gravity: false,
    });
    zones.push({ x: pos.x, y: pos.y, r: 14 + 60 });
  }

  for (let i = 0; i < params.gravityShooters; i++) {
    const pos = tryPlace(width, height, margin, 16 + 60, zones, 60);
    if (!pos) continue;
    shooters.push({
      x: pos.x,
      y: pos.y,
      cooldown: Math.max(120, 240 - level * 6),
      projectileSpeed: 2.6 + level * 0.05,
      gravity: true,
    });
    zones.push({ x: pos.x, y: pos.y, r: 16 + 60 });
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
  for (let i = 0; i < 40; i++) {
    const length = rand(140, 260);
    const cx = margin + 120 + Math.random() * (w - margin * 2 - 240);
    const cy = margin + 120 + Math.random() * (h - margin * 2 - 240);
    const vertical = Math.random() < 0.5;
    const x1 = vertical ? cx : cx - length / 2;
    const y1 = vertical ? cy - length / 2 : cy;
    const x2 = vertical ? cx : cx + length / 2;
    const y2 = vertical ? cy + length / 2 : cy;
    const r = length / 2 + 40;
    if (!isClear(cx, cy, r, zones)) continue;
    return { spec: { x1, y1, x2, y2 }, zone: { x: cx, y: cy, r } };
  }
  return null;
}
