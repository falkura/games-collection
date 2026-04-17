import { TOTAL_LEVELS } from "./types";

const STORAGE_KEY = "orbit-drift:level";

export function loadProgress(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const n = raw ? parseInt(raw, 10) : 1;
    if (!Number.isFinite(n)) return 1;
    return Math.max(1, Math.min(TOTAL_LEVELS, n));
  } catch {
    return 1;
  }
}

export function saveProgress(n: number): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(n));
  } catch {
    // storage unavailable
  }
}
