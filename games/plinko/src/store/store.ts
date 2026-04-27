import { create } from "zustand";
import { Difficulty, Rows } from "../server/payouts";

export interface HistoryEntry {
  id: string;
  bin: number;
  multiplier: number;
  payout: number;
  bet: number;
  difficulty: Difficulty;
  rows: Rows;
  win: boolean;
}

interface Settings {
  volume: number;
  animations: boolean;
}

interface PlinkoState {
  balance: number;
  bet: number;
  difficulty: Difficulty;
  rows: Rows;
  autoplay: boolean;
  pendingDrops: number;
  history: HistoryEntry[];
  settings: Settings;
  infoOpen: boolean;
  settingsOpen: boolean;

  setBet: (v: number) => void;
  halveBet: () => void;
  doubleBet: () => void;
  setDifficulty: (d: Difficulty) => void;
  setRows: (r: Rows) => void;
  setAutoplay: (v: boolean) => void;
  addBalance: (v: number) => void;
  subBalance: (v: number) => void;
  pushHistory: (e: HistoryEntry) => void;
  incPending: () => void;
  decPending: () => void;
  setSettings: (s: Partial<Settings>) => void;
  setInfoOpen: (v: boolean) => void;
  setSettingsOpen: (v: boolean) => void;
}

const HISTORY_LIMIT = 30;

export const usePlinkoStore = create<PlinkoState>((set) => ({
  balance: 1000,
  bet: 1,
  difficulty: "Medium",
  rows: 12,
  autoplay: false,
  pendingDrops: 0,
  history: [],
  settings: { volume: 0.6, animations: true },
  infoOpen: false,
  settingsOpen: false,

  setBet: (v) => set({ bet: Math.max(0.01, +v.toFixed(2)) }),
  halveBet: () =>
    set((s) => ({ bet: Math.max(0.01, +(s.bet / 2).toFixed(2)) })),
  doubleBet: () =>
    set((s) => ({ bet: +(s.bet * 2).toFixed(2) })),
  setDifficulty: (d) => set({ difficulty: d }),
  setRows: (r) => set({ rows: r }),
  setAutoplay: (v) => set({ autoplay: v }),
  addBalance: (v) => set((s) => ({ balance: +(s.balance + v).toFixed(2) })),
  subBalance: (v) => set((s) => ({ balance: +(s.balance - v).toFixed(2) })),
  pushHistory: (e) =>
    set((s) => ({ history: [e, ...s.history].slice(0, HISTORY_LIMIT) })),
  incPending: () => set((s) => ({ pendingDrops: s.pendingDrops + 1 })),
  decPending: () =>
    set((s) => ({ pendingDrops: Math.max(0, s.pendingDrops - 1) })),
  setSettings: (s) =>
    set((state) => ({ settings: { ...state.settings, ...s } })),
  setInfoOpen: (v) => set({ infoOpen: v }),
  setSettingsOpen: (v) => set({ settingsOpen: v }),
}));
