import { IGameFinishData } from "./IGameEvents";

export enum EngineEvent {
  GameStarted = "engine:game-started",
  GameFinished = "engine:game-finished",
  GamePaused = "engine:game-paused",
  GameResumed = "engine:game-resumed",
  GameReseted = "engine:game-reseted",
  GameHintUsed = "engine:game-hint-used",
  GameClosed = "engine:game-closed",

  // Wrapper event
  GameChosen = "engine:game-chosen",
}

export interface IEngineEvents {
  [EngineEvent.GameStarted]: () => void;
  [EngineEvent.GameFinished]: (data: Partial<IGameFinishData>) => void;
  [EngineEvent.GamePaused]: () => void;
  [EngineEvent.GameResumed]: () => void;
  [EngineEvent.GameReseted]: () => void;
  [EngineEvent.GameHintUsed]: () => void;
  [EngineEvent.GameClosed]: () => void;

  // Wrapper event
  [EngineEvent.GameChosen]: (gameKey: string) => void;
}
