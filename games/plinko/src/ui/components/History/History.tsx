import { usePlinkoStore } from "../../../store/store";
import "./History.css";

export function History() {
  const history = usePlinkoStore((s) => s.history);

  return (
    <div className="history">
      <div className="history__title">History</div>
      <ul className="history__list">
        {history.map((h, i) => (
          <li
            key={h.id}
            className={`history__item ${h.win ? "history__item--win" : "history__item--lose"} ${i === 0 ? "history__item--new" : ""}`}
            style={{ animationDelay: i === 0 ? "0s" : undefined }}
          >
            <span className="history__mult">{h.multiplier}×</span>
          </li>
        ))}
        {history.length === 0 && (
          <li className="history__empty">No drops yet</li>
        )}
      </ul>
    </div>
  );
}
