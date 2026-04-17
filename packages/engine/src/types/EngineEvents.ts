export interface EngineEvents {
  "engine:game-started": () => void;
  "engine:game-finished": (data?: any) => void;
  "engine:game-reseted": () => void;
  "engine:settings-updated": (settings: Partial<UISettings>) => void;
  "engine:game-chosen": (gameKey: string) => void;
}

export interface UISettings {
  graphics: "Low" | "Medium" | "High";
}
