import { useState } from "react";
import { events, Events, GameMode, Difficulty } from "../../../events";
import "./Menu.css";

const DIFFICULTIES: Array<{ id: Difficulty; label: string; sub: string }> = [
  { id: "easy", label: "Easy", sub: "Random with simple blocking" },
  { id: "medium", label: "Medium", sub: "Looks ahead 3 moves" },
  { id: "hard", label: "Hard", sub: "Looks ahead 6 moves" },
];

export function Menu() {
  const [mode, setMode] = useState<GameMode>("ai");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");

  const start = () =>
    events.emit(Events.StartRequested, { mode, difficulty });

  return (
    <div className="menu">
      <div className="menu__panel">
        <div className="menu__brand">
          <span className="menu__chip menu__chip--p1" />
          <span className="menu__chip menu__chip--p2" />
        </div>
        <h1 className="menu__title">Connect 4</h1>
        <p className="menu__subtitle">
          Drop discs. Line up four in a row.
        </p>

        <div className="menu__group">
          <div className="menu__label">Mode</div>
          <div className="menu__seg">
            <button
              className={`menu__seg-btn ${mode === "ai" ? "is-on" : ""}`}
              onClick={() => setMode("ai")}
            >
              vs AI
            </button>
            <button
              className={`menu__seg-btn ${mode === "pvp" ? "is-on" : ""}`}
              onClick={() => setMode("pvp")}
            >
              2 Players
            </button>
          </div>
        </div>

        {mode === "ai" && (
          <div className="menu__group">
            <div className="menu__label">Difficulty</div>
            <div className="menu__diff">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.id}
                  className={`menu__diff-btn ${
                    difficulty === d.id ? "is-on" : ""
                  }`}
                  onClick={() => setDifficulty(d.id)}
                >
                  <span className="menu__diff-label">{d.label}</span>
                  <span className="menu__diff-sub">{d.sub}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <button className="menu__play" onClick={start}>
          Play
        </button>
      </div>
    </div>
  );
}
