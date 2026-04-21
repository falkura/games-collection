import { Engine, Layout, System } from "@falkura-pet/engine";
import {
  Container,
  FederatedPointerEvent,
  Graphics,
  Point,
  Rectangle,
  Text,
} from "pixi.js";
import { ConnectDots } from "../ConnectDots";
import { getLevels } from "../levels";
import { loadLevelIndex, saveLevelIndex } from "../progress";
import type { Cell, Level } from "../types";

const BG = {
  page: "#08111f",
  panel: "#0f1b2f",
  panelStroke: "#2a3e62",
  boardInset: "#142338",
  cell: "#0f2138",
  grid: "#28415f",
};

const PALETTE = [
  "#ef4444",
  "#22c55e",
  "#3b82f6",
  "#eab308",
  "#a855f7",
  "#f97316",
  "#06b6d4",
  "#ec4899",
  "#84cc16",
  "#14b8a6",
  "#f59e0b",
  "#8b5cf6",
];

export class MainSystem extends System<ConnectDots> {
  static MODULE_ID = "main";

  private readonly levels = getLevels();
  private levelIndex = 0;
  private currentLevel: Level;

  private paths = new Map<string, Cell[]>();
  private dragging: string | null = null;

  private boardRoot: Container;
  private chrome: Graphics;
  private cellsView: Graphics;
  private pathsView: Graphics;
  private endpointsView: Container;
  private cellSize = 32;

  get levelCount() {
    return this.levels.length;
  }

  get levelNumber() {
    return this.levelIndex + 1;
  }

  get levelTitle() {
    return this.currentLevel?.title ?? "";
  }

  get levelSource() {
    return this.currentLevel?.source ?? "";
  }

  override start(): void {
    if (!this.currentLevel) {
      this.loadLevel(loadLevelIndex(this.levels.length));
    }
  }

  override reset(): void {
    this.resetLevel();
  }

  override resize(): void {
    this.layoutBoard();
  }

  resetLevel() {
    this.dragging = null;
    this.paths.clear();
    this.drawPaths();
  }

  nextLevel() {
    this.loadLevel((this.levelIndex + 1) % this.levels.length);
  }

  goToLevel(levelNumber: number) {
    const clamped = Math.max(
      1,
      Math.min(this.levels.length, Math.floor(levelNumber)),
    );
    this.loadLevel(clamped - 1);
  }

  override build() {
    this.chrome = new Graphics();
    this.view.addChild(this.chrome);

    this.boardRoot = new Container();
    this.boardRoot.eventMode = "static";
    this.boardRoot.cursor = "crosshair";
    this.boardRoot.on("pointerdown", this.onPointerDown);
    this.boardRoot.on("globalpointermove", this.onPointerMove);
    this.boardRoot.on("pointerup", this.onPointerUp);
    this.boardRoot.on("pointerupoutside", this.onPointerUp);
    this.boardRoot.on("pointercancel", this.onPointerUp);
    this.view.addChild(this.boardRoot);

    this.cellsView = new Graphics();
    this.pathsView = new Graphics();
    this.endpointsView = new Container();
    this.boardRoot.addChild(this.cellsView, this.pathsView, this.endpointsView);
  }

  private loadLevel(index: number) {
    this.levelIndex = index;
    this.currentLevel = this.levels[index];
    saveLevelIndex(index);
    this.resetLevel();
    this.layoutBoard();
  }

  private layoutBoard() {
    if (!this.boardRoot || !this.currentLevel) return;

    const mobile = Layout.isMobile;
    const top = mobile ? 210 : 148;
    const bottom = mobile ? 150 : 118;
    const pad = mobile ? 22 : 18;
    const availW = Layout.screen.width - 64;
    const availH = Layout.screen.height - top - bottom;

    this.cellSize = Math.max(
      18,
      Math.floor(
        Math.min(
          availW / this.currentLevel.width,
          availH / this.currentLevel.height,
        ),
      ),
    );
    const boardW = this.currentLevel.width * this.cellSize;
    const boardH = this.currentLevel.height * this.cellSize;
    const x = Math.round((Layout.screen.width - boardW) / 2);
    const y = Math.round(top + (availH - boardH) / 2);

    this.view.hitArea = new Rectangle(
      Layout.screen.x,
      Layout.screen.y,
      Layout.screen.width,
      Layout.screen.height,
    );
    this.boardRoot.position.set(x, y);
    this.boardRoot.hitArea = new Rectangle(0, 0, boardW, boardH);

    this.chrome
      .clear()
      .rect(0, 0, Layout.screen.width, Layout.screen.height)
      .fill(BG.page)
      .roundRect(x - pad, y - pad, boardW + pad * 2, boardH + pad * 2, 26)
      .fill({ color: BG.panel, alpha: 0.92 })
      .stroke({ color: BG.panelStroke, width: 2, alpha: 0.9 });

    this.drawCells(boardW, boardH);
    this.drawEndpoints();
    this.drawPaths();
  }

  private drawCells(boardW: number, boardH: number) {
    const { width, height } = this.currentLevel;
    const s = this.cellSize;

    this.cellsView
      .clear()
      .rect(0, 0, boardW, boardH)
      .fill(BG.boardInset)
      .stroke({ color: BG.panelStroke, width: 2, alpha: 0.7 });

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        this.cellsView
          .rect(x * s + 1, y * s + 1, s - 2, s - 2)
          .fill({ color: BG.cell, alpha: 0.75 });
      }
    }

    for (let x = 0; x <= width; x++) {
      this.cellsView.moveTo(x * s, 0).lineTo(x * s, boardH);
    }
    for (let y = 0; y <= height; y++) {
      this.cellsView.moveTo(0, y * s).lineTo(boardW, y * s);
    }
    this.cellsView.stroke({
      color: BG.grid,
      width: 1,
      alpha: 0.55,
      pixelLine: true,
    });
  }

  private drawEndpoints() {
    for (const child of this.endpointsView.removeChildren()) child.destroy();
    const fontSize = Math.max(10, Math.floor(this.cellSize * 0.36));

    for (const label of this.currentLevel.labels) {
      const color = this.colorOf(label);
      for (const cell of this.currentLevel.endpoints[label]) {
        const center = this.cellCenter(cell);
        const dot = new Graphics()
          .circle(0, 0, this.cellSize * 0.34)
          .fill({ color });
        dot.position.copyFrom(center);

        const text = new Text({
          text: label,
          style: {
            fill: "#ffffff",
            fontFamily: "monospace",
            fontWeight: "bold",
            fontSize,
          },
        });
        text.anchor.set(0.5);
        text.position.copyFrom(center);

        this.endpointsView.addChild(dot, text);
      }
    }
  }

  private drawPaths() {
    if (!this.pathsView) return;
    this.pathsView.clear();
    const w = this.cellSize * 0.38;

    for (const [label, path] of this.paths) {
      if (path.length < 2) continue;
      const start = this.cellCenter(path[0]);
      this.pathsView.moveTo(start.x, start.y);
      for (let i = 1; i < path.length; i++) {
        const p = this.cellCenter(path[i]);
        this.pathsView.lineTo(p.x, p.y);
      }
      this.pathsView.stroke({
        color: this.colorOf(label),
        width: w,
        alpha: 0.9,
        cap: "round",
        join: "round",
      });
    }
  }

  // --- interaction ---

  private onPointerDown = (event: FederatedPointerEvent) => {
    const cell = this.eventToCell(event);
    if (!cell) return;

    // Resume drawing if the tapped cell is the open end of a path.
    for (const [label, path] of this.paths) {
      const last = path[path.length - 1];
      if (last && sameCell(cell, last) && !this.isClosed(label, path)) {
        this.dragging = label;
        return;
      }
    }

    const owner = this.endpointAt(cell);
    if (!owner) return;

    this.dragging = owner;
    this.paths.set(owner, [cell]);
    this.drawPaths();
  };

  private onPointerMove = (event: FederatedPointerEvent) => {
    if (!this.dragging) return;
    const cell = this.eventToCell(event);
    if (!cell) return;

    const path = this.paths.get(this.dragging);
    if (!path?.length) return;

    const last = path[path.length - 1];
    if (sameCell(cell, last) || !isAdjacent(cell, last)) return;

    // Step back: moved onto the previous cell.
    if (path.length > 1 && sameCell(cell, path[path.length - 2])) {
      path.pop();
      this.drawPaths();
      return;
    }

    if (this.isClosed(this.dragging, path)) return;

    // Blocked by another color's endpoint or path.
    const endpointOwner = this.endpointAt(cell);
    if (endpointOwner && endpointOwner !== this.dragging) return;
    const pathOwner = this.pathOwnerAt(cell);
    if (pathOwner && pathOwner !== this.dragging) return;

    // Crossing own path: trim to that point.
    const seen = path.findIndex((c) => sameCell(c, cell));
    if (seen >= 0) {
      path.splice(seen + 1);
      this.drawPaths();
      return;
    }

    // Landing on own endpoint only valid if it's the opposite one.
    if (endpointOwner === this.dragging) {
      const [a, b] = this.currentLevel.endpoints[this.dragging];
      const opposite = sameCell(path[0], a) ? b : a;
      if (!sameCell(cell, opposite)) return;
    }

    path.push(cell);
    this.drawPaths();
  };

  private onPointerUp = () => {
    this.dragging = null;
    if (this.isSolved()) this.game.onSolved();
  };

  // --- queries ---

  private endpointAt(cell: Cell): string | undefined {
    for (const label of this.currentLevel.labels) {
      const [a, b] = this.currentLevel.endpoints[label];
      if (sameCell(cell, a) || sameCell(cell, b)) return label;
    }
  }

  private pathOwnerAt(cell: Cell): string | undefined {
    for (const [label, path] of this.paths) {
      if (path.some((c) => sameCell(c, cell))) return label;
    }
  }

  private isSolved(): boolean {
    let total = 0;
    for (const label of this.currentLevel.labels) {
      const path = this.paths.get(label);
      if (!path || !this.isClosed(label, path)) return false;
      total += path.length;
    }
    return total === this.currentLevel.width * this.currentLevel.height;
  }

  private isClosed(label: string, path: Cell[]): boolean {
    if (path.length < 2) return false;
    const [a, b] = this.currentLevel.endpoints[label];
    const start = path[0];
    const end = path[path.length - 1];
    return (
      (sameCell(start, a) && sameCell(end, b)) ||
      (sameCell(start, b) && sameCell(end, a))
    );
  }

  // --- utilities ---

  private eventToCell(event: FederatedPointerEvent): Cell | null {
    const local = this.boardRoot.toLocal(event.global, undefined, new Point());
    const x = Math.floor(local.x / this.cellSize);
    const y = Math.floor(local.y / this.cellSize);
    const { width, height } = this.currentLevel;
    if (x < 0 || y < 0 || x >= width || y >= height) return null;
    return { x, y };
  }

  private cellCenter(cell: Cell): Point {
    const half = this.cellSize / 2;
    return new Point(
      cell.x * this.cellSize + half,
      cell.y * this.cellSize + half,
    );
  }

  private colorOf(label: string): string {
    return PALETTE[this.currentLevel.labels.indexOf(label) % PALETTE.length];
  }
}

function sameCell(a: Cell, b: Cell): boolean {
  return a.x === b.x && a.y === b.y;
}

function isAdjacent(a: Cell, b: Cell): boolean {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) === 1;
}
