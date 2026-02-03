// todo enums
export interface IGameEvents {
  "game:finished": (data: Partial<IGameFinishData>) => void;
}

export interface IGameFinishData {
  score: number;
  result: "win" | "lose";
  [key: string]: any;
}
