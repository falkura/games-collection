import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { usePlinkoStore } from "../../../store/store";
import { Audio } from "../../../Audio";
import { plinkoEvents } from "../../../store/events";
import {
  DIFFICULTIES,
  Difficulty,
  ROW_OPTIONS,
  Rows,
} from "../../../server/payouts";
import { BALL_CONFIG } from "../../../game/ballConfig";
import "./BetPanel.css";

export function BetPanel() {
  const {
    bet,
    balance,
    difficulty,
    rows,
    autoplay,
    autoplayCount,
    turbo,
    pendingDrops,
    setBet,
    halveBet,
    doubleBet,
    setDifficulty,
    setRows,
    setAutoplay,
    setAutoplayCount,
    decAutoplayCount,
    setTurbo,
  } = usePlinkoStore();

  const autoTimer = useRef<number | null>(null);
  const [betInput, setBetInput] = useState(bet.toFixed(2));
  const segRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({});

  const ballsActive = pendingDrops > 0;

  useEffect(() => {
    setBetInput(bet.toFixed(2));
  }, [bet]);

  const updateIndicator = () => {
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
  };

  useLayoutEffect(updateIndicator, [difficulty]);

  useEffect(() => {
    if (!segRef.current) return;
    const ro = new ResizeObserver(updateIndicator);
    ro.observe(segRef.current);
    return () => ro.disconnect();
  }, []);

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
    autoTimer.current = window.setInterval(tick, BALL_CONFIG.autoplayIntervalMs);
    return () => {
      if (autoTimer.current !== null) window.clearInterval(autoTimer.current);
    };
  }, [autoplay]);

  const turboProxy = useRef({ ts: 1 });
  useEffect(() => {
    const proxy = turboProxy.current;
    proxy.ts = gsap.globalTimeline.timeScale();
    gsap.to(proxy, {
      ts: turbo ? 2 : 1,
      duration: 0.3,
      ease: "power1.inOut",
      overwrite: true,
      onUpdate() {
        gsap.globalTimeline.timeScale(proxy.ts);
      },
    });
  }, [turbo]);

  const canBet = balance >= bet && !autoplay;

  const commitBet = (raw: string) => {
    const v = parseFloat(raw);
    if (!isNaN(v) && v > 0) setBet(v);
    setBetInput(bet.toFixed(2));
  };

  return (
    <div className="bet-panel">
      {/* Bet amount */}
      <div className="bet-panel__row">
        <label className="bet-panel__label">Bet Amount</label>
        <div className="bet-panel__bet-row">
          <div className={`bet-panel__input-wrap${ballsActive ? " bet-panel__input-wrap--disabled" : ""}`}>
            <span className="bet-panel__currency">$</span>
            <input
              type="number"
              className="bet-panel__input"
              min={0.01}
              step={0.01}
              value={betInput}
              disabled={ballsActive}
              onChange={(e) => setBetInput(e.target.value)}
              onBlur={(e) => commitBet(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && commitBet(betInput)}
            />
          </div>
          <button
            className="bet-panel__btn-mini"
            disabled={ballsActive}
            onClick={() => { Audio.play("halfDouble"); halveBet(); }}
            type="button"
          >
            ½
          </button>
          <button
            className="bet-panel__btn-mini"
            disabled={ballsActive}
            onClick={() => { Audio.play("halfDouble"); doubleBet(); }}
            type="button"
          >
            2×
          </button>
        </div>
      </div>

      {/* Difficulty + Rows */}
      <div className="bet-panel__row bet-panel__row--split">
        <div className="bet-panel__field">
          <label className="bet-panel__label">Difficulty</label>
          <div className={`bet-panel__seg${ballsActive ? " bet-panel__seg--disabled" : ""}`} ref={segRef}>
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
                  disabled={ballsActive}
                  onClick={() => { Audio.play("difficulty"); setDifficulty(d as Difficulty); }}
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
            disabled={ballsActive}
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

      {/* Autoplay */}
      <div className="bet-panel__autoplay-row">
        <div className="bet-panel__balance">
          <span className="bet-panel__label">Balance</span>
          <span className="bet-panel__balance-amount">${balance.toFixed(2)}</span>
        </div>
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
          onClick={() => { Audio.play(autoplay ? "autoplayOff" : "autoplayOn"); setAutoplay(!autoplay); }}
        >
          <span className="bet-panel__autoplay-dot" />
          {autoplay ? "Stop" : "Auto"}
        </button>
        <button
          type="button"
          className={`bet-panel__turbo-btn ${turbo ? "bet-panel__turbo-btn--on" : ""}`}
          onClick={() => { Audio.play(turbo ? "turboOff" : "turboOn"); setTurbo(!turbo); }}
          title="Turbo: 2× speed"
        >
          ⚡
        </button>
      </div>

      {/* Bet button */}
      <button
        type="button"
        className={`bet-panel__bet-btn bet-panel__bet-btn--${difficulty.toLowerCase()}`}
        disabled={!canBet}
        onClick={() => { Audio.play("bet"); plinkoEvents.emit("plinko:drop-request"); }}
      >
        Bet ${bet.toFixed(2)}
      </button>
    </div>
  );
}
