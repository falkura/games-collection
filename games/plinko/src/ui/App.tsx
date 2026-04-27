import { BetPanel } from "./components/BetPanel/BetPanel";
import { History } from "./components/History/History";
import { HistoryModal } from "./components/History/HistoryModal";
import { SettingsButton } from "./components/Settings/SettingsButton";
import { SettingsMenu } from "./components/Settings/SettingsMenu";
import { InfoModal } from "./components/Info/InfoModal";

export function App() {
  return (
    <div className="plinko-ui">
      <header className="plinko-ui__top">
        <div className="plinko-ui__title">PLINKO</div>
        <SettingsButton />
      </header>

      <aside className="plinko-ui__history">
        <History />
      </aside>

      <footer className="plinko-ui__bottom">
        <BetPanel />
      </footer>

      <SettingsMenu />
      <InfoModal />
      <HistoryModal />
    </div>
  );
}
