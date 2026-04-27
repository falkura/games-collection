import React, { useState, useEffect } from "react";
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
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    if (!open || !plinkoServer) return;
    setLoading(true);
    setPage(0);
    setExpandedId(null);
    plinkoServer.getHistory().then((h) => {
      setHistory(h);
      setLoading(false);
    });
  }, [open]);

  if (!open) return null;

  const totalPages = Math.max(1, Math.ceil(history.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageItems = history.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  const goTo = (p: number) => { Audio.play("click"); setPage(p); setExpandedId(null); };

  const toggleRow = (id: number) => {
    Audio.play("click");
    setExpandedId((prev) => (prev === id ? null : id));
  };

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
          {loading ? (
            <div className="history-modal__loading">
              <span className="history-modal__spinner" />
              Loading…
            </div>
          ) : history.length === 0 ? (
            <div className="history-modal__empty">No bets yet.</div>
          ) : (
            <table className="history-modal__table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Mult</th>
                  <th>Bet</th>
                  <th>Payout</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((h) => {
                  const color = getBinColor(h.difficulty, h.rows, h.bin);
                  const time = new Date(h.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
                  const expanded = expandedId === h.id;
                  return (
                    <React.Fragment key={h.id}>
                      <tr
                        className={`history-modal__row ${expanded ? "history-modal__row--expanded" : ""}`}
                        onClick={() => toggleRow(h.id)}
                      >
                        <td className="history-modal__num">#{h.id}</td>
                        <td>
                          <span className="history-modal__mult" style={{ color, borderColor: `${color}55`, background: `${color}18` }}>
                            {h.multiplier}×
                          </span>
                        </td>
                        <td>${h.bet.toFixed(2)}</td>
                        <td style={{ color: h.payout === h.bet ? "var(--plinko-text-dim)" : h.win ? "var(--plinko-accent)" : "var(--plinko-danger)" }}>
                          ${h.payout.toFixed(2)}
                        </td>
                        <td className="history-modal__dim">{time}</td>
                      </tr>
                      {expanded && (
                        <tr className="history-modal__detail-row">
                          <td colSpan={7}>
                            <div className="history-modal__detail">
                              <div className="history-modal__detail-grid">
                                <span className="history-modal__detail-label">Client ID</span>
                                <span className="history-modal__detail-value history-modal__detail-value--mono">{h.clientId}</span>
                                <span className="history-modal__detail-label">Bin</span>
                                <span className="history-modal__detail-value" style={{ color }}>{h.bin}</span>
                                <span className="history-modal__detail-label">Multiplier</span>
                                <span className="history-modal__detail-value" style={{ color }}>{h.multiplier}×</span>
                                <span className="history-modal__detail-label">Bet</span>
                                <span className="history-modal__detail-value">${h.bet.toFixed(2)}</span>
                                <span className="history-modal__detail-label">Payout</span>
                                <span className="history-modal__detail-value" style={{ color: h.payout === h.bet ? "var(--plinko-text-dim)" : h.win ? "var(--plinko-accent)" : "var(--plinko-danger)" }}>
                                  ${h.payout.toFixed(2)}{h.payout !== h.bet && ` (${h.win ? "WIN" : "LOSS"})`}
                                </span>
                                <span className="history-modal__detail-label">Difficulty</span>
                                <span className="history-modal__detail-value">{h.difficulty}</span>
                                <span className="history-modal__detail-label">Rows</span>
                                <span className="history-modal__detail-value">{h.rows}</span>
                                <span className="history-modal__detail-label">Timestamp</span>
                                <span className="history-modal__detail-value">{new Date(h.timestamp).toLocaleString()}</span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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
