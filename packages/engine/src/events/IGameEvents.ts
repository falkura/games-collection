export enum GameEvent {
  GameFinished = "game:finished",
}

export interface IGameEvents {
  [GameEvent.GameFinished]: (data: Partial<IGameFinishData>) => void;
}

export interface IGameFinishData {
  score: number;
  result: "win" | "lose";
  [key: string]: any;
}
