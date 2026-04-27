import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePlinkoStore } from "../../../store/store";
import { plinkoEvents } from "../../../store/events";
import {
  DIFFICULTIES,
  Difficulty,
  ROW_OPTIONS,
  Rows,
} from "../../../server/payouts";
import "./BetPanel.css";

export function BetPanel() {
  const {
    bet,
    balance,
    difficulty,
    rows,
    autoplay,
    autoplayCount,
    pendingDrops,
    setBet,
    halveBet,
    doubleBet,
    setDifficulty,
    setRows,
    setAutoplay,
    setAutoplayCount,
    decAutoplayCount,
  } = usePlinkoStore();

  const autoTimer = useRef<number | null>(null);
  const [betInput, setBetInput] = useState(bet.toFixed(2));
  const segRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({});

  // Keep betInput in sync when bet changes externally (halveBet / doubleBet)
  useEffect(() => {
    setBetInput(bet.toFixed(2));
  }, [bet]);

  // Slide indicator to active difficulty button
  useLayoutEffect(() => {
    if (!segRef.current) return;
    const seg = segRef.current;
    const activeBtn = seg.querySelector<HTMLButtonElement>(".bet-panel__seg-btn--on");
    if (!activeBtn) return;
    const segRect = seg.getBoundingClientRect();
    const btnRect = activeBtn.getBoundingClientRect();
    setIndicatorStyle({
      width: btnRect.width,
      height: btnRect.height,
      transform: `translateX(${btnRect.left - segRect.left - 4}px)`,
    });
  }, [difficulty]);

  useEffect(() => {
    if (!autoplay) {
      if (autoTimer.current !== null) {
        window.clearInterval(autoTimer.current);
        autoTimer.current = null;
      }
      return;
    }
    const tick = () => {
      const s = usePlinkoStore.getState();
      if (s.balance < s.bet) {
        s.setAutoplay(false);
        return;
      }
      plinkoEvents.emit("plinko:drop-request");
      if (s.autoplayCount > 0) {
        s.decAutoplayCount();
      }
    };
    tick();
    autoTimer.current = window.setInterval(tick, 700);
    return () => {
      if (autoTimer.current !== null) window.clearInterval(autoTimer.current);
    };
  }, [autoplay]);

  const canBet = balance >= bet && pendingDrops < 20;

  const commitBet = (raw: string) => {
    const v = parseFloat(raw);
    if (!isNaN(v) && v > 0) setBet(v);
    setBetInput(bet.toFixed(2));
  };

  return (
    <div className="bet-panel">
      {/* Row 1: Bet amount + quick buttons */}
      <div className="bet-panel__row">
        <label className="bet-panel__label">Bet Amount</label>
        <div className="bet-panel__bet-row">
          <div className="bet-panel__input-wrap">
            <span className="bet-panel__currency">$</span>
            <input
              type="number"
              className="bet-panel__input"
              min={0.01}
              step={0.01}
              value={betInput}
              onChange={(e) => setBetInput(e.target.value)}
              onBlur={(e) => commitBet(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && commitBet(betInput)}
            />
          </div>
          <button
            className="bet-panel__btn-mini"
            onClick={() => {
              halveBet();
            }}
            type="button"
          >
            ½
          </button>
          <button
            className="bet-panel__btn-mini"
            onClick={() => {
              doubleBet();
            }}
            type="button"
          >
            2×
          </button>
        </div>
      </div>

      {/* Row 2: Difficulty + Rows side by side */}
      <div className="bet-panel__row bet-panel__row--split">
        <div className="bet-panel__field">
          <label className="bet-panel__label">Difficulty</label>
          <div className="bet-panel__seg" ref={segRef}>
            <div
              className={`bet-panel__seg-indicator bet-panel__seg-indicator--${difficulty.toLowerCase()}`}
              style={indicatorStyle}
            />
            {DIFFICULTIES.map((d) => {
              const active = d === difficulty;
              return (
                <button
                  key={d}
                  type="button"
                  className={`bet-panel__seg-btn bet-panel__seg-btn--${d.toLowerCase()} ${active ? "bet-panel__seg-btn--on" : ""}`}
                  onClick={() => setDifficulty(d as Difficulty)}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>

        <div className="bet-panel__field bet-panel__field--narrow">
          <label className="bet-panel__label">Rows</label>
          <select
            className="bet-panel__select"
            value={rows}
            onChange={(e) => setRows(parseInt(e.target.value, 10) as Rows)}
          >
            {ROW_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 3: Autoplay */}
      <div className="bet-panel__row">
        <label className="bet-panel__label">Autoplay</label>
        <div className="bet-panel__autoplay-row">
          <div className="bet-panel__input-wrap bet-panel__input-wrap--count">
            <input
              type="number"
              className="bet-panel__input bet-panel__input--count"
              min={0}
              step={1}
              placeholder="∞"
              value={autoplayCount === 0 ? "" : autoplayCount}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                setAutoplayCount(isNaN(v) ? 0 : v);
              }}
              disabled={autoplay}
            />
          </div>
          <button
            type="button"
            className={`bet-panel__autoplay-btn ${autoplay ? "bet-panel__autoplay-btn--on" : ""}`}
            onClick={() => setAutoplay(!autoplay)}
          >
            <span className="bet-panel__autoplay-dot" />
            {autoplay ? "Stop" : "Auto"}
          </button>
        </div>
      </div>

      {/* Bet button */}
      <button
        type="button"
        className="bet-panel__bet-btn"
        disabled={!canBet || autoplay}
        onClick={() => plinkoEvents.emit("plinko:drop-request")}
      >
        Bet ${bet.toFixed(2)}
      </button>
    </div>
  );
}
