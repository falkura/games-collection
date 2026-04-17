export interface GameInstance {
  start(): void;
  finish(): void;
  pause(): void;
  resume(): void;
  reset(): void;
  resize(): void;
}

export type GameConstructor<T extends GameInstance = GameInstance> = new (
  config: IGameConfig,
) => T;
