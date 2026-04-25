import { Container, Graphics, FederatedPointerEvent, Rectangle } from "pixi.js";
import gsap from "gsap";
import { Layout, System } from "@falkura-pet/engine";
import { StarBattle } from "../StarBattle";
import { events, Events, Mark } from "../events";

const PALETTE_BG = "#0b1024";
const PALETTE_GRID_LINE = "#1f2647";
const PALETTE_REGION_BORDER = "#f4f6ff";
const PALETTE_DOT = "#8893bd";
const PALETTE_STAR = "#ffd24a";
const PALETTE_STAR_GLOW = "#ffeb8a";
const PALETTE_CONFLICT = "#ff1840";
const PALETTE_CONFLICT_GLOW = "#ff5b6e";

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
  private bordersLayer: Graphics;
  private gridLayer: Graphics;
  private marksLayer: Container;
  private conflictLayer: Graphics;

  /** Display objects per cell: container with star + dot. */
  private cellSprites: Array<Array<{ star: Graphics; dot: Graphics } | null>> =
    [];

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
      Array<{ star: Graphics; dot: Graphics } | null>(size).fill(null),
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

  /** Animate setting a mark at (row, col). */
  setMark(row: number, col: number, mark: Mark): Promise<void> {
    if (!this.cellSprites[row]) return Promise.resolve();
    const existing = this.cellSprites[row][col];
    if (existing) {
      gsap.killTweensOf(existing.star.scale);
      gsap.killTweensOf(existing.dot.scale);
      gsap.killTweensOf(existing.star);
      gsap.killTweensOf(existing.dot);
      existing.star.destroy();
      existing.dot.destroy();
      this.cellSprites[row][col] = null;
    }
    if (mark === 0) return Promise.resolve();

    const cx = col * this.cellSize + this.cellSize / 2;
    const cy = row * this.cellSize + this.cellSize / 2;
    const target = this.markScale();

    const star = this.makeStar();
    const dot = this.makeDot();
    star.position.set(cx, cy);
    dot.position.set(cx, cy);
    this.marksLayer.addChild(dot, star);
    this.cellSprites[row][col] = { star, dot };

    if (mark === 2) {
      dot.visible = false;
      star.scale.set(0);
      star.alpha = 0;
      return new Promise<void>((resolve) => {
        gsap.to(star.scale, {
          x: target,
          y: target,
          duration: 0.32,
          ease: "back.out(2.4)",
          onComplete: () => resolve(),
        });
        gsap.to(star, { alpha: 1, duration: 0.18, ease: "power2.out" });
      });
    }

    // mark === 1 (dot)
    star.visible = false;
    dot.scale.set(0);
    dot.alpha = 0;
    return new Promise<void>((resolve) => {
      gsap.to(dot.scale, {
        x: target,
        y: target,
        duration: 0.18,
        ease: "back.out(2)",
        onComplete: () => resolve(),
      });
      gsap.to(dot, { alpha: 1, duration: 0.12, ease: "power2.out" });
    });
  }

  /** Scale factor to fit a 100-unit mark sprite into the current cell. */
  private markScale(): number {
    return this.cellSize / 100;
  }

  /** Highlight conflicting cells with a strong red overlay + ring; persists until cleared. */
  showConflicts(cells: Set<string>) {
    this.conflictLayer.clear();
    gsap.killTweensOf(this.conflictLayer.scale);
    this.conflictLayer.alpha = 1;
    this.conflictLayer.scale.set(1);
    if (cells.size === 0) return;
    const cs = this.cellSize;
    const r2 = cs * 0.16;
    const ringW = Math.max(5, Math.floor(cs * 0.09));
    for (const k of cells) {
      const [rs, ccs] = k.split(",");
      const r = Number(rs);
      const c = Number(ccs);
      const x = c * cs + ringW / 2;
      const y = r * cs + ringW / 2;
      const w = cs - ringW;
      const h = cs - ringW;
      // Outer glow halo.
      this.conflictLayer
        .roundRect(x - 3, y - 3, w + 6, h + 6, r2 + 3)
        .fill({ color: PALETTE_CONFLICT_GLOW, alpha: 0.35 });
      // Strong red fill.
      this.conflictLayer
        .roundRect(x, y, w, h, r2)
        .fill({ color: PALETTE_CONFLICT, alpha: 0.55 });
      // Hard bright ring.
      this.conflictLayer
        .roundRect(x, y, w, h, r2)
        .stroke({ color: PALETTE_CONFLICT, width: ringW, alpha: 1 });
      // Inner white edge for contrast.
      this.conflictLayer
        .roundRect(
          x + ringW / 2 + 1,
          y + ringW / 2 + 1,
          w - ringW - 2,
          h - ringW - 2,
          Math.max(0, r2 - ringW / 2),
        )
        .stroke({ color: 0xffffff, width: 1.5, alpha: 0.55 });
    }
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
  }

  override reset() {
    this.clearMarkSprites();
    this.conflictLayer.clear();
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
        sp.dot.position.set(cx, cy);
        // Kill in-flight scale tweens — resize wins.
        gsap.killTweensOf(sp.star.scale);
        gsap.killTweensOf(sp.dot.scale);
        sp.star.scale.set(sp.star.visible ? scale : 0);
        sp.dot.scale.set(sp.dot.visible ? scale : 0);
      }
    }
  }

  private clearMarkSprites() {
    this.marksLayer.removeChildren().forEach((c) => c.destroy());
    this.cellSprites = [];
  }

  private makeStar(): Graphics {
    const g = new Graphics();
    const points = 5;
    const outer = 36;
    const inner = 16;
    const path: number[] = [];
    for (let i = 0; i < points * 2; i++) {
      const angle = (Math.PI / points) * i - Math.PI / 2;
      const r = i % 2 === 0 ? outer : inner;
      path.push(Math.cos(angle) * r, Math.sin(angle) * r);
    }
    g.poly(path).fill({ color: PALETTE_STAR_GLOW });
    const inner2: number[] = [];
    for (let i = 0; i < points * 2; i++) {
      const angle = (Math.PI / points) * i - Math.PI / 2;
      const r = (i % 2 === 0 ? outer : inner) * 0.78;
      inner2.push(Math.cos(angle) * r, Math.sin(angle) * r);
    }
    g.poly(inner2).fill({ color: PALETTE_STAR });
    return g;
  }

  private makeDot(): Graphics {
    const g = new Graphics();
    g.circle(0, 0, 10).fill({ color: PALETTE_DOT, alpha: 0.85 });
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
