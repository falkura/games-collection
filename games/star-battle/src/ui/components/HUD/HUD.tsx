import { events, Events } from "../../../events";
import "./HUD.css";

interface Props {
  size: number;
  starsPer: 1 | 2;
  stars: number;
  starsTotal: number;
  elapsed: number;
  paused: boolean;
}

const formatTime = (s: number): string => {
  const m = Math.floor(s / 60);
  const ss = s % 60;
  return `${m}:${ss.toString().padStart(2, "0")}`;
};

export function HUD({ size, starsPer, stars, starsTotal, elapsed, paused }: Props) {
  return (
    <>
      <div className="hud hud--top">
        <button
          className="hud__btn hud__btn--icon"
          onClick={() => events.emit(Events.MenuRequested)}
          aria-label="Menu"
        >
          ←
        </button>
        <div className="hud__meta">
          <div className="hud__chip hud__chip--diff">
            {size}×{size} · {starsPer}★
          </div>
          <div className="hud__chip hud__chip--time">
            <span className="hud__chip-icon">⏱</span>
            {formatTime(elapsed)}
          </div>
          <button
            className={`hud__chip hud__chip--btn ${paused ? "is-on" : ""}`}
            onClick={() => events.emit(Events.PauseToggleRequested)}
            aria-label={paused ? "Resume" : "Pause"}
          >
            {paused ? "▶" : "❚❚"}
          </button>
        </div>
        <div className="hud__stars">
          <span className="hud__star">★</span>
          <span className="hud__stars-count">
            {stars}
            <span className="hud__stars-total">/{starsTotal}</span>
          </span>
        </div>
      </div>

      <div className="hud hud--bottom">
        <button
          className="hud__btn"
          onClick={() => events.emit(Events.RestartRequested)}
        >
          Restart
        </button>
        <button
          className="hud__btn hud__btn--accent"
          onClick={() => events.emit(Events.NewPuzzleRequested)}
        >
          New Puzzle
        </button>
      </div>

      {paused && (
        <div className="hud-paused">
          <div className="hud-paused__panel">
            <div className="hud-paused__icon">❚❚</div>
            <div className="hud-paused__title">Paused</div>
            <button
              className="hud-paused__btn"
              onClick={() => events.emit(Events.PauseToggleRequested)}
            >
              Resume
            </button>
          </div>
        </div>
      )}
    </>
  );
}
