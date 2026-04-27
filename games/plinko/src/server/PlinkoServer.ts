import { Difficulty, getMultipliers, Rows } from "./payouts";

export interface DropRequest {
  bet: number;
  difficulty: Difficulty;
  rows: Rows;
  clientId: string;
}

export interface DropResponse {
  clientId: string;
  /** Index into the bin/multiplier array (0..rows). */
  bin: number;
  multiplier: number;
  payout: number;
  /** Per-row decisions: 0 = go left, 1 = go right. Length === rows. */
  path: (0 | 1)[];
}

export interface ServerHistoryEntry {
  id: number;
  clientId: string;
  bin: number;
  multiplier: number;
  payout: number;
  bet: number;
  difficulty: Difficulty;
  rows: Rows;
  win: boolean;
  timestamp: number;
}

export interface PlinkoServer {
  readonly sessionId: string;
  init(): Promise<void>;
  drop(req: DropRequest): Promise<DropResponse>;
  getHistory(): Promise<ServerHistoryEntry[]>;
}

/** Shared server instance — set by Plinko.ts on start, read by UI. */
export let plinkoServer: PlinkoServer | null = null;
export function setPlinkoServer(s: PlinkoServer) {
  plinkoServer = s;
}

// ---------------------------------------------------------------------------
// Logger
// ---------------------------------------------------------------------------

const DIFF_COLOR: Record<Difficulty, string> = {
  Low: "#60a5fa",
  Medium: "#4ade80",
  High: "#c084fc",
  Expert: "#fb923c",
};

class ServerLogger {
  session(sessionId: string) {
    console.log(
      `%c[PlinkoServer] %csession %c${sessionId}`,
      "color:#8a90ad;font-weight:700",
      "color:#8a90ad",
      "color:#e7eaf5;font-family:monospace",
    );
  }

  request(req: DropRequest) {
    const dc = DIFF_COLOR[req.difficulty];
    console.groupCollapsed(
      `%c↑ DROP REQUEST %c${req.clientId}`,
      "color:#8a90ad;font-weight:700",
      "color:#8a90ad;font-weight:400",
    );
    console.log(`%cbet        %c$${req.bet.toFixed(2)}`, "color:#8a90ad", "color:#e7eaf5");
    console.log(`%cdifficulty %c${req.difficulty}`, "color:#8a90ad", `color:${dc};font-weight:700`);
    console.log(`%crows       %c${req.rows}`, "color:#8a90ad", "color:#e7eaf5");
    console.groupEnd();
  }

  response(entry: ServerHistoryEntry, path: (0 | 1)[], elapsedMs: number) {
    const dc = DIFF_COLOR[entry.difficulty];
    console.groupCollapsed(
      `%c↓ DROP RESPONSE %c${entry.clientId}`,
      "color:#8a90ad;font-weight:700",
      "color:#8a90ad;font-weight:400",
    );
    console.log(`%cid         %c#${entry.id}`, "color:#8a90ad", "color:#8a90ad");
    console.log(`%cbin        %c${entry.bin}`, "color:#8a90ad", `color:${dc};font-weight:700`);
    console.log(`%cmultiplier %c${entry.multiplier}×`, "color:#8a90ad", `color:${dc};font-weight:700`);
    console.log(`%cpayout     %c$${entry.payout.toFixed(2)}`, "color:#8a90ad", entry.win ? "color:#4ade80" : "color:#f87171");
    console.log(`%cpath       %c${path.join("")}`, "color:#8a90ad", "color:#8a90ad;font-family:monospace");
    console.log(`%clatency    %c${elapsedMs}ms`, "color:#8a90ad", "color:#8a90ad");
    console.groupEnd();
  }
}

const logger = new ServerLogger();

// ---------------------------------------------------------------------------

const HISTORY_LIMIT = 150;

export class FakePlinkoServer implements PlinkoServer {
  readonly sessionId: string;
  private _history: ServerHistoryEntry[] = [];
  private _nextId = 1;

  constructor() {
    this.sessionId = `fake-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    if (__DEV__) logger.session(this.sessionId);
  }

  async init(): Promise<void> {
    if (__DEV__) console.log("%c[PlinkoServer] %cinit…", "color:#8a90ad;font-weight:700", "color:#8a90ad");
    await new Promise((res) => setTimeout(res, 600));
    if (__DEV__) console.log("%c[PlinkoServer] %cready", "color:#8a90ad;font-weight:700", "color:#4ade80;font-weight:700");
  }

  async getHistory(): Promise<ServerHistoryEntry[]> {
    await new Promise((res) => setTimeout(res, 600));
    return [...this._history];
  }

  async drop(req: DropRequest): Promise<DropResponse> {
    const { difficulty, rows, bet, clientId } = req;
    const multipliers = getMultipliers(difficulty, rows);
    const binCount = rows + 1;

    if (__DEV__) logger.request(req);
    const t0 = performance.now();

    const edgeBias: Record<Difficulty, number> = {
      Low: 0.0,
      Medium: 0.06,
      High: 0.14,
      Expert: 0.22,
    };
    const bias = edgeBias[difficulty];

    let rightSteps = 0;
    for (let i = 0; i < rows; i++) {
      const p = 0.5 + bias * (Math.random() > 0.5 ? 1 : -1) * 0.5;
      if (Math.random() < p) rightSteps++;
    }
    const bin = Math.max(0, Math.min(binCount - 1, rightSteps));
    const path = buildPath(rows, bin);
    const multiplier = multipliers[bin];
    const payout = +(bet * multiplier).toFixed(2);
    const win = payout > bet;

    await new Promise((res) => setTimeout(res, 80));

    // Record in server history — circular buffer, overwrite oldest when full
    const entry: ServerHistoryEntry = {
      id: this._nextId++,
      clientId,
      bin,
      multiplier,
      payout,
      bet,
      difficulty,
      rows,
      win,
      timestamp: Date.now(),
    };

    if (this._history.length >= HISTORY_LIMIT) {
      this._history[this._history.length - 1] = entry;
      this._history.unshift(this._history.pop()!);
    } else {
      this._history.unshift(entry);
    }

    if (__DEV__) logger.response(entry, path, +(performance.now() - t0).toFixed(0));

    return { clientId, bin, multiplier, payout, path };
  }
}

/** Generate a random [0|1] array of length `rows` with exactly `rights` ones. */
function buildPath(rows: number, rights: number): (0 | 1)[] {
  const path: (0 | 1)[] = Array(rows - rights)
    .fill(0)
    .concat(Array(rights).fill(1)) as (0 | 1)[];
  // Fisher-Yates shuffle
  for (let i = path.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [path[i], path[j]] = [path[j], path[i]];
  }
  return path;
}
