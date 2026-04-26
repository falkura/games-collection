import { useEffect, useRef, useState } from "react";
import { events, Events } from "../../../events";
import { isCombinationFeasible } from "../../../logic/puzzle";
import "./Menu.css";

const MIN_SIZE = 5;
const MAX_SIZE = 10;
const WARN_HIDE_MS = 2200;
// On touch devices the warning is easy to miss while a finger covers the
// segmented control, so we leave it pinned until the user changes a setting.
const isTouchDevice = () =>
  typeof window !== "undefined" &&
  (window.matchMedia?.("(hover: none)").matches ?? false);

export function Menu() {
  const [size, setSize] = useState(6);
  const [starsPer, setStarsPer] = useState<1 | 2>(1);
  const [warnVisible, setWarnVisible] = useState(false);
  const warnTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-bump size when 2-star is picked on a too-small board, then surface
  // the explanation as a fading toast.
  useEffect(() => {
    if (!isCombinationFeasible(size, starsPer)) {
      setSize(8);
      setWarnVisible(true);
      if (warnTimer.current) clearTimeout(warnTimer.current);
      if (!isTouchDevice()) {
        warnTimer.current = setTimeout(() => setWarnVisible(false), WARN_HIDE_MS);
      }
    }
  }, [starsPer, size]);

  useEffect(
    () => () => {
      if (warnTimer.current) clearTimeout(warnTimer.current);
    },
    [],
  );

  const start = () => events.emit(Events.StartRequested, { size, starsPer });

  const sizeLabel = `${size} × ${size}`;
  const totalStars = size * starsPer;
  const sizeProgress = ((size - MIN_SIZE) / (MAX_SIZE - MIN_SIZE)) * 100;

  return (
    <div className="menu">
      <div className="menu__panel">
        <div className="menu__brand">
          <span className="menu__star">★</span>
        </div>
        <h1 className="menu__title">Star Battle</h1>
        <p className="menu__subtitle">
          Place stars in every row, column &amp; region. No two may touch.
        </p>

        <div className="menu__group">
          <div className="menu__row">
            <span className="menu__label">Region size</span>
            <span className="menu__value">{sizeLabel}</span>
          </div>
          <div className="menu__slider-wrap">
            <input
              className="menu__slider"
              type="range"
              min={MIN_SIZE}
              max={MAX_SIZE}
              step={1}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              style={{ ["--progress" as string]: `${sizeProgress}%` }}
            />
            <div className="menu__ticks">
              {Array.from({ length: MAX_SIZE - MIN_SIZE + 1 }, (_, i) => MIN_SIZE + i).map((n) => (
                <span key={n} className={n === size ? "is-on" : ""}>{n}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="menu__group">
          <div className="menu__row">
            <span className="menu__label">Stars per region</span>
            <span className="menu__value menu__value--total">
              {totalStars} total
            </span>
          </div>
          <div className="menu__seg">
            <button
              className={`menu__seg-btn ${starsPer === 1 ? "is-on" : ""}`}
              onClick={() => setStarsPer(1)}
            >
              <span className="menu__seg-stars">★</span>
              1 star
            </button>
            <button
              className={`menu__seg-btn ${starsPer === 2 ? "is-on" : ""}`}
              onClick={() => setStarsPer(2)}
            >
              <span className="menu__seg-stars">★★</span>
              2 stars
            </button>
          </div>
          <p className={`menu__warn ${warnVisible ? "is-on" : ""}`} aria-live="polite">
            2-star puzzles need an 8×8 board or larger — bumped to 8.
          </p>
        </div>

        <button className="menu__play" onClick={start}>
          Play
        </button>

        <div className="menu__rules">
          <div className="menu__rules-title">How to play</div>
          <ul>
            <li>Tap a cell to mark it eliminated (·).</li>
            <li>Tap again to place a star (★). Tap once more to clear.</li>
            <li>Stars cannot touch — not even diagonally.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
