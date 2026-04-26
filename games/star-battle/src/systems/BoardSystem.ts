import { Container, Graphics, FederatedPointerEvent, Rectangle } from "pixi.js";
import gsap from "gsap";
import { Layout } from "@falkura-pet/engine";
import { StarBattle } from "../StarBattle";
import { events, Events, Mark } from "../events";
import { System } from "./System";

const PALETTE_BG = "#0b1024";
const PALETTE_GRID_LINE = "#1f2647";
const PALETTE_REGION_BORDER = "#f4f6ff";
const PALETTE_CROSS = "#0a0d1f";
const PALETTE_CROSS_SHADOW = "#000000";
const PALETTE_STAR_FILL = "#fbfbf4";
const PALETTE_STAR_BORDER = "#3a2a05";
const PALETTE_STAR_HIGHLIGHT = "#ffffff";
const PALETTE_STAR_SHADOW = "#000000";
const PALETTE_CONFLICT = "#ff1840";
const PALETTE_CONFLICT_GLOW = "#ff5b6e";
const PALETTE_STAR_CONFLICT_FILL = "#ff2a4a";
const PALETTE_STAR_CONFLICT_BORDER = "#7a0010";
const PALETTE_STAR_CONFLICT_HIGHLIGHT = "#ff8899";

/** Vibrant region palette — cycled if a puzzle has more regions. */
const REGION_COLORS = [
  "#ff5d8f", // hot pink
  "#ffa630", // orange
  "#ffe14d", // bright yellow
  "#7ddc1f", // lime
  "#22d3a3", // emerald
  "#1ec8e8", // cyan
  "#5a8cff", // electric blue
  "#a05cff", // violet
  "#ff5cd9", // magenta
  "#ff7a59", // coral
  "#3ddc97", // mint
  "#e0e040", // chartreuse
];

export class BoardSystem extends System<StarBattle> {
  static MODULE_ID = "board";

  private background: Graphics;
  private boardLayer: Container;
  private cellsLayer: Graphics;
  private highlightLayer: Graphics;
  private bordersLayer: Graphics;
  private gridLayer: Graphics;
  private marksLayer: Container;
  private conflictLayer: Graphics;

  /** Display objects per cell. */
  private cellSprites: Array<
    Array<{ star: Graphics; cross: Graphics } | null>
  > = [];
  /** Currently displayed marks (user + auto-crosses). */
  private displayMarks: Mark[][] = [];
  /** Conflict cells from the last showConflicts call — used to colour conflict stars. */
  private conflictCells: Set<string> = new Set();
  /** Marks snapshot from the last showConflicts call — needed for resize redraw. */
  private lastConflictMarks: Mark[][] = [];
  /** Starless region ids from the last showStarlessRegions call — needed for resize. */
  private lastStarlessIds: Set<number> = new Set();
  /** Pending delay timer for starless highlight. */
  private starlessTimer: ReturnType<typeof setTimeout> | null = null;

  private cellSize = 0;
  private boardX = 0;
  private boardY = 0;
  private size = 0;
  private interactive = false;

  override build() {
    this.background = new Graphics();
    this.view.addChild(this.background);

    this.boardLayer = new Container();
    this.view.addChild(this.boardLayer);

    this.cellsLayer = new Graphics();
    this.cellsLayer.eventMode = "none";
    this.boardLayer.addChild(this.cellsLayer);

    this.gridLayer = new Graphics();
    this.gridLayer.eventMode = "none";
    this.boardLayer.addChild(this.gridLayer);

    this.bordersLayer = new Graphics();
    this.bordersLayer.eventMode = "none";
    this.boardLayer.addChild(this.bordersLayer);
    
    this.highlightLayer = new Graphics();
    this.highlightLayer.eventMode = "none";
    this.boardLayer.addChild(this.highlightLayer);

    this.conflictLayer = new Graphics();
    this.conflictLayer.eventMode = "none";
    this.boardLayer.addChild(this.conflictLayer);

    this.marksLayer = new Container();
    this.marksLayer.eventMode = "none";
    this.boardLayer.addChild(this.marksLayer);

    this.view.eventMode = "static";
    this.view.cursor = "pointer";
    this.view.on("pointertap", this.onPointerTap);
  }

  /** Called by the game when a new puzzle is loaded. */
  loadPuzzle(size: number) {
    this.size = size;
    this.clearMarkSprites();
    this.cellSprites = Array.from({ length: size }, () =>
      Array<{ star: Graphics; cross: Graphics } | null>(size).fill(null),
    );
    this.displayMarks = Array.from(
      { length: size },
      () => Array(size).fill(0) as Mark[],
    );
    this.layout();
    this.drawAll();
  }

  setInteractive(value: boolean) {
    this.interactive = value;
    this.view.cursor = value ? "pointer" : "default";
  }

  /** Hide the board contents (used while paused). */
  setHidden(value: boolean) {
    gsap.killTweensOf(this.boardLayer);
    gsap.to(this.boardLayer, {
      alpha: value ? 0 : 1,
      duration: 0.25,
      ease: "power2.out",
    });
  }

  /** Sync displayed marks with the given grid; animate added/removed cells. */
  setMarks(marks: Mark[][], conflicts: Set<string> = new Set()) {
    if (!this.cellSprites.length) return;
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        const next = marks[r][c];
        const key = `${r},${c}`;
        const inConflict = next === 2 && conflicts.has(key);
        // Rebuild if mark changed OR if the star's conflict state changed.
        const prev = this.displayMarks[r][c];
        const wasConflict = prev === 2 && this.conflictCells.has(key);
        if (prev !== next || (next === 2 && inConflict !== wasConflict)) {
          this.applyMark(r, c, next, inConflict);
          this.displayMarks[r][c] = next;
        }
      }
    }
  }

  private applyMark(row: number, col: number, mark: Mark, conflict = false) {
    const existing = this.cellSprites[row][col];
    if (existing) {
      gsap.killTweensOf(existing.star.scale);
      gsap.killTweensOf(existing.cross.scale);
      gsap.killTweensOf(existing.star);
      gsap.killTweensOf(existing.cross);
      existing.star.destroy();
      existing.cross.destroy();
      this.cellSprites[row][col] = null;
    }
    if (mark === 0) return;

    const cx = col * this.cellSize + this.cellSize / 2;
    const cy = row * this.cellSize + this.cellSize / 2;
    const target = this.markScale();

    const star = this.makeStar(conflict);
    const cross = this.makeCross();
    star.position.set(cx, cy);
    cross.position.set(cx, cy);
    this.marksLayer.addChild(cross, star);
    this.cellSprites[row][col] = { star, cross };

    if (mark === 2) {
      cross.visible = false;
      star.scale.set(0);
      star.alpha = 0;
      gsap.to(star.scale, {
        x: target,
        y: target,
        duration: 0.32,
        ease: "back.out(2.4)",
      });
      gsap.to(star, { alpha: 1, duration: 0.18, ease: "power2.out" });
      return;
    }

    // mark === 1 (cross)
    star.visible = false;
    cross.scale.set(0);
    cross.alpha = 0;
    gsap.to(cross.scale, {
      x: target,
      y: target,
      duration: 0.18,
      ease: "back.out(2)",
    });
    gsap.to(cross, { alpha: 1, duration: 0.12, ease: "power2.out" });
  }

  /** Scale factor to fit a 100-unit mark sprite into the current cell. */
  private markScale(): number {
    return this.cellSize / 100;
  }

  /** Highlight conflicting cells. Stars get a red star graphic; non-star cells get a red overlay. */
  showConflicts(cells: Set<string>, marks: Mark[][] = []) {
    this.conflictCells = cells;
    this.lastConflictMarks = marks;
    this.redrawConflicts();
  }

  private redrawConflicts() {
    this.conflictLayer.clear();
    gsap.killTweensOf(this.conflictLayer.scale);
    this.conflictLayer.alpha = 1;
    this.conflictLayer.scale.set(1);
    if (this.conflictCells.size === 0) return;
    const cs = this.cellSize;
    for (const k of this.conflictCells) {
      const [rs, ccs] = k.split(",");
      const r = Number(rs);
      const c = Number(ccs);
      // Star cells are shown as red stars — no overlay needed.
      if (this.lastConflictMarks[r]?.[c] === 2) continue;
      const cx = c * cs + cs / 2;
      const cy = r * cs + cs / 2;
      this.drawConflictSquare(cx, cy, cs);
    }
  }

  /**
   * Highlight regions that are fully auto-crossed but have no star yet.
   * Pass an empty set to clear. Highlight appears after a 2-second delay.
   */
  showStarlessRegions(starlessIds: Set<number>) {
    // Cancel any pending timer.
    if (this.starlessTimer !== null) {
      clearTimeout(this.starlessTimer);
      this.starlessTimer = null;
    }

    // Always update stored ids so resize has the latest state.
    this.lastStarlessIds = starlessIds;

    // Clear immediately when no starless regions.
    if (starlessIds.size === 0) {
      gsap.killTweensOf(this.highlightLayer);
      this.highlightLayer.clear();
      this.highlightLayer.alpha = 1;
      return;
    }

    // Delay the actual draw by 2 seconds.
    this.starlessTimer = setTimeout(() => {
      this.starlessTimer = null;
      this.redrawStarlessRegions();
    }, 2000);
  }

  private redrawStarlessRegions() {
    gsap.killTweensOf(this.highlightLayer);
    this.highlightLayer.clear();
    this.highlightLayer.alpha = 0;

    if (this.lastStarlessIds.size === 0) return;

    const regions = this.game.getRegions();
    const cs = this.cellSize;
    const borderW = Math.max(2.5, cs * 0.07);
    const r2 = Math.max(4, cs * 0.13); // corner radius for the path

    // White tint fill — plain rect per cell.
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (!this.lastStarlessIds.has(regions[r][c])) continue;
        this.highlightLayer
          .rect(c * cs, r * cs, cs, cs)
          .fill({ color: 0xffffff, alpha: 0.22 });
      }
    }

    // Per-region: build one continuous exterior path with rounded corners.
    for (const gId of this.lastStarlessIds) {
      this.drawRegionOutlinePath(gId, regions, cs, borderW, r2);
    }

    // Fade in then pulse.
    gsap.to(this.highlightLayer, {
      alpha: 1,
      duration: 0.4,
      ease: "power2.out",
      onComplete: () => {
        gsap.to(this.highlightLayer, {
          alpha: 0.35,
          duration: 0.7,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      },
    });
  }

  /**
   * Walk the exterior boundary of a region as a single closed path.
   * Edges are collected from the grid; corners are rounded via quadraticCurveTo.
   */
  private drawRegionOutlinePath(
    gId: number,
    regions: number[][],
    cs: number,
    borderW: number,
    r2: number,
  ) {
    // Collect directed exterior half-edges: [x1,y1 -> x2,y2] in pixel space.
    // Convention: walking clockwise around the region, so interior is on the left.
    // Each grid edge is a segment from a corner to adjacent corner.
    type Edge = [number, number, number, number]; // x1 y1 x2 y2
    const edges: Edge[] = [];
    const n = this.size;

    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (regions[r][c] !== gId) continue;
        const x = c * cs, y = r * cs;
        // top edge (exterior if r=0 or cell above is different region) → left-to-right
        if (r === 0 || regions[r - 1][c] !== gId)
          edges.push([x, y, x + cs, y]);
        // right edge → top-to-bottom
        if (c === n - 1 || regions[r][c + 1] !== gId)
          edges.push([x + cs, y, x + cs, y + cs]);
        // bottom edge → right-to-left
        if (r === n - 1 || regions[r + 1][c] !== gId)
          edges.push([x + cs, y + cs, x, y + cs]);
        // left edge → bottom-to-top
        if (c === 0 || regions[r][c - 1] !== gId)
          edges.push([x, y + cs, x, y]);
      }
    }

    if (edges.length === 0) return;

    // Chain edges into one or more closed loops by linking end-to-start.
    const key = (x: number, y: number) => `${x},${y}`;
    const edgeMap = new Map<string, Edge[]>();
    for (const e of edges) {
      const k = key(e[0], e[1]);
      if (!edgeMap.has(k)) edgeMap.set(k, []);
      edgeMap.get(k)!.push(e);
    }

    const used = new Set<Edge>();
    const loops: Array<Array<[number, number]>> = [];

    for (const startEdge of edges) {
      if (used.has(startEdge)) continue;
      const loop: Array<[number, number]> = [];
      let cur = startEdge;
      while (!used.has(cur)) {
        used.add(cur);
        loop.push([cur[0], cur[1]]);
        const nexts = edgeMap.get(key(cur[2], cur[3]));
        if (!nexts) break;
        const next = nexts.find((e) => !used.has(e));
        if (!next) break;
        cur = next;
      }
      if (loop.length > 0) loops.push(loop);
    }

    // Draw each loop as a rounded path.
    for (const pts of loops) {
      const n2 = pts.length;
      if (n2 < 2) continue;

      // Helper: point along segment p→q at distance r2 from p.
      const lerp = (
        [ax, ay]: [number, number],
        [bx, by]: [number, number],
        t: number,
      ): [number, number] => [ax + (bx - ax) * t, ay + (by - ay) * t];
      const dist = ([ax, ay]: [number, number], [bx, by]: [number, number]) =>
        Math.sqrt((bx - ax) ** 2 + (by - ay) ** 2);

      // Start half-way into the first segment so we can use quadraticCurveTo at each corner.
      const firstSeg = dist(pts[0], pts[1 % n2]);
      const tStart = Math.min(0.5, r2 / Math.max(firstSeg, 1));
      const startPt = lerp(pts[0], pts[1 % n2], tStart);
      this.highlightLayer.moveTo(startPt[0], startPt[1]);

      for (let i = 1; i <= n2; i++) {
        const corner = pts[i % n2];
        const next = pts[(i + 1) % n2];
        const segLen = dist(corner, next);
        const t = Math.min(0.5, r2 / Math.max(segLen, 1));
        const endPt = lerp(corner, next, t);
        // Line to just before the corner, then curve around it.
        this.highlightLayer.lineTo(corner[0], corner[1]);
        this.highlightLayer.quadraticCurveTo(corner[0], corner[1], endPt[0], endPt[1]);
      }

      this.highlightLayer.closePath();
      this.highlightLayer.stroke({ color: 0x000000, width: borderW, alpha: 0.85, join: "round" });
    }
  }

  private drawConflictSquare(cx: number, cy: number, cs: number) {
    const half = cs * 0.45;
    const radius = cs * 0.12;
    const borderW = Math.max(2.5, cs * 0.055);

    // Drop shadow — same offset as the star.
    this.conflictLayer
      .roundRect(cx - half + 2.5, cy - half + 3, half * 2, half * 2, radius)
      .fill({ color: PALETTE_STAR_SHADOW, alpha: 0.35 });

    // Red body.
    this.conflictLayer
      .roundRect(cx - half, cy - half, half * 2, half * 2, radius)
      .fill({ color: PALETTE_STAR_CONFLICT_FILL, alpha: 0.9, });

    // Dark border.
    this.conflictLayer
      .roundRect(cx - half, cy - half, half * 2, half * 2, radius)
      .stroke({
        color: PALETTE_STAR_CONFLICT_BORDER,
        width: borderW,
        alpha: 0.9,
      });

    // Upper-left highlight tint — mirrors the star's sheen.
    const hHalf = half * 0.55;
    this.conflictLayer
      .roundRect(
        cx - half * 0.85,
        cy - half * 0.85,
        hHalf * 2,
        hHalf * 2,
        radius * 0.7,
      )
      .fill({ color: PALETTE_STAR_CONFLICT_HIGHLIGHT, alpha: 0.35 });
  }

  /** Win celebration: gentle bounce + sweep. */
  playWinAnimation(): Promise<void> {
    const stars: Graphics[] = [];
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        const sp = this.cellSprites[r][c];
        if (sp && sp.star.visible) stars.push(sp.star);
      }
    }
    return new Promise<void>((resolve) => {
      const tl = gsap.timeline({ onComplete: resolve });
      stars.forEach((star, i) => {
        tl.to(
          star.scale,
          {
            x: 1.35,
            y: 1.35,
            duration: 0.22,
            ease: "power2.out",
            yoyo: true,
            repeat: 1,
          },
          i * 0.04,
        );
      });
    });
  }

  override resize() {
    this.layout();
    this.drawAll();
    this.repositionMarks();
    this.redrawConflicts();
    this.redrawStarlessRegions();
  }

  override reset() {
    this.clearMarkSprites();
    this.conflictLayer.clear();
    gsap.killTweensOf(this.highlightLayer);
    this.highlightLayer.clear();
    this.highlightLayer.alpha = 1;
    this.conflictCells = new Set();
    this.lastStarlessIds = new Set();
    this.displayMarks = Array.from(
      { length: this.size },
      () => Array(this.size).fill(0) as Mark[],
    );
  }

  private layout() {
    const padding = Math.max(20, Layout.isMobile ? 12 : 40);
    const availW = Layout.screen.width - padding * 2;
    // Reserve top space for HUD.
    const topReserve = Layout.isMobile ? 96 : 110;
    const bottomReserve = Layout.isMobile ? 80 : 60;
    const availH =
      Layout.screen.height - padding * 2 - topReserve - bottomReserve;

    if (this.size === 0) return;

    this.cellSize = Math.floor(Math.min(availW, availH) / this.size);
    const boardLen = this.cellSize * this.size;
    this.boardX = (Layout.screen.width - boardLen) / 2;
    this.boardY = topReserve + (availH - boardLen) / 2 + padding;
    this.boardLayer.position.set(this.boardX, this.boardY);
  }

  private drawAll() {
    this.background
      .clear()
      .rect(0, 0, Layout.screen.width, Layout.screen.height)
      .fill({ color: PALETTE_BG });

    this.view.hitArea = new Rectangle(
      0,
      0,
      Layout.screen.width,
      Layout.screen.height,
    );

    if (this.size === 0) return;

    const regions = this.game.getRegions();
    const cs = this.cellSize;
    const len = cs * this.size;

    // Region fills.
    this.cellsLayer.clear();
    this.cellsLayer
      .roundRect(-6, -6, len + 12, len + 12, 14)
      .fill({ color: "#1a2147" });
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        const region = regions[r][c];
        const color = REGION_COLORS[region % REGION_COLORS.length];
        this.cellsLayer.rect(c * cs, r * cs, cs, cs).fill({ color });
      }
    }

    // Inner thin grid lines.
    this.gridLayer.clear();
    for (let i = 1; i < this.size; i++) {
      this.gridLayer
        .rect(i * cs - 0.5, 0, 1, len)
        .fill({ color: PALETTE_GRID_LINE, alpha: 0.35 });
      this.gridLayer
        .rect(0, i * cs - 0.5, len, 1)
        .fill({ color: PALETTE_GRID_LINE, alpha: 0.35 });
    }

    // Region borders (thick lines between cells with different region ids).
    this.bordersLayer.clear();
    const w = Math.max(3, Math.floor(cs * 0.06));
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        const id = regions[r][c];
        // top
        if (r === 0 || regions[r - 1][c] !== id) {
          this.bordersLayer
            .rect(c * cs - w / 2, r * cs - w / 2, cs + w, w)
            .fill({ color: PALETTE_REGION_BORDER });
        }
        // left
        if (c === 0 || regions[r][c - 1] !== id) {
          this.bordersLayer
            .rect(c * cs - w / 2, r * cs - w / 2, w, cs + w)
            .fill({ color: PALETTE_REGION_BORDER });
        }
        // bottom (last row only — interior bottoms are covered by next row's top)
        if (r === this.size - 1) {
          this.bordersLayer
            .rect(c * cs - w / 2, (r + 1) * cs - w / 2, cs + w, w)
            .fill({ color: PALETTE_REGION_BORDER });
        }
        // right (last col only)
        if (c === this.size - 1) {
          this.bordersLayer
            .rect((c + 1) * cs - w / 2, r * cs - w / 2, w, cs + w)
            .fill({ color: PALETTE_REGION_BORDER });
        }
      }
    }
  }

  private repositionMarks() {
    if (!this.cellSprites.length) return;
    const cs = this.cellSize;
    const scale = this.markScale();
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        const sp = this.cellSprites[r][c];
        if (!sp) continue;
        const cx = c * cs + cs / 2;
        const cy = r * cs + cs / 2;
        sp.star.position.set(cx, cy);
        sp.cross.position.set(cx, cy);
        // Kill in-flight scale tweens — resize wins.
        gsap.killTweensOf(sp.star.scale);
        gsap.killTweensOf(sp.cross.scale);
        sp.star.scale.set(sp.star.visible ? scale : 0);
        sp.cross.scale.set(sp.cross.visible ? scale : 0);
      }
    }
  }

  private clearMarkSprites() {
    this.marksLayer.removeChildren().forEach((c) => c.destroy());
    this.cellSprites = [];
  }

  /** Build a soft "sticker" star path: rounded points via cubic-bezier corners. */
  private starStickerPath(g: Graphics, outer: number, inner: number) {
    // Compute the 10 star vertices, then connect with quadratic curves so
    // every corner (both points and valleys) is rounded.
    const points = 5;
    const verts: Array<[number, number]> = [];
    for (let i = 0; i < points * 2; i++) {
      const angle = (Math.PI / points) * i - Math.PI / 2;
      const r = i % 2 === 0 ? outer : inner;
      verts.push([Math.cos(angle) * r, Math.sin(angle) * r]);
    }
    const lerp = (
      a: [number, number],
      b: [number, number],
      t: number,
    ): [number, number] => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    // Round amount: how far along each edge to start/stop the corner curve.
    const round = 0.32;
    const n = verts.length;
    const start = lerp(verts[0], verts[1], round);
    g.moveTo(start[0], start[1]);
    for (let i = 0; i < n; i++) {
      const cur = verts[i];
      const next = verts[(i + 1) % n];
      const after = verts[(i + 2) % n];
      const lineEnd = lerp(cur, next, 1 - round);
      const curveEnd = lerp(next, after, round);
      g.lineTo(lineEnd[0], lineEnd[1]);
      g.quadraticCurveTo(next[0], next[1], curveEnd[0], curveEnd[1]);
    }
    g.closePath();
  }

  private makeStar(conflict = false): Graphics {
    const g = new Graphics();
    const outer = 36;
    const inner = 18;
    const fill = conflict ? PALETTE_STAR_CONFLICT_FILL : PALETTE_STAR_FILL;
    const border = conflict
      ? PALETTE_STAR_CONFLICT_BORDER
      : PALETTE_STAR_BORDER;
    const highlight = conflict
      ? PALETTE_STAR_CONFLICT_HIGHLIGHT
      : PALETTE_STAR_HIGHLIGHT;

    // Drop shadow — same shape, offset & translucent dark.
    g.translateTransform(2.5, 3);
    this.starStickerPath(g, outer, inner);
    g.fill({ color: PALETTE_STAR_SHADOW, alpha: 0.35 });
    g.translateTransform(-2.5, -3);

    // Sticker body with thick dark border.
    this.starStickerPath(g, outer, inner);
    g.fill({ color: fill });
    this.starStickerPath(g, outer, inner);
    g.stroke({ color: border, width: 3, alpha: 0.9 });

    // Soft highlight in the upper-left for sticker sheen.
    g.translateTransform(-7, -8);
    this.starStickerPath(g, outer * 0.55, inner * 0.55);
    g.fill({ color: highlight, alpha: 0.45 });
    g.translateTransform(7, 8);

    return g;
  }

  private makeCross(): Graphics {
    const g = new Graphics();
    const arm = 18;
    const w = 7;
    const draw = (color: string, alpha: number) => {
      g.moveTo(-arm, -arm)
        .lineTo(arm, arm)
        .stroke({ color, width: w, alpha, cap: "round" });
      g.moveTo(arm, -arm)
        .lineTo(-arm, arm)
        .stroke({ color, width: w, alpha, cap: "round" });
    };
    // Drop shadow.
    g.translateTransform(1.5, 2);
    draw(PALETTE_CROSS_SHADOW, 0.35);
    g.translateTransform(-1.5, -2);
    // Cross.
    draw(PALETTE_CROSS, 0.95);
    return g;
  }

  private localToCell(e: FederatedPointerEvent): [number, number] | null {
    const local = e.getLocalPosition(this.boardLayer);
    if (local.x < 0 || local.y < 0) return null;
    const c = Math.floor(local.x / this.cellSize);
    const r = Math.floor(local.y / this.cellSize);
    if (r < 0 || r >= this.size || c < 0 || c >= this.size) return null;
    return [r, c];
  }

  private onPointerTap = (e: FederatedPointerEvent) => {
    if (!this.interactive) return;
    const cell = this.localToCell(e);
    if (!cell) return;
    events.emit(Events.CellTapped, { row: cell[0], col: cell[1] });
  };
}
