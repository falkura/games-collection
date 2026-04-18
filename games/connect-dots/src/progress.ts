const STORAGE_KEY = "connect-dots:level";

export function loadLevelIndex(count: number): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const n = raw ? parseInt(raw, 10) : 0;
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(count - 1, n));
  } catch {
    return 0;
  }
}

export function saveLevelIndex(index: number): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(index));
  } catch {
    // storage unavailable
  }
}
