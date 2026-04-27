import { useEffect, useRef } from "react";
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
    pendingDrops,
    setBet,
    halveBet,
    doubleBet,
    setDifficulty,
    setRows,
    setAutoplay,
  } = usePlinkoStore();

  const autoTimer = useRef<number | null>(null);

  // Autoplay: drop a ball every 700ms while we have funds.
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
    };
    tick();
    autoTimer.current = window.setInterval(tick, 700);
    return () => {
      if (autoTimer.current !== null) window.clearInterval(autoTimer.current);
    };
  }, [autoplay]);

  const canBet = balance >= bet && pendingDrops < 20;

  return (
    <div className="bet-panel">
      <div className="bet-panel__row">
        <label className="bet-panel__label">Bet Amount</label>
        <div className="bet-panel__bet">
          <input
            type="number"
            className="bet-panel__input"
            min={0.01}
            step={0.01}
            value={bet}
            onChange={(e) => setBet(parseFloat(e.target.value) || 0.01)}
          />
          <button className="bet-panel__btn-mini" onClick={halveBet} type="button">
            ½
          </button>
          <button className="bet-panel__btn-mini" onClick={doubleBet} type="button">
            2×
          </button>
        </div>
      </div>

      <div className="bet-panel__row bet-panel__row--split">
        <div className="bet-panel__field">
          <label className="bet-panel__label">Difficulty</label>
          <div className="bet-panel__seg">
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                type="button"
                className={`bet-panel__seg-btn ${
                  d === difficulty ? "bet-panel__seg-btn--on" : ""
                } bet-panel__seg-btn--${d.toLowerCase()}`}
                onClick={() => setDifficulty(d as Difficulty)}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bet-panel__row bet-panel__row--split">
        <div className="bet-panel__field">
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
        <div className="bet-panel__field">
          <label className="bet-panel__label">Autoplay</label>
          <button
            type="button"
            className={`bet-panel__toggle ${autoplay ? "bet-panel__toggle--on" : ""}`}
            onClick={() => setAutoplay(!autoplay)}
          >
            <span className="bet-panel__toggle-dot" />
            <span>{autoplay ? "On" : "Off"}</span>
          </button>
        </div>
      </div>

      <button
        type="button"
        className="bet-panel__bet-btn"
        disabled={!canBet}
        onClick={() => plinkoEvents.emit("plinko:drop-request")}
      >
        Bet ${bet.toFixed(2)}
      </button>
    </div>
  );
}
