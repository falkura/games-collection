import { Balance } from "./components/Balance/Balance";
import { BetPanel } from "./components/BetPanel/BetPanel";
import { History } from "./components/History/History";
import { SettingsButton } from "./components/Settings/SettingsButton";
import { SettingsMenu } from "./components/Settings/SettingsMenu";
import { InfoModal } from "./components/Info/InfoModal";

export function App() {
  return (
    <div className="plinko-ui">
      <header className="plinko-ui__top">
        <Balance />
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
    </div>
  );
}
