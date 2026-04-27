import { EventEmitter } from "pixi.js";

interface PlinkoEvents {
  "plinko:drop-request": () => void;
  "plinko:ball-landed": (data: { bin: number; multiplier: number }) => void;
}

export const plinkoEvents = new EventEmitter<PlinkoEvents>();
