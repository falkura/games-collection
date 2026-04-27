import { usePlinkoStore } from "../../../store/store";
import "./SettingsMenu.css";

export function SettingsMenu() {
  const open = usePlinkoStore((s) => s.settingsOpen);
  const setOpen = usePlinkoStore((s) => s.setSettingsOpen);
  const setInfoOpen = usePlinkoStore((s) => s.setInfoOpen);
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
            onClick={() => setOpen(false)}
          >
            ✕
          </button>
        </div>

        <div className="settings-menu__row">
          <label className="settings-menu__label">🔊 Volume</label>
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
            setOpen(false);
            setInfoOpen(true);
          }}
        >
          📋 Game Info &amp; Rules
        </button>
      </div>
    </>
  );
}
