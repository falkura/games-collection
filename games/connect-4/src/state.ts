import { GameMode } from "./events";

export type Screen = "menu" | "playing" | "ended";

export interface GameState {
  screen: Screen;
  mode: GameMode;
  player: 1 | 2;
  /** 0 = no winner yet OR draw. Pair with `screen === "ended"` to disambiguate. */
  winner: 0 | 1 | 2;
}

const INITIAL: GameState = {
  screen: "menu",
  mode: "ai",
  player: 1,
  winner: 0,
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
