export type Screen = "menu" | "playing" | "ended";

export interface GameState {
  screen: Screen;
  size: number;
  starsPer: 1 | 2;
  /** Stars placed so far (count). */
  stars: number;
  /** Total stars required to solve. */
  starsTotal: number;
  /** Elapsed seconds for the current puzzle. */
  elapsed: number;
  paused: boolean;
}

const INITIAL: GameState = {
  screen: "menu",
  size: 6,
  starsPer: 1,
  stars: 0,
  starsTotal: 0,
  elapsed: 0,
  paused: false,
};

let state: GameState = INITIAL;
const listeners = new Set<() => void>();

export const gameState = {
  get(): GameState {
    return state;
  },
  set(patch: Partial<GameState>) {
    state = { ...state, ...patch };
    listeners.forEach((l) => l());
  },
  reset() {
    this.set(INITIAL);
  },
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
