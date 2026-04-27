import { usePlinkoStore } from "../../../store/store";
import { Audio } from "../../../Audio";
import "./SettingsMenu.css";

export function SettingsMenu() {
  const open = usePlinkoStore((s) => s.settingsOpen);
  const setOpen = usePlinkoStore((s) => s.setSettingsOpen);
  const setInfoOpen = usePlinkoStore((s) => s.setInfoOpen);
  const setHistoryOpen = usePlinkoStore((s) => s.setHistoryOpen);
  const settings = usePlinkoStore((s) => s.settings);
  const setSettings = usePlinkoStore((s) => s.setSettings);

  if (!open) return null;

  return (
    <>
      <div className="settings-menu__backdrop" onClick={() => setOpen(false)} />
      <div className="settings-menu">
        <div className="settings-menu__header">
          <span className="settings-menu__title">Settings</span>
          <button
            type="button"
            className="settings-menu__close"
            onClick={() => { Audio.play("close"); setOpen(false); }}
          >
            ✕
          </button>
        </div>

        <div className="settings-menu__row">
          <label className="settings-menu__label">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M2 5.5h2.5L9 2v12l-4.5-3.5H2a.5.5 0 0 1-.5-.5V6a.5.5 0 0 1 .5-.5Z" fill="currentColor"/>
              <path d="M11 5a4 4 0 0 1 0 6M12.5 3.5a6.5 6.5 0 0 1 0 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
            </svg>
            Volume
          </label>
          <input
            className="settings-menu__slider"
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={settings.volume}
            onChange={(e) =>
              setSettings({ volume: parseFloat(e.target.value) })
            }
          />
          <span className="settings-menu__value">
            {Math.round(settings.volume * 100)}%
          </span>
        </div>

        <button
          type="button"
          className="settings-menu__info-btn"
          onClick={() => {
            Audio.play("click");
            setOpen(false);
            setHistoryOpen(true);
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <rect x="3" y="1.5" width="10" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
            <line x1="5.5" y1="5" x2="10.5" y2="5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            <line x1="5.5" y1="8" x2="10.5" y2="8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            <line x1="5.5" y1="11" x2="8.5" y2="11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          Bet History
        </button>

        <button
          type="button"
          className="settings-menu__info-btn"
          onClick={() => {
            Audio.play("click");
            setOpen(false);
            setInfoOpen(true);
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3"/>
            <line x1="8" y1="7" x2="8" y2="11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="8" cy="4.75" r="0.85" fill="currentColor"/>
          </svg>
          Game Info &amp; Rules
        </button>
      </div>
    </>
  );
}
