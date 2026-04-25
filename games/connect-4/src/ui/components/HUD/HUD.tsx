import { events, Events, GameMode } from "../../../events";
import "./HUD.css";

interface Props {
  player: 1 | 2;
  mode: GameMode;
}

const playerLabel = (p: 1 | 2, mode: GameMode): string => {
  if (mode === "ai") return p === 1 ? "Your Turn" : "AI Thinking…";
  return p === 1 ? "Player 1" : "Player 2";
};

export function HUD({ player, mode }: Props) {
  return (
    <div className="hud">
      <div className={`hud__turn hud__turn--p${player}`}>
        <span className={`hud__chip hud__chip--p${player}`} />
        {playerLabel(player, mode)}
      </div>
      <button
        className="hud__btn"
        onClick={() => events.emit(Events.MenuRequested)}
      >
        Menu
      </button>
    </div>
  );
}
