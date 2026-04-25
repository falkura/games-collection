import { events, Events, GameMode } from "../../../events";
import "./GameOver.css";

interface Props {
  winner: 0 | 1 | 2;
  mode: GameMode;
}

const titleFor = (winner: 0 | 1 | 2, mode: GameMode): string => {
  if (winner === 0) return "Draw";
  if (mode === "ai") return winner === 1 ? "You Win!" : "AI Wins";
  return `Player ${winner} Wins`;
};

const subFor = (winner: 0 | 1 | 2, mode: GameMode): string => {
  if (winner === 0) return "The board is full.";
  if (mode === "ai")
    return winner === 1 ? "Four in a row." : "Better luck next round.";
  return "Four in a row.";
};

const iconFor = (winner: 0 | 1 | 2): string => {
  if (winner === 0) return "=";
  return String(winner);
};

export function GameOver({ winner, mode }: Props) {
  return (
    <div className="gameover">
      <div className={`gameover__panel gameover__panel--w${winner}`}>
        <div className={`gameover__icon gameover__icon--w${winner}`}>
          {iconFor(winner)}
        </div>
        <h2 className="gameover__title">{titleFor(winner, mode)}</h2>
        <p className="gameover__sub">{subFor(winner, mode)}</p>
        <div className="gameover__buttons">
          <button
            className="gameover__btn gameover__btn--primary"
            onClick={() => events.emit(Events.RestartRequested)}
          >
            Play Again
          </button>
          <button
            className="gameover__btn"
            onClick={() => events.emit(Events.MenuRequested)}
          >
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
}
