import { usePlinkoStore } from "../../../store/store";
import "./SettingsButton.css";

export function SettingsButton() {
  const setSettingsOpen = usePlinkoStore((s) => s.setSettingsOpen);
  const open = usePlinkoStore((s) => s.settingsOpen);

  return (
    <button
      type="button"
      className="settings-button"
      onClick={() => setSettingsOpen(!open)}
      aria-label="Settings"
    >
      ⚙️
    </button>
  );
}
