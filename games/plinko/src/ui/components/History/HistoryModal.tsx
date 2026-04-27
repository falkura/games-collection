import { usePlinkoStore } from "../../../store/store";
import { getBinColor } from "../../../server/payouts";
import { Audio } from "../../../Audio";
import "./HistoryModal.css";

export function HistoryModal() {
  const open = usePlinkoStore((s) => s.historyOpen);
  const setOpen = usePlinkoStore((s) => s.setHistoryOpen);
  const history = usePlinkoStore((s) => s.history);

  if (!open) return null;

  return (
    <>
      <div className="history-modal__backdrop" onClick={() => setOpen(false)} />
      <div className="history-modal">
        <div className="history-modal__header">
          <span>Bet History</span>
          <button type="button" className="history-modal__close" onClick={() => { Audio.play("close"); setOpen(false); }}>✕</button>
        </div>

        <div className="history-modal__body">
          {history.length === 0 ? (
            <div className="history-modal__empty">No bets yet.</div>
          ) : (
            <table className="history-modal__table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Mult</th>
                  <th>Bet</th>
                  <th>Payout</th>
                  <th>Diff</th>
                  <th>Rows</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h, i) => {
                  const color = getBinColor(h.difficulty, h.rows, h.bin);
                  return (
                    <tr key={h.id} className={h.win ? "history-modal__row--win" : "history-modal__row--lose"}>
                      <td className="history-modal__num">{history.length - i}</td>
                      <td>
                        <span className="history-modal__mult" style={{ color, borderColor: `${color}55`, background: `${color}18` }}>
                          {h.multiplier}×
                        </span>
                      </td>
                      <td>${h.bet.toFixed(2)}</td>
                      <td style={{ color: h.win ? "var(--plinko-accent)" : "var(--plinko-danger)" }}>
                        ${h.payout.toFixed(2)}
                      </td>
                      <td className="history-modal__dim">{h.difficulty}</td>
                      <td className="history-modal__dim">{h.rows}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
