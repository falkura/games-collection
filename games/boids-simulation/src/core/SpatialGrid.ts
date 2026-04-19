import { Boid } from "./Boid";

export class SpatialGrid {
  cellSize: number;
  private cells = new Map<number, Boid[]>();

  constructor(cellSize: number) {
    this.cellSize = cellSize;
  }

  private key(cx: number, cy: number): number {
    return (cx + 500) * 100000 + (cy + 500);
  }

  clear() {
    this.cells.clear();
  }

  insert(boid: Boid) {
    const cx = Math.floor(boid.x / this.cellSize);
    const cy = Math.floor(boid.y / this.cellSize);
    const k = this.key(cx, cy);
    let cell = this.cells.get(k);
    if (!cell) { cell = []; this.cells.set(k, cell); }
    cell.push(boid);
  }

  neighbors(boid: Boid): Boid[] {
    const cx = Math.floor(boid.x / this.cellSize);
    const cy = Math.floor(boid.y / this.cellSize);
    const result: Boid[] = [];
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const cell = this.cells.get(this.key(cx + dx, cy + dy));
        if (cell) for (const b of cell) result.push(b);
      }
    }
    return result;
  }
}
