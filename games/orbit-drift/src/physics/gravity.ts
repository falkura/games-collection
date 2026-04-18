import type { Vec } from "../types";
import { PHYSICS } from "../config";

export interface GravitySource {
  x: number;
  y: number;
  mass: number;
  radius: number;
}

export interface SegmentObstacle {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export function gravityAt(
  px: number,
  py: number,
  sources: GravitySource[],
): { ax: number; ay: number } {
  let ax = 0;
  let ay = 0;
  const s2 = PHYSICS.GRAVITY_SOFTEN * PHYSICS.GRAVITY_SOFTEN;
  for (const p of sources) {
    const dx = p.x - px;
    const dy = p.y - py;
    const r2 = dx * dx + dy * dy;
    const r = Math.sqrt(Math.max(r2, 1));
    const a = (PHYSICS.G * p.mass) / (r2 + s2);
    ax += (dx / r) * a;
    ay += (dy / r) * a;
  }
  return { ax, ay };
}

export function distToSegment(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number {
  const cx = x2 - x1;
  const cy = y2 - y1;
  const lenSq = cx * cx + cy * cy;
  let t = 0;
  if (lenSq > 0) {
    t = ((px - x1) * cx + (py - y1) * cy) / lenSq;
    if (t < 0) t = 0;
    else if (t > 1) t = 1;
  }
  const dx = px - (x1 + t * cx);
  const dy = py - (y1 + t * cy);
  return Math.sqrt(dx * dx + dy * dy);
}

export interface SimulateOpts {
  sources: GravitySource[];
  walls: SegmentObstacle[];
  maxSpeed: number;
  shipRadius: number;
  bounds: { width: number; height: number; margin: number };
  steps: number;
}

export function simulateTrajectory(
  start: Vec,
  vel: Vec,
  opts: SimulateOpts,
): Vec[] {
  const pts: Vec[] = [{ x: start.x, y: start.y }];
  let x = start.x;
  let y = start.y;
  let vx = vel.x;
  let vy = vel.y;

  for (let i = 0; i < opts.steps; i++) {
    const { ax, ay } = gravityAt(x, y, opts.sources);
    vx += ax;
    vy += ay;
    const speed = Math.hypot(vx, vy);
    if (speed > opts.maxSpeed) {
      vx = (vx / speed) * opts.maxSpeed;
      vy = (vy / speed) * opts.maxSpeed;
    }
    x += vx;
    y += vy;

    let hit = false;
    for (const p of opts.sources) {
      const dx = p.x - x;
      const dy = p.y - y;
      if (dx * dx + dy * dy < (p.radius + opts.shipRadius) ** 2) {
        hit = true;
        break;
      }
    }
    if (!hit) {
      for (const w of opts.walls) {
        if (
          distToSegment(x, y, w.x1, w.y1, w.x2, w.y2) <
          opts.shipRadius + 3
        ) {
          hit = true;
          break;
        }
      }
    }
    pts.push({ x, y });
    if (hit) break;
    if (
      x < -opts.bounds.margin ||
      x > opts.bounds.width + opts.bounds.margin ||
      y < -opts.bounds.margin ||
      y > opts.bounds.height + opts.bounds.margin
    ) {
      break;
    }
  }
  return pts;
}
