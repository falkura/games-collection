import { useSyncExternalStore } from "react";
import { gameState } from "../state";
import { Menu } from "./components/Menu/Menu";
import { HUD } from "./components/HUD/HUD";
import { GameOver } from "./components/GameOver/GameOver";

export function App() {
  const state = useSyncExternalStore(gameState.subscribe, gameState.get);

  return (
    <>
      {state.screen === "menu" && <Menu />}
      {state.screen === "playing" && (
        <HUD player={state.player} mode={state.mode} />
      )}
      {state.screen === "ended" && (
        <>
          <HUD player={state.player} mode={state.mode} />
          <GameOver winner={state.winner} mode={state.mode} />
        </>
      )}
    </>
  );
}
