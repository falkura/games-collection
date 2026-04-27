import { usePlinkoStore } from "../../../store/store";
import { Audio } from "../../../Audio";
import "./SettingsButton.css";

export function SettingsButton() {
  const setSettingsOpen = usePlinkoStore((s) => s.setSettingsOpen);
  const open = usePlinkoStore((s) => s.settingsOpen);

  return (
    <button
      type="button"
      className="settings-button"
      onClick={() => { Audio.play("click"); setSettingsOpen(!open); }}
      aria-label="Settings"
    >
      <svg width="18" height="14" viewBox="0 0 18 14" fill="none" aria-hidden="true">
        <rect width="18" height="2" rx="1" fill="currentColor"/>
        <rect y="6" width="18" height="2" rx="1" fill="currentColor"/>
        <rect y="12" width="18" height="2" rx="1" fill="currentColor"/>
      </svg>
    </button>
  );
}
