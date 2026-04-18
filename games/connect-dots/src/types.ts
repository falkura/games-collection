export type Cell = { x: number; y: number };

export interface RawLevel {
  id: string;
  title: string;
  source: string;
  rows: string[];
}

export interface Level {
  id: string;
  title: string;
  source: string;
  width: number;
  height: number;
  labels: string[];
  endpoints: Record<string, [Cell, Cell]>;
}
