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
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="M19.4 13.5l1.6.9-2 3.4-1.8-.7a7.5 7.5 0 01-2 1.2l-.3 1.9h-3.8l-.3-1.9a7.5 7.5 0 01-2-1.2l-1.8.7-2-3.4 1.6-.9a7.6 7.6 0 010-3l-1.6-.9 2-3.4 1.8.7a7.5 7.5 0 012-1.2L11.1 4h3.8l.3 1.9a7.5 7.5 0 012 1.2l1.8-.7 2 3.4-1.6.9a7.6 7.6 0 010 3z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
