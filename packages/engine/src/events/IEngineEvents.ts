import { IGameFinishData } from "./IGameEvents";

// todo enums
export interface IEngineEvents {
  "engine:game-started": () => void;
  "engine:game-finished": (data: Partial<IGameFinishData>) => void;
  "engine:game-paused": () => void;
  "engine:game-resumed": () => void;
  "engine:game-reseted": () => void;
  "engine:game-hint-used": () => void;
  "engine:game-closed": () => void;

  // Wrapper event
  "engine:game-chosen": (gameKey: string) => void;
}
