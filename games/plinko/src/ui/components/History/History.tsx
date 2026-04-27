import { usePlinkoStore } from "../../../store/store";
import { getBinColor } from "../../../server/payouts";
import "./History.css";

const MAX_VISIBLE = 4;

export function History() {
  const history = usePlinkoStore((s) => s.history);
  const visible = history.slice(0, MAX_VISIBLE);

  return (
    <div className="history">
      <div className="history__title">Last</div>
      <ul className="history__list">
        {visible.map((h, i) => {
          const color = getBinColor(h.difficulty, h.rows, h.bin);
          return (
            <li
              key={h.id}
              className={`history__item ${i === 0 ? "history__item--new" : ""}`}
              style={{
                background: `${color}28`,
                color,
                borderColor: `${color}60`,
              }}
            >
              <span className="history__mult">{h.multiplier}×</span>
            </li>
          );
        })}
        {visible.length === 0 && <li className="history__empty">—</li>}
      </ul>
    </div>
  );
}
