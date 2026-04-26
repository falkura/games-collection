import { Container, Graphics, FederatedPointerEvent, Rectangle } from "pixi.js";
import gsap from "gsap";
import { Layout } from "@falkura-pet/engine";
import { Connect4 } from "../Connect4";
import { Board, COLS, ROWS, dropRow } from "../logic/board";
import { events, Events } from "../events";
import { System } from "./System";

const PALETTE = {
  bg: "#0b1024",
  board: "#1d3a8a",
  hole: "#0a1432",
  p1: "#ff5577",
  p2: "#ffcc33",
  hover: 0xffffff,
  winRing: 0x00ffaa,
};

export class BoardSystem extends System<Connect4> {
  static MODULE_ID = "board";

  private background: Graphics;
  private boardLayer: Container;
  private holesGraphic: Graphics;
  private hoverHighlight: Graphics;
  private piecesLayer: Container;
  private winLayer: Graphics;

  /** Disc graphics indexed by [row][col]. */
  private discs: Array<Array<Graphics | null>> = [];

  private cellSize = 0;
  private boardX = 0;
  private boardY = 0;
  private hoverCol = -1;
  private interactive = false;

  override build() {
    this.background = new Graphics();
    this.view.addChild(this.background);

    this.boardLayer = new Container();
    this.view.addChild(this.boardLayer);

    this.holesGraphic = new Graphics();
    this.holesGraphic.eventMode = "none";
    this.boardLayer.addChild(this.holesGraphic);

    this.hoverHighlight = new Graphics();
    this.hoverHighlight.alpha = 0;
    this.boardLayer.addChild(this.hoverHighlight);

    this.piecesLayer = new Container();
    this.piecesLayer.eventMode = "none";
    this.boardLayer.addChild(this.piecesLayer);

    this.winLayer = new Graphics();
    this.winLayer.eventMode = "none";
    this.boardLayer.addChild(this.winLayer);

    for (let r = 0; r < ROWS; r++) {
      this.discs.push(Array<Graphics | null>(COLS).fill(null));
    }

    this.view.eventMode = "static";
    this.view.cursor = "pointer";
    this.view.on("pointermove", this.onPointerMove);
    this.view.on("pointerleave", this.onPointerLeave);
    this.view.on("pointertap", this.onPointerTap);
  }

  override resize() {
    const padding = 40;
    const availW = Layout.screen.width - padding * 2;
    const availH = Layout.screen.height - padding * 2;
    this.cellSize = Math.floor(Math.min(availW / COLS, availH / (ROWS + 1)));

    const boardW = this.cellSize * COLS;
    const boardH = this.cellSize * ROWS;
    this.boardX = (Layout.screen.width - boardW) / 2;
    this.boardY = (Layout.screen.height - boardH) / 2 + this.cellSize / 2;

    this.background
      .clear()
      .rect(0, 0, Layout.screen.width, Layout.screen.height)
      .fill({ color: PALETTE.bg });

    this.view.hitArea = new Rectangle(
      0,
      0,
      Layout.screen.width,
      Layout.screen.height,
    );

    this.boardLayer.position.set(this.boardX, this.boardY);

    // Board with carved holes
    this.holesGraphic
      .clear()
      .roundRect(0, 0, boardW, boardH, this.cellSize * 0.15)
      .fill({ color: PALETTE.board });

    const radius = this.cellSize * 0.42;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        this.holesGraphic
          .circle(
            c * this.cellSize + this.cellSize / 2,
            r * this.cellSize + this.cellSize / 2,
            radius,
          )
          .fill({ color: PALETTE.hole });
      }
    }

    // Hover highlight
    this.hoverHighlight
      .clear()
      .rect(0, -this.cellSize, this.cellSize, boardH + this.cellSize)
      .fill({ color: PALETTE.hover, alpha: 0.08 });

    // Reposition existing discs
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const d = this.discs[r][c];
        if (!d) continue;
        d.position.set(
          c * this.cellSize + this.cellSize / 2,
          r * this.cellSize + this.cellSize / 2,
        );
        d.scale.set(this.cellSize / 100);
      }
    }

    const win = this.game.getWinCells();
    this.winLayer.clear();
    if (win) this.highlightWin(win);
  }

  override reset() {
    this.clearBoard();
  }

  setInteractive(value: boolean) {
    this.interactive = value;
    this.view.cursor = value ? "pointer" : "default";
    if (!value) {
      this.hoverCol = -1;
      this.hoverHighlight.alpha = 0;
    }
  }

  /** Animate a disc dropping into (row, col) for player. Returns a promise that resolves on landing. */
  dropDisc(row: number, col: number, player: 1 | 2): Promise<void> {
    const disc = this.makeDisc(player);
    const targetX = col * this.cellSize + this.cellSize / 2;
    const targetY = row * this.cellSize + this.cellSize / 2;
    disc.position.set(targetX, -this.cellSize);
    this.piecesLayer.addChild(disc);
    this.discs[row][col] = disc;

    const fallDistance = targetY - -this.cellSize;
    const duration = Math.min(0.18 + fallDistance / 4000, 0.55);

    return new Promise<void>((resolve) => {
      gsap.to(disc.position, {
        y: targetY,
        duration,
        ease: "bounce.out",
        onComplete: () => resolve(),
      });
    });
  }

  highlightWin(cells: Array<[number, number]>) {
    this.winLayer.clear();
    for (const [r, c] of cells) {
      this.winLayer
        .circle(
          c * this.cellSize + this.cellSize / 2,
          r * this.cellSize + this.cellSize / 2,
          this.cellSize * 0.46,
        )
        .stroke({ color: PALETTE.winRing, width: 6, alpha: 0.95 });
    }
  }

  private clearBoard() {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const d = this.discs[r][c];
        if (d) {
          d.destroy();
          this.discs[r][c] = null;
        }
      }
    }
    this.winLayer.clear();
  }

  private makeDisc(player: 1 | 2): Graphics {
    const color = player === 1 ? PALETTE.p1 : PALETTE.p2;
    const g = new Graphics();
    g.circle(0, 0, 42).fill({ color });
    g.circle(0, 0, 42).stroke({ color: 0xffffff, width: 4, alpha: 0.25 });
    g.scale.set(this.cellSize / 100);
    return g;
  }

  private localToCol(e: FederatedPointerEvent): number {
    const local = e.getLocalPosition(this.boardLayer);
    if (local.x < 0) return -1;
    const c = Math.floor(local.x / this.cellSize);
    return c >= 0 && c < COLS ? c : -1;
  }

  private onPointerMove = (e: FederatedPointerEvent) => {
    if (!this.interactive) return;
    const col = this.localToCol(e);
    if (col === this.hoverCol) return;
    this.hoverCol = col;
    if (col === -1) {
      this.hoverHighlight.alpha = 0;
    } else {
      this.hoverHighlight.alpha = 1;
      this.hoverHighlight.position.set(col * this.cellSize, 0);
    }
  };

  private onPointerLeave = () => {
    this.hoverCol = -1;
    this.hoverHighlight.alpha = 0;
  };

  private onPointerTap = (e: FederatedPointerEvent) => {
    if (!this.interactive) return;
    const col = this.localToCol(e);
    if (col === -1) return;
    const board = this.game.getBoard();
    if (dropRow(board, col) < 0) return;
    events.emit(Events.ColumnSelected, { col });
  };
}

/* Quick helper so the system file doesn't need to know about the full Board type at import time */
export type { Board };
