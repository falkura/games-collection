import { events, Events } from "../../../events";
import "./WinScreen.css";

interface Props {
  size: number;
  starsPer: 1 | 2;
  elapsed: number;
}

const formatTime = (s: number): string => {
  const m = Math.floor(s / 60);
  const ss = s % 60;
  return `${m}:${ss.toString().padStart(2, "0")}`;
};

export function WinScreen({ size, starsPer, elapsed }: Props) {
  return (
    <div className="winscreen">
      <div className="winscreen__panel">
        <div className="winscreen__stars" aria-hidden>
          <span className="winscreen__star winscreen__star--a">★</span>
          <span className="winscreen__star winscreen__star--b">★</span>
          <span className="winscreen__star winscreen__star--c">★</span>
        </div>
        <h2 className="winscreen__title">Solved!</h2>
        <p className="winscreen__sub">
          Every row, column &amp; region in balance.
        </p>

        <div className="winscreen__stats">
          <div className="winscreen__stat">
            <div className="winscreen__stat-label">Puzzle</div>
            <div className="winscreen__stat-value">
              {size}×{size} · {starsPer}★
            </div>
          </div>
          <div className="winscreen__stat">
            <div className="winscreen__stat-label">Time</div>
            <div className="winscreen__stat-value">{formatTime(elapsed)}</div>
          </div>
        </div>

        <div className="winscreen__buttons">
          <button
            className="winscreen__btn winscreen__btn--primary"
            onClick={() => events.emit(Events.NewPuzzleRequested)}
          >
            New Puzzle
          </button>
          <button
            className="winscreen__btn"
            onClick={() => events.emit(Events.MenuRequested)}
          >
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
}
