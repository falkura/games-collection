import { Container, Graphics } from "pixi.js";
import gsap from "gsap";
import { Rows } from "../server/payouts";

export interface BoardLayout {
  width: number;
  height: number;
  topY: number;
  bottomY: number;
  pegRadius: number;
  ballRadius: number;
  rowSpacingY: number;
  colSpacingX: number;
  pegs: { x: number; y: number; row: number; col: number }[];
  binCenters: { x: number; y: number }[];
  binWidth: number;
  binHeight: number;
}

export class Board extends Container {
  public layout: BoardLayout;
  public bins: Graphics[] = [];

  private pegLayer: Graphics;
  private binLayer: Container;
  private rows: Rows;
  private gradient: { edge: string; center: string };

  constructor() {
    super();
    this.pegLayer = new Graphics();
    this.binLayer = new Container();
    this.addChild(this.pegLayer);
    this.addChild(this.binLayer);
  }

  public build(opts: {
    rows: Rows;
    width: number;
    height: number;
    gradient: { edge: string; center: string };
  }) {
    this.rows = opts.rows;
    this.gradient = opts.gradient;

    const { rows, width, height } = opts;
    // Top peg row has 3 pegs; row r has r+3 pegs (rows ranges 8..16). Total
    // peg rows = rows. Bin row = rows + 3 bins. We use a vertical layout that
    // keeps the board centered horizontally and fills available height.
    const lastRowPegs = rows + 2; // pegs in last peg row
    const binCount = rows + 1;

    // Peg/ball sizes scale down for higher row counts so things fit.
    const pegRadius = Math.max(3, Math.min(7, 90 / rows));
    const ballRadius = Math.max(5, Math.min(11, 140 / rows));

    // Reserve bin row at the bottom.
    const binHeight = Math.min(60, height * 0.07);
    const topPad = ballRadius * 4;
    const pegAreaHeight = height - binHeight - topPad - 8;
    const rowSpacingY = pegAreaHeight / rows;
    // colSpacingX is governed by available width relative to bottom row.
    const colSpacingX = Math.min(
      (width - pegRadius * 4) / (lastRowPegs - 1),
      rowSpacingY * 1.05,
    );

    const pegs: BoardLayout["pegs"] = [];
    const centerX = width / 2;
    const topY = topPad;

    for (let r = 0; r < rows; r++) {
      const pegCount = r + 3;
      const rowY = topY + r * rowSpacingY;
      const rowWidth = (pegCount - 1) * colSpacingX;
      const startX = centerX - rowWidth / 2;
      for (let c = 0; c < pegCount; c++) {
        pegs.push({ x: startX + c * colSpacingX, y: rowY, row: r, col: c });
      }
    }

    const bottomY = topY + (rows - 1) * rowSpacingY;
    const binRowY = bottomY + rowSpacingY;
    const binCenters: { x: number; y: number }[] = [];
    const binWidth = colSpacingX;
    const binsRowWidth = (binCount - 1) * colSpacingX;
    const binsStartX = centerX - binsRowWidth / 2;
    for (let b = 0; b < binCount; b++) {
      binCenters.push({ x: binsStartX + b * colSpacingX, y: binRowY });
    }

    this.layout = {
      width,
      height,
      topY,
      bottomY: binRowY + binHeight,
      pegRadius,
      ballRadius,
      rowSpacingY,
      colSpacingX,
      pegs,
      binCenters,
      binWidth,
      binHeight,
    };

    this.drawPegs();
  }

  private drawPegs() {
    const g = this.pegLayer;
    g.clear();
    for (const p of this.layout.pegs) {
      g.circle(p.x, p.y, this.layout.pegRadius).fill({ color: 0xffffff });
    }
  }

  /**
   * Bins are rebuilt by the Game with multipliers so the labels can update
   * without rebuilding peg geometry.
   */
  public renderBins(multipliers: number[], onCreated: (bins: Graphics[]) => void) {
    this.binLayer.removeChildren().forEach((c) => c.destroy());
    this.bins = [];
    const { binCenters, binWidth, binHeight } = this.layout;
    const center = (binCenters.length - 1) / 2;
    for (let i = 0; i < binCenters.length; i++) {
      const dist = Math.abs(i - center) / center;
      const color = lerpColor(this.gradient.center, this.gradient.edge, dist);
      const bin = new Graphics();
      bin.roundRect(
        -binWidth / 2 + 2,
        0,
        binWidth - 4,
        binHeight,
        Math.min(8, binHeight / 3),
      ).fill({ color });
      bin.x = binCenters[i].x;
      bin.y = binCenters[i].y;
      this.binLayer.addChild(bin);
      this.bins.push(bin);
    }
    onCreated(this.bins);
  }

  public bumpBin(index: number) {
    const bin = this.bins[index];
    if (!bin) return;
    gsap.killTweensOf(bin);
    const baseY = this.layout.binCenters[index].y;
    gsap.to(bin, {
      y: baseY + this.layout.binHeight * 0.45,
      duration: 0.08,
      ease: "power2.out",
      onComplete: () => {
        gsap.to(bin, { y: baseY, duration: 0.25, ease: "back.out(2)" });
      },
    });
  }
}

function lerpColor(a: string, b: string, t: number): number {
  const ah = parseInt(a.slice(1), 16);
  const bh = parseInt(b.slice(1), 16);
  const ar = (ah >> 16) & 0xff;
  const ag = (ah >> 8) & 0xff;
  const ab = ah & 0xff;
  const br = (bh >> 16) & 0xff;
  const bg = (bh >> 8) & 0xff;
  const bb = bh & 0xff;
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return (r << 16) | (g << 8) | bl;
}
