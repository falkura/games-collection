import { Graphics } from "pixi.js";
import { BoardLayout } from "./Board";

const BALL_COLORS = [
  0xff5577, 0xffa500, 0xffd84d, 0x4ade80, 0x22d3ee, 0x60a5fa, 0xc084fc,
  0xfb7185, 0xf472b6, 0x34d399,
];

export interface BallOpts {
  layout: BoardLayout;
  /** Target bin we must land in. */
  targetBin: number;
  onLanded: (bin: number) => void;
}

/**
 * Custom 2D physics: gravity + circle/peg collisions. Ball starts above the
 * top peg row with a tiny random nudge so visuals look organic. At each peg
 * row crossing, we apply a gentle horizontal correction toward the target bin
 * — strong enough to guarantee the right bin, soft enough that the bounces
 * still look like physics rather than a guided rail.
 */
export class Ball extends Graphics {
  public px: number;
  public py: number;
  private prevX: number;
  private prevY: number;
  private vx = 0;
  private vy = 0;
  private radius: number;
  private layout: BoardLayout;
  private targetBin: number;
  private onLanded: (bin: number) => void;
  private alive = true;
  private nextRowToCorrect = 0;

  constructor(opts: BallOpts) {
    super();
    this.layout = opts.layout;
    this.targetBin = opts.targetBin;
    this.onLanded = opts.onLanded;
    this.radius = opts.layout.ballRadius;

    const color = BALL_COLORS[Math.floor(Math.random() * BALL_COLORS.length)];
    this.circle(0, 0, this.radius).fill({ color });

    // Spawn just above the top peg row, slightly randomized.
    const cx = opts.layout.width / 2;
    this.px = cx + (Math.random() - 0.5) * opts.layout.colSpacingX * 0.4;
    this.py = opts.layout.topY - this.radius * 4;
    this.prevX = this.px - (Math.random() - 0.5) * 0.6;
    this.prevY = this.py;
    this.position.set(this.px, this.py);
  }

  /** dt in seconds (clamped). */
  public step(dt: number) {
    if (!this.alive) return;

    // Verlet integration.
    const gravity = 1800;
    const damping = 0.999;
    const ax = 0;
    const ay = gravity;

    const nx = this.px + (this.px - this.prevX) * damping + ax * dt * dt;
    const ny = this.py + (this.py - this.prevY) * damping + ay * dt * dt;

    this.prevX = this.px;
    this.prevY = this.py;
    this.px = nx;
    this.py = ny;

    this.resolvePegCollisions();
    this.applyTargetBias();
    this.resolveWalls();

    this.position.set(this.px, this.py);

    // Check for bin landing.
    if (this.py >= this.layout.binCenters[0].y - this.radius * 0.2) {
      this.land();
    }
  }

  private resolvePegCollisions() {
    const r = this.radius + this.layout.pegRadius;
    // Only check pegs within ~2 row spacings of current Y for perf.
    const yMin = this.py - this.layout.rowSpacingY * 1.5;
    const yMax = this.py + this.layout.rowSpacingY * 1.5;
    for (const p of this.layout.pegs) {
      if (p.y < yMin || p.y > yMax) continue;
      const dx = this.px - p.x;
      const dy = this.py - p.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < r * r && d2 > 0.0001) {
        const d = Math.sqrt(d2);
        const overlap = r - d;
        const nxh = dx / d;
        const nyh = dy / d;
        // Push out.
        this.px += nxh * overlap;
        this.py += nyh * overlap;
        // Reflect velocity (estimated from prev).
        const vx = this.px - this.prevX;
        const vy = this.py - this.prevY;
        const dot = vx * nxh + vy * nyh;
        const restitution = 0.55;
        const rvx = vx - (1 + restitution) * dot * nxh;
        const rvy = vy - (1 + restitution) * dot * nyh;
        // Tiny random tangential jitter for organic look.
        const jitter = (Math.random() - 0.5) * 0.3;
        this.prevX = this.px - (rvx + -nyh * jitter);
        this.prevY = this.py - (rvy + nxh * jitter);
      }
    }
  }

  private applyTargetBias() {
    // For each row crossed, nudge horizontal position toward target. We pick
    // a "checkpoint" between row r and r+1 — once py crosses peg row r's y +
    // half-row, we apply a corrective impulse so subsequent bounces converge.
    const layout = this.layout;
    const targetX = layout.binCenters[this.targetBin].x;
    while (
      this.nextRowToCorrect < layout.pegs[layout.pegs.length - 1].row + 1
    ) {
      const rowY =
        layout.topY +
        this.nextRowToCorrect * layout.rowSpacingY +
        layout.rowSpacingY * 0.55;
      if (this.py < rowY) break;
      // Apply a fraction of remaining horizontal distance per crossed row.
      // The fraction grows as we approach the bottom so we always converge.
      const remainingRows =
        layout.pegs[layout.pegs.length - 1].row + 1 - this.nextRowToCorrect;
      const k = Math.min(0.45, 0.18 + (1 / Math.max(1, remainingRows)) * 0.35);
      const dx = (targetX - this.px) * k;
      // Apply as displacement (verlet → also nudges velocity slightly).
      this.px += dx;
      this.prevX += dx * 0.6;
      this.nextRowToCorrect++;
    }
  }

  private resolveWalls() {
    const minX = this.radius + 4;
    const maxX = this.layout.width - this.radius - 4;
    if (this.px < minX) {
      this.px = minX;
      this.prevX = this.px + (this.px - this.prevX) * 0.5;
    } else if (this.px > maxX) {
      this.px = maxX;
      this.prevX = this.px + (this.px - this.prevX) * 0.5;
    }
  }

  private land() {
    if (!this.alive) return;
    this.alive = false;
    // Snap horizontally to the target bin so the visual matches the result.
    const targetX = this.layout.binCenters[this.targetBin].x;
    this.px = targetX;
    this.position.x = this.px;
    this.onLanded(this.targetBin);
  }

  public isAlive() {
    return this.alive;
  }
}
