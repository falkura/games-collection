import { Container, Graphics } from "pixi.js";
import gsap from "gsap";
import { BoardLayout } from "./Board";
import { BALL_CONFIG } from "./ballConfig";

interface Waypoint {
  x: number;
  y: number;
}

export class Ball extends Container {
  private gfx: Graphics;
  private _alive = true;
  private tl: gsap.core.Timeline;

  constructor(radius: number) {
    super();
    this.gfx = new Graphics();
    this.gfx
      .circle(0, 0, radius)
      .fill({ color: BALL_CONFIG.color })
      .circle(0, 0, radius)
      .stroke({ color: 0xffffff, alpha: 0.3, width: 1.5 });
    this.addChild(this.gfx);
  }

  public animate(
    layout: BoardLayout,
    path: (0 | 1)[],
    onLanded: (bin: number) => void,
  ) {
    const waypoints = computeWaypoints(layout, path);
    const hops = buildHops(waypoints, layout);

    // Start at first waypoint (first peg contact) immediately — no pause in air
    this.x = waypoints[0].x;
    this.y = waypoints[0].y;

    this.tl = gsap.timeline({
      onComplete: () => {
        this._alive = false;
        onLanded(path.reduce((s, v) => s + v, 0));
      },
    });

    for (const hop of hops) {
      // Rise to arc peak
      this.tl.to(this, {
        x: hop.peakX,
        y: hop.peakY,
        duration: hop.riseTime,
        ease: "power1.out",
      });
      // Fall to next contact
      this.tl.to(this, {
        x: hop.toX,
        y: hop.toY,
        duration: hop.fallTime,
        ease: hop.isLast ? "power2.in" : "power2.in",
      });
    }

    // Squash pulse timed to each peg contact moment
    let t = 0;
    for (let i = 0; i < hops.length - 1; i++) {
      t += hops[i].riseTime + hops[i].fallTime;
      this.tl.to(
        this.gfx.scale,
        { x: BALL_CONFIG.squashX, y: BALL_CONFIG.squashY, duration: BALL_CONFIG.squashDuration, ease: "power2.out" },
        t,
      );
      this.tl.to(
        this.gfx.scale,
        { x: 1, y: 1, duration: BALL_CONFIG.stretchDuration, ease: "elastic.out(1.5, 0.4)" },
        ">",
      );
    }
  }

  public isAlive() { return this._alive; }

  public markDead() {
    this._alive = false;
    this.tl?.kill();
  }
}

interface Hop {
  peakX: number;
  peakY: number;
  toX: number;
  toY: number;
  riseTime: number;
  fallTime: number;
  isLast: boolean;
}

/**
 * Build kinematically-derived hops from waypoints.
 *
 * Randomness injected at three levels:
 *  1. Per-hop speed variance — vyImpact scaled by random factor.
 *  2. High-bounce events — rare extra upward kick.
 *  3. Peg-skip — ball arcs over a waypoint, landing two pegs down.
 */
function buildHops(waypoints: Waypoint[], layout: BoardLayout): Hop[] {
  const g = BALL_CONFIG.gravity;
  const e = BALL_CONFIG.restitution;
  const hops: Hop[] = [];

  let vyImpact = Math.sqrt(2 * g * layout.rowSpacingY * 0.4);
  let justSkipped = false;

  let i = 0;
  while (i < waypoints.length - 1) {
    const from = waypoints[i];
    const rowsLeft = waypoints.length - 1 - i;
    const isLast = rowsLeft === 1;

    // Decide whether to skip the very next waypoint
    const canSkip =
      !isLast &&
      !justSkipped &&
      rowsLeft > BALL_CONFIG.skipMinRowsLeft &&
      Math.random() < BALL_CONFIG.skipChance;

    const toIdx = canSkip ? i + 2 : i + 1;
    const to = waypoints[toIdx];
    justSkipped = canSkip;

    // Speed variance per hop
    const speedScale =
      1 + (Math.random() * 2 - 1) * BALL_CONFIG.speedVariance;

    // Occasional high-bounce boost
    const boost =
      !isLast && Math.random() < BALL_CONFIG.highBoostChance
        ? BALL_CONFIG.highBoostMultiplier
        : 1.0;

    const vy0 = vyImpact * e * speedScale * boost;
    const dy = to.y - from.y;

    const disc = vy0 * vy0 + 2 * g * dy;
    const totalTime =
      disc >= 0
        ? (vy0 + Math.sqrt(disc)) / g
        : Math.sqrt(2 * Math.abs(dy) / g);

    const tPeak = Math.min(vy0 / g, totalTime * 0.95);
    const riseTime = Math.max(0.01, tPeak);
    const fallTime = Math.max(0.04, totalTime - riseTime);

    const peakY = from.y - vy0 * tPeak + 0.5 * g * tPeak * tPeak;
    const wobble = isLast
      ? 0
      : (Math.random() - 0.5) * layout.colSpacingX * BALL_CONFIG.wobbleFraction;
    const peakX =
      from.x + (to.x - from.x) * (riseTime / totalTime) + wobble;

    hops.push({
      peakX,
      peakY,
      toX: to.x,
      toY: to.y,
      riseTime,
      fallTime,
      isLast: toIdx === waypoints.length - 1,
    });

    // Carry forward impact speed for the next peg
    vyImpact = Math.sqrt(Math.max(0, vy0 * vy0 + 2 * g * dy));

    i = toIdx;
  }

  return hops;
}

/**
 * Waypoints: [first_peg_contact, peg1, ..., peg(rows-1), bin_center].
 * Ball spawns directly at peg row 0 — no aerial pause above the board.
 * Each peg contact point is above the peg center by (pegRadius + ballRadius).
 */
function computeWaypoints(layout: BoardLayout, path: (0 | 1)[]): Waypoint[] {
  const { binCenters, topY, rowSpacingY, colSpacingX, pegRadius, ballRadius } = layout;
  const rows = path.length;
  const centerX = layout.width / 2;
  const contactOffset = pegRadius + ballRadius;

  const waypoints: Waypoint[] = [];

  let rightSteps = 0;
  for (let r = 0; r < rows; r++) {
    const pegCount = r + 3;
    const rowWidth = (pegCount - 1) * colSpacingX;
    const startX = centerX - rowWidth / 2;
    const col = 1 + rightSteps;

    waypoints.push({
      x: startX + col * colSpacingX,
      y: topY + r * rowSpacingY - contactOffset,
    });

    if (path[r] === 1) rightSteps++;
  }

  waypoints.push({ x: binCenters[rightSteps].x, y: binCenters[rightSteps].y });

  return waypoints;
}
