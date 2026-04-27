import { Container, Graphics, Text } from "pixi.js";
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
  public bins: Container[] = [];

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
    const lastRowPegs = rows + 2;
    const binCount = rows + 1;

    const pegRadius = Math.max(4, Math.min(8, 100 / rows));
    const ballRadius = Math.max(6, Math.min(12, 150 / rows));

    const colSpacingX = Math.min((width - pegRadius * 4) / (lastRowPegs - 1));
    const binHeight = colSpacingX; // square bins
    const topPad = ballRadius * 4;
    const binGap = colSpacingX * 0.15; // gap between peg area bottom and bins
    const pegAreaHeight = height - binHeight - topPad - binGap;
    const rowSpacingY = pegAreaHeight / rows;

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

    const lastPegRowY = topY + (rows - 1) * rowSpacingY;
    const binRowY = lastPegRowY + rowSpacingY * 0.8 + binGap;
    const binCenters: { x: number; y: number }[] = [];
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
      binWidth: colSpacingX,
      binHeight,
    };

    this.drawPegs();
  }

  private drawPegs() {
    const g = this.pegLayer;
    g.clear();
    for (const p of this.layout.pegs) {
      g.circle(p.x, p.y, this.layout.pegRadius)
        .fill({ color: 0xffffff })
        .circle(p.x, p.y, this.layout.pegRadius * 1.6)
        .fill({ color: 0xffffff, alpha: 0.08 });
    }
  }

  public renderBins(
    multipliers: number[],
    onCreated: (bins: Container[]) => void,
  ) {
    this.binLayer.removeChildren().forEach((c) => c.destroy());
    this.bins = [];

    const { binCenters, binWidth, binHeight } = this.layout;
    const gap = 3;
    const side = binWidth - gap;
    const radius = Math.min(8, side * 0.18);
    const center = (binCenters.length - 1) / 2;

    for (let i = 0; i < binCenters.length; i++) {
      const dist = Math.abs(i - center) / center;
      const color = lerpColor(this.gradient.center, this.gradient.edge, dist);

      const container = new Container();
      container.x = binCenters[i].x;
      container.y = binCenters[i].y;

      // Background rect
      const bg = new Graphics();
      bg.roundRect(-side / 2, 0, side, binHeight, radius).fill({ color });
      container.addChild(bg);

      // Multiplier label — sized to fill the bin
      const fontSize = Math.max(10, Math.min(side * 0.42, binHeight * 0.5));
      const label = new Text({
        text: formatMultiplier(multipliers[i]),
        style: {
          fontFamily: "system-ui, Arial, sans-serif",
          fontSize,
          fontWeight: "900",
          fill: "#ffffff",
          dropShadow: {
            color: "#000000",
            blur: 4,
            distance: 1,
            alpha: 0.6,
          },
          align: "center",
        },
      });
      label.anchor.set(0.5, 0.5);
      label.x = 0;
      label.y = binHeight / 2;
      container.addChild(label);

      this.binLayer.addChild(container);
      this.bins.push(container);
    }

    onCreated(this.bins);
  }

  public bumpBin(index: number) {
    const bin = this.bins[index];
    if (!bin) return;
    gsap.killTweensOf(bin);
    const baseY = this.layout.binCenters[index].y;
    gsap.to(bin, {
      y: baseY + this.layout.binHeight * 0.4,
      duration: 0.07,
      ease: "power2.out",
      onComplete: () => {
        gsap.to(bin, { y: baseY, duration: 0.3, ease: "back.out(2.5)" });
      },
    });
  }
}

function formatMultiplier(v: number): string {
  if (v >= 100) return `${Math.round(v)}x`;
  if (v >= 10) return `${v % 1 === 0 ? v : v.toFixed(1)}x`;
  return `${v}x`;
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
