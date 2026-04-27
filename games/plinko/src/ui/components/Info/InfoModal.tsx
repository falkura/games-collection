import { usePlinkoStore } from "../../../store/store";
import "./InfoModal.css";

export function InfoModal() {
  const open = usePlinkoStore((s) => s.infoOpen);
  const setOpen = usePlinkoStore((s) => s.setInfoOpen);

  if (!open) return null;

  return (
    <>
      <div className="info-modal__backdrop" onClick={() => setOpen(false)} />
      <div className="info-modal" role="dialog" aria-modal="true">
        <div className="info-modal__header">
          <span>How to play</span>
          <button
            type="button"
            className="info-modal__close"
            onClick={() => setOpen(false)}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="info-modal__body">
          <p>
            Set your bet, choose a difficulty and number of rows, then press{" "}
            <b>Bet</b> to drop a ball. The ball bounces through the pegs and
            lands in one of the bins. Your payout equals your bet times the
            bin's multiplier.
          </p>
          <ul>
            <li>
              <b>Difficulty</b> — Low pays evenly; Expert has the highest
              top-row multipliers but the middle bins return less than your bet.
            </li>
            <li>
              <b>Rows</b> — More rows means more bins and a wider multiplier
              spread.
            </li>
            <li>
              <b>Autoplay</b> — Drops a ball every 0.7s until you turn it off
              or run out of balance.
            </li>
            <li>
              <b>1/2</b> and <b>2×</b> quickly halve or double your bet.
            </li>
          </ul>
          <p className="info-modal__note">
            Demo balance only — no real money is involved.
          </p>
        </div>
      </div>
    </>
  );
}
