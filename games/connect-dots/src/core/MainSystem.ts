import { System } from "@falkura-pet/game-base";
import { Engine } from "@falkura-pet/engine";
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

type PathMap = Map<string, Cell[]>;

const BG = {
  page: "#08111f",
  panel: "#0f1b2f",
  panelStroke: "#2a3e62",
  board: "#0b1627",
  boardInset: "#142338",
  cell: "#0f2138",
  grid: "#28415f",
  text: "#f8fafc",
  muted: "#9fb3c8",
  accent: "#7dd3fc",
  success: "#34d399",
};

const LABEL_PALETTE = [
  "#ef4444", // red
  "#22c55e", // green
  "#3b82f6", // blue
  "#eab308", // yellow
  "#a855f7", // purple
  "#f97316", // orange
  "#06b6d4", // cyan
  "#ec4899", // pink
  "#84cc16", // lime
  "#14b8a6", // teal
  "#f59e0b", // amber
  "#8b5cf6", // violet
];

export class MainSystem extends System<ConnectDots> {
  static MODULE_ID = "main";

  private readonly levels = getLevels();

  private levelIndex = 0;
  private currentLevel!: Level;
  private paths: PathMap = new Map();
  private occupancy = new Map<string, string>();
  private endpointOwner = new Map<string, string>();

  private draggingColor: string | null = null;

  private boardRoot!: Container;
  private boardChrome!: Graphics;
  private cellsView!: Graphics;
  private pathsView!: Graphics;
  private endpointsView!: Container;

  private boardX = 0;
  private boardY = 0;
  private cellSize = 32;
  private boardPixelWidth = 0;
  private boardPixelHeight = 0;
  private boardPadding = 18;

  get levelCount(): number {
    return this.levels.length;
  }

  get levelNumber(): number {
    return this.levelIndex + 1;
  }

  get levelTitle(): string {
    return this.currentLevel?.title ?? "";
  }

  get levelMeta(): string {
    if (!this.currentLevel) return "";
    return `${this.currentLevel.width}x${this.currentLevel.height}`;
  }

  get levelSource(): string {
    return this.currentLevel?.source ?? "";
  }

  override start(): void {
    if (!this.boardRoot) this.build();
    if (!this.currentLevel) {
      this.loadLevel(loadLevelIndex(this.levels.length));
      return;
    }

    this.resetLevel();
    this.drawStatic();
    this.resize();
  }

  override reset(): void {
    this.draggingColor = null;
    this.paths.clear();
    this.occupancy.clear();
    this.endpointOwner.clear();
  }

  override resize(): void {
    if (!this.boardRoot || !this.currentLevel) return;

    const { width, height } = Engine.layout.screen;
    const mobile = Engine.layout.isMobile;

    this.view.hitArea = new Rectangle(0, 0, width, height);
    const topReserved = mobile ? 210 : 148;
    const bottomReserved = mobile ? 150 : 118;
    const availableWidth = width - 64;
    const availableHeight = height - topReserved - bottomReserved;
    const boardScale = Math.min(
      availableWidth / this.currentLevel.width,
      availableHeight / this.currentLevel.height,
    );

    this.cellSize = Math.max(18, Math.floor(boardScale));
    this.boardPadding = mobile ? 22 : 18;
    this.boardPixelWidth = this.currentLevel.width * this.cellSize;
    this.boardPixelHeight = this.currentLevel.height * this.cellSize;
    this.boardX = Math.round((width - this.boardPixelWidth) / 2);
    this.boardY = Math.round(
      topReserved + (availableHeight - this.boardPixelHeight) / 2,
    );

    this.boardRoot.position.set(this.boardX, this.boardY);
    this.boardRoot.hitArea = new Rectangle(
      0,
      0,
      this.boardPixelWidth,
      this.boardPixelHeight,
    );

    this.drawStatic();
    this.drawDynamic();
  }

  private build() {
    this.boardChrome = new Graphics();
    this.boardChrome.zIndex = 0;
    this.view.addChild(this.boardChrome);

    this.boardRoot = new Container();
    this.boardRoot.zIndex = 1;
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
    this.endpointOwner = new Map();

    for (const label of this.currentLevel.labels) {
      for (const cell of this.currentLevel.endpoints[label]) {
        this.endpointOwner.set(this.cellKey(cell), label);
      }
    }

    this.resetLevel();
    this.resize();
  }

  resetLevel() {
    this.draggingColor = null;
    this.paths = new Map();
    this.occupancy = new Map();
    if (this.pathsView) this.drawDynamic();
  }

  private drawStatic() {
    if (!this.currentLevel) return;

    const { width, height } = Engine.layout.screen;

    this.boardChrome.clear();
    this.boardChrome.rect(0, 0, width, height).fill(BG.page);
    this.boardChrome
      .roundRect(
        this.boardX - this.boardPadding,
        this.boardY - this.boardPadding,
        this.boardPixelWidth + this.boardPadding * 2,
        this.boardPixelHeight + this.boardPadding * 2,
        26,
      )
      .fill({ color: BG.panel, alpha: 0.92 })
      .stroke({ color: BG.panelStroke, width: 2, alpha: 0.9 });

    this.drawCells();
    this.drawEndpoints();
  }

  private drawCells() {
    this.cellsView.clear();
    this.cellsView
      .rect(0, 0, this.boardPixelWidth, this.boardPixelHeight)
      .fill(BG.boardInset)
      .stroke({ color: BG.panelStroke, width: 2, alpha: 0.7 });

    for (let y = 0; y < this.currentLevel.height; y++) {
      for (let x = 0; x < this.currentLevel.width; x++) {
        this.cellsView
          .rect(
            x * this.cellSize + 1,
            y * this.cellSize + 1,
            this.cellSize - 2,
            this.cellSize - 2,
          )
          .fill({ color: BG.cell, alpha: 0.75 });
      }
    }

    for (let x = 0; x <= this.currentLevel.width; x++) {
      this.cellsView
        .moveTo(x * this.cellSize, 0)
        .lineTo(x * this.cellSize, this.boardPixelHeight);
    }
    for (let y = 0; y <= this.currentLevel.height; y++) {
      this.cellsView
        .moveTo(0, y * this.cellSize)
        .lineTo(this.boardPixelWidth, y * this.cellSize);
    }
    this.cellsView.stroke({
      color: BG.grid,
      width: 1,
      alpha: 0.55,
      pixelLine: true,
    });
  }

  private drawDynamic() {
    this.pathsView.clear();
    const strokeWidth = this.cellSize * 0.38;

    for (const label of this.currentLevel.labels) {
      const path = this.paths.get(label);
      if (!path || path.length < 2) continue;
      const color = this.colorForLabel(label);

      const first = this.cellCenter(path[0]);
      this.pathsView.moveTo(first.x, first.y);
      for (let i = 1; i < path.length; i++) {
        const point = this.cellCenter(path[i]);
        this.pathsView.lineTo(point.x, point.y);
      }
      this.pathsView.stroke({
        color,
        width: strokeWidth,
        alpha: 0.9,
        cap: "round",
        join: "round",
      });
    }
  }

  private drawEndpoints() {
    for (const child of this.endpointsView.removeChildren()) child.destroy();

    const fontSize = Math.max(10, Math.floor(this.cellSize * 0.36));

    for (const label of this.currentLevel.labels) {
      const color = this.colorForLabel(label);
      for (const cell of this.currentLevel.endpoints[label]) {
        const center = this.cellCenter(cell);
        const dot = new Graphics();
        dot.circle(0, 0, this.cellSize * 0.34).fill({ color });
        dot.position.set(center.x, center.y);

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
        text.position.set(center.x, center.y);

        this.endpointsView.addChild(dot, text);
      }
    }
  }

  private onPointerDown = (event: FederatedPointerEvent) => {
    const cell = this.eventToCell(event);
    if (!cell) return;

    // Resume an in-progress path when its last-drawn cell is tapped —
    // lets the player pick the pen back up without retracing from the endpoint.
    for (const [label, path] of this.paths) {
      if (path.length === 0) continue;
      if (!this.sameCell(cell, path[path.length - 1])) continue;
      if (this.isClosedPath(label, path)) continue;
      this.draggingColor = label;
      return;
    }

    const label = this.endpointOwner.get(this.cellKey(cell));
    if (!label) return;

    this.draggingColor = label;
    this.paths.set(label, [cell]);
    this.rebuildOccupancy();
    this.drawDynamic();
  };

  private onPointerMove = (event: FederatedPointerEvent) => {
    if (!this.draggingColor) return;
    const cell = this.eventToCell(event);
    if (!cell) return;

    const path = this.paths.get(this.draggingColor);
    if (!path || path.length === 0) return;

    const last = path[path.length - 1];
    if (this.sameCell(cell, last)) return;

    if (!this.isAdjacent(cell, last)) return;

    if (path.length > 1 && this.sameCell(cell, path[path.length - 2])) {
      path.pop();
      this.rebuildOccupancy();
      this.drawDynamic();
      return;
    }

    if (this.isClosedPath(this.draggingColor, path)) return;

    const targetOwner = this.endpointOwner.get(this.cellKey(cell));
    if (targetOwner && targetOwner !== this.draggingColor) return;

    const occupiedBy = this.occupancy.get(this.cellKey(cell));
    if (occupiedBy && occupiedBy !== this.draggingColor) return;

    const seenIndex = path.findIndex((item) => this.sameCell(item, cell));
    if (seenIndex >= 0) {
      path.splice(seenIndex + 1);
    } else {
      if (targetOwner === this.draggingColor) {
        const [a, b] = this.currentLevel.endpoints[this.draggingColor];
        const start = path[0];
        const opposite = this.sameCell(start, a) ? b : a;
        if (!this.sameCell(cell, opposite)) return;
      }
      path.push(cell);
    }

    this.rebuildOccupancy();
    this.drawDynamic();
  };

  private onPointerUp = () => {
    this.draggingColor = null;

    this.isSolved() && this.game.onSolved();
  };

  private eventToCell(event: FederatedPointerEvent): Cell | null {
    const local = this.boardRoot.toLocal(event.global, undefined, new Point());
    if (
      local.x < 0 ||
      local.y < 0 ||
      local.x >= this.boardPixelWidth ||
      local.y >= this.boardPixelHeight
    ) {
      return null;
    }

    const x = Math.floor(local.x / this.cellSize);
    const y = Math.floor(local.y / this.cellSize);
    if (
      x < 0 ||
      y < 0 ||
      x >= this.currentLevel.width ||
      y >= this.currentLevel.height
    ) {
      return null;
    }
    return { x, y };
  }

  private rebuildOccupancy() {
    this.occupancy.clear();
    for (const [label, path] of this.paths) {
      for (const cell of path) {
        this.occupancy.set(this.cellKey(cell), label);
      }
    }
  }

  private isSolved(): boolean {
    for (const label of this.currentLevel.labels) {
      const path = this.paths.get(label);
      if (!path || !this.isClosedPath(label, path)) return false;
    }
    return (
      this.occupancy.size === this.currentLevel.width * this.currentLevel.height
    );
  }

  private isClosedPath(label: string, path: Cell[]): boolean {
    if (path.length < 2) return false;
    const [a, b] = this.currentLevel.endpoints[label];
    const start = path[0];
    const end = path[path.length - 1];
    return (
      (this.sameCell(start, a) && this.sameCell(end, b)) ||
      (this.sameCell(start, b) && this.sameCell(end, a))
    );
  }

  private cellCenter(cell: Cell): Point {
    return new Point(
      cell.x * this.cellSize + this.cellSize / 2,
      cell.y * this.cellSize + this.cellSize / 2,
    );
  }

  private colorForLabel(label: string): string {
    const index = this.currentLevel.labels.indexOf(label);
    return LABEL_PALETTE[index % LABEL_PALETTE.length];
  }

  private cellKey(cell: Cell): string {
    return `${cell.x},${cell.y}`;
  }

  prevLevel() {
    this.loadLevel(
      (this.levelIndex - 1 + this.levels.length) % this.levels.length,
    );
  }

  nextLevel() {
    this.loadLevel((this.levelIndex + 1) % this.levels.length);
  }

  goToLevel(levelNumber: number) {
    const index = Math.max(
      0,
      Math.min(this.levels.length - 1, Math.floor(levelNumber) - 1),
    );
    this.loadLevel(index);
  }

  private sameCell(a: Cell, b: Cell): boolean {
    return a.x === b.x && a.y === b.y;
  }

  private isAdjacent(a: Cell, b: Cell): boolean {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) === 1;
  }
}
