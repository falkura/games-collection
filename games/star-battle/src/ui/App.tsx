import { useSyncExternalStore } from "react";
import { gameState } from "../state";
import { Menu } from "./components/Menu/Menu";
import { HUD } from "./components/HUD/HUD";
import { WinScreen } from "./components/WinScreen/WinScreen";

export function App() {
  const state = useSyncExternalStore(gameState.subscribe, gameState.get);

  return (
    <>
      {state.screen === "menu" && <Menu />}
      {state.screen === "playing" && (
        <HUD
          size={state.size}
          starsPer={state.starsPer}
          stars={state.stars}
          starsTotal={state.starsTotal}
          elapsed={state.elapsed}
          paused={state.paused}
        />
      )}
      {state.screen === "ended" && (
        <>
          <HUD
            size={state.size}
            starsPer={state.starsPer}
            stars={state.stars}
            starsTotal={state.starsTotal}
            elapsed={state.elapsed}
            paused={false}
          />
          <WinScreen
            size={state.size}
            starsPer={state.starsPer}
            elapsed={state.elapsed}
          />
        </>
      )}
    </>
  );
}
