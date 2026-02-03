export enum UIEvent {
  StartGame = "ui:start-game",
  RestartGame = "ui:restart-game",
  PauseGame = "ui:pause-game",
  ResumeGame = "ui:resume-game",
  UseHint = "ui:hint-game",
  SetLevel = "ui:set-level",
  SetDifficulty = "ui:set-difficulty",
  SetSettings = "ui:set-settings",
  OpenMenu = "ui:open-menu",
}

export interface IUIEvents {
  [UIEvent.StartGame]: () => void;
  [UIEvent.RestartGame]: () => void;
  [UIEvent.PauseGame]: () => void;
  [UIEvent.ResumeGame]: () => void;
  [UIEvent.UseHint]: () => void;

  [UIEvent.SetLevel]: (level: number) => void;
  [UIEvent.SetDifficulty]: (level: number) => void;
  [UIEvent.SetSettings]: (settings: Partial<ISettings>) => void;

  [UIEvent.OpenMenu]: () => void;
}

export interface ISettings {
  volume: number;
  music: number;
  graphics: number;
}
