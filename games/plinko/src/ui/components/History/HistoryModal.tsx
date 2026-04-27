import { useState, useEffect } from "react";
import { usePlinkoStore } from "../../../store/store";
import { getBinColor } from "../../../server/payouts";
import { plinkoServer, ServerHistoryEntry } from "../../../server/PlinkoServer";
import { Audio } from "../../../Audio";
import "./HistoryModal.css";

const PAGE_SIZE = 30;

export function HistoryModal() {
  const open = usePlinkoStore((s) => s.historyOpen);
  const setOpen = usePlinkoStore((s) => s.setHistoryOpen);
  const [history, setHistory] = useState<ServerHistoryEntry[]>([]);
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (!open) return;
    setHistory(plinkoServer?.getHistory() ?? []);
    setPage(0);
  }, [open]);

  if (!open) return null;

  const totalPages = Math.max(1, Math.ceil(history.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageItems = history.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  const goTo = (p: number) => { Audio.play("click"); setPage(p); };

  return (
    <>
      <div className="history-modal__backdrop" onClick={() => setOpen(false)} />
      <div className="history-modal">
        <div className="history-modal__header">
          <div>
            <span>Bet History</span>
            {plinkoServer && (
              <span className="history-modal__session">session {plinkoServer.sessionId}</span>
            )}
          </div>
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
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((h) => {
                  const color = getBinColor(h.difficulty, h.rows, h.bin);
                  const time = new Date(h.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
                  return (
                    <tr key={h.id} className={h.win ? "history-modal__row--win" : "history-modal__row--lose"}>
                      <td className="history-modal__num">#{h.id}</td>
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
                      <td className="history-modal__dim">{time}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="history-modal__pagination">
          <button
            type="button"
            className="history-modal__page-btn"
            disabled={safePage === 0}
            onClick={() => goTo(safePage - 1)}
          >
            ‹
          </button>
          <span className="history-modal__page-info">
            {safePage + 1} / {totalPages}
          </span>
          <button
            type="button"
            className="history-modal__page-btn"
            disabled={safePage === totalPages - 1}
            onClick={() => goTo(safePage + 1)}
          >
            ›
          </button>
        </div>
      </div>
    </>
  );
}
