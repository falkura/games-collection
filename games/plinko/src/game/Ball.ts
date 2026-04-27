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
 * For each hop from A → B:
 *   - Vertical: ball leaves A with upward velocity vy0 (bounce from previous impact),
 *     follows y = A.y - vy0*t + 0.5*g*t² until it reaches B.y.
 *   - The peak happens at t_peak = vy0/g, height = A.y - vy0²/(2g).
 *   - vy0 is derived from the previous fall speed × restitution coefficient.
 *   - Horizontal: linear from A.x to B.x across total hop time.
 */
function buildHops(waypoints: Waypoint[], layout: BoardLayout): Hop[] {
  const g = BALL_CONFIG.gravity;
  const e = BALL_CONFIG.restitution;
  const hops: Hop[] = [];

  // Ball starts at waypoints[0] (first peg) with zero vertical speed
  // (it spawned directly there). Initial vertical launch = slight upward nudge
  // from a "just landed" state — derive from 1 row-height free-fall.
  let vyImpact = Math.sqrt(2 * g * layout.rowSpacingY * 0.4);

  for (let i = 0; i < waypoints.length - 1; i++) {
    const from = waypoints[i];
    const to = waypoints[i + 1];
    const isLast = i === waypoints.length - 2;

    // Upward velocity after bouncing off this peg
    const vy0 = vyImpact * e;
    const dy = to.y - from.y; // positive = downward

    // Time to travel dy vertically: from.y - vy0*t + 0.5*g*t² = to.y
    // => 0.5*g*t² - vy0*t - dy = 0  (dy may be small for final bin drop)
    // Always use kinematic solution; if disc < 0 clamp to pure fall.
    const disc = vy0 * vy0 + 2 * g * dy;
    const totalTime = disc >= 0
      ? (vy0 + Math.sqrt(disc)) / g
      : Math.sqrt(2 * Math.abs(dy) / g);

    const tPeak = Math.min(vy0 / g, totalTime * 0.95);
    const riseTime = Math.max(0.01, tPeak);
    const fallTime = Math.max(0.04, totalTime - riseTime);

    // Peak position — parabolic apex
    const peakY = from.y - vy0 * tPeak + 0.5 * g * tPeak * tPeak;
    // Lateral: linear interpolation; wobble only on non-last hops
    const wobble = isLast ? 0 : (Math.random() - 0.5) * layout.colSpacingX * BALL_CONFIG.wobbleFraction;
    const peakX = from.x + (to.x - from.x) * (riseTime / totalTime) + wobble;

    hops.push({ peakX, peakY, toX: to.x, toY: to.y, riseTime, fallTime, isLast });

    // Speed at impact with next peg (for next hop's bounce)
    vyImpact = Math.sqrt(Math.max(0, vy0 * vy0 + 2 * g * dy));
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
